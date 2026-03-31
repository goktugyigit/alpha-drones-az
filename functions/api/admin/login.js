// SHA-256 hash helper
async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getCorsHeaders(request) {
    const url = new URL(request.url);
    return {
        'Access-Control-Allow-Origin': `${url.protocol}//${url.host}`,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const corsHeaders = getCorsHeaders(request);

    try {
        const body = await request.json();
        const { password } = body;
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

        // ── Turnstile verification ──
        const turnstileToken = body['cf-turnstile-response'];
        if (!turnstileToken) {
            return new Response(JSON.stringify({ error: 'Turnstile verification required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        const turnstileResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: env.TURNSTILE_SECRET_KEY,
                response: turnstileToken,
            }),
        });

        const turnstileOutcome = await turnstileResult.json();
        if (!turnstileOutcome.success) {
            return new Response(JSON.stringify({ error: 'Turnstile verification failed' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // ── Rate limiting: 5 failed attempts per IP in 15 minutes ──
        try {
            const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
            const attempts = await env.ADMIN_DB.prepare(
                "SELECT COUNT(*) as cnt FROM admin_logs WHERE action = 'login_failed' AND ip = ? AND created_at > ?"
            ).bind(ip, fifteenMinAgo).first();

            if (attempts && attempts.cnt >= 5) {
                return new Response(JSON.stringify({ error: 'Too many attempts. Try again later.' }), {
                    status: 429,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }
        } catch {}

        // ── Resolve password ──
        let authenticated = false;
        const inputHash = await sha256(password);
        let hasDbHash = false;

        // 1. Check DB for hashed password (set by change-password or auto-migration)
        try {
            const dbPw = await env.ADMIN_DB.prepare(
                "SELECT value FROM admin_settings WHERE key = 'password_hash'"
            ).first();

            if (dbPw && dbPw.value) {
                hasDbHash = true;
                authenticated = (inputHash === dbPw.value);
            }
        } catch {}

        // 2. Fallback to env.ADMIN_PASSWORD ONLY if no DB hash exists yet (first-time setup)
        //    Once a hash is in DB (from migration or password change), env is never used again
        if (!hasDbHash) {
            const envPassword = env.ADMIN_PASSWORD;
            if (!envPassword) {
                return new Response(JSON.stringify({ error: 'Server misconfigured: no password set' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            if (password === envPassword) {
                authenticated = true;
                // Auto-migrate: store hashed password in DB
                try {
                    await env.ADMIN_DB.prepare(
                        "INSERT OR REPLACE INTO admin_settings (key, value) VALUES ('password_hash', ?)"
                    ).bind(inputHash).run();
                } catch {}
            }
        }

        if (!authenticated) {
            // Log failed attempt
            try {
                await env.ADMIN_DB.prepare(
                    'INSERT INTO admin_logs (action, details, ip) VALUES (?, ?, ?)'
                ).bind('login_failed', 'Wrong password', ip).run();
            } catch {}

            return new Response(JSON.stringify({ error: 'Wrong password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // ── Create JWT token (24h expiry) ──
        const secret = env.ADMIN_SECRET;
        if (!secret) {
            return new Response(JSON.stringify({ error: 'Server misconfigured: ADMIN_SECRET not set' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            role: 'admin',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400,
        }));

        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign(
            'HMAC',
            key,
            new TextEncoder().encode(`${header}.${payload}`)
        );

        const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const token = `${header}.${payload}.${signature}`;

        // Log successful login
        try {
            await env.ADMIN_DB.prepare(
                'INSERT INTO admin_logs (action, details, ip) VALUES (?, ?, ?)'
            ).bind('login_success', 'Admin logged in', ip).run();
        } catch {}

        return new Response(JSON.stringify({ token }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}

export async function onRequestOptions(context) {
    return new Response(null, { headers: getCorsHeaders(context.request) });
}
