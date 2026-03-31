export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // Derive CORS origin from request (same-origin only)
    const corsOrigin = `${url.protocol}//${url.host}`;
    const corsHeaders = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // Login endpoint doesn't need JWT auth
    if (url.pathname === '/api/admin/login') {
        return next();
    }

    // Check Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    // Require ADMIN_SECRET to be configured
    const secret = env.ADMIN_SECRET;
    if (!secret) {
        return new Response(JSON.stringify({ error: 'Server misconfigured: ADMIN_SECRET not set' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const token = authHeader.slice(7);

    try {
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const [headerB64, payloadB64, signatureB64] = token.split('.');
        const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
        const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

        const valid = await crypto.subtle.verify('HMAC', key, signature, data);
        if (!valid) throw new Error('Invalid signature');

        const payload = JSON.parse(atob(payloadB64));
        if (payload.exp && payload.exp < Date.now() / 1000) {
            throw new Error('Token expired');
        }

        // Attach CORS headers to downstream responses
        const response = await next();
        const newResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));
        return newResponse;

    } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
