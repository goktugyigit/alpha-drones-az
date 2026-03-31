async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getCorsHeaders(request) {
    const url = new URL(request.url);
    return {
        'Access-Control-Allow-Origin': `${url.protocol}//${url.host}`,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const corsHeaders = getCorsHeaders(request);

    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        if (newPassword.length < 6) {
            return new Response(JSON.stringify({ error: 'too_short' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // ── Verify current password ──
        const currentHash = await sha256(currentPassword);
        let verified = false;

        // 1. Check DB hash
        try {
            const dbPw = await env.ADMIN_DB.prepare(
                "SELECT value FROM admin_settings WHERE key = 'password_hash'"
            ).first();
            if (dbPw && dbPw.value) {
                verified = (currentHash === dbPw.value);
            }
        } catch {}

        // 2. Fallback to env variable
        if (!verified) {
            const envPassword = env.ADMIN_PASSWORD;
            if (envPassword && currentPassword === envPassword) {
                verified = true;
            }
        }

        if (!verified) {
            return new Response(JSON.stringify({ error: 'wrong_current' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // ── Store new password hash ──
        const newHash = await sha256(newPassword);
        await env.ADMIN_DB.prepare(
            "INSERT OR REPLACE INTO admin_settings (key, value) VALUES ('password_hash', ?)"
        ).bind(newHash).run();

        // Log
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        try {
            await env.ADMIN_DB.prepare(
                'INSERT INTO admin_logs (action, details, ip) VALUES (?, ?, ?)'
            ).bind('password_changed', 'Admin password changed', ip).run();
        } catch {}

        return new Response(JSON.stringify({ success: true }), {
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
