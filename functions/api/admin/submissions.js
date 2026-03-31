function getCorsHeaders(request) {
    const url = new URL(request.url);
    return {
        'Access-Control-Allow-Origin': `${url.protocol}//${url.host}`,
        'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

// GET: List submissions
export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const service = url.searchParams.get('service');
    const search = url.searchParams.get('search');
    const offset = (page - 1) * limit;

    try {
        let countQuery = 'SELECT COUNT(*) as total FROM submissions WHERE 1=1';
        let dataQuery = 'SELECT * FROM submissions WHERE 1=1';
        const bindings = [];

        if (service) {
            countQuery += ' AND service = ?';
            dataQuery += ' AND service = ?';
            bindings.push(service);
        }

        if (search) {
            countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            dataQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchTerm = `%${search}%`;
            bindings.push(searchTerm, searchTerm, searchTerm);
        }

        dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const countResult = await env.DB.prepare(countQuery).bind(...bindings).first();
        const dataResult = await env.DB.prepare(dataQuery).bind(...bindings, limit, offset).all();

        return new Response(JSON.stringify({
            submissions: dataResult.results,
            total: countResult.total,
            page,
            limit,
            totalPages: Math.ceil(countResult.total / limit),
        }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}

// DELETE: Delete one or multiple submissions
export async function onRequestDelete(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);
    const id = url.searchParams.get('id');
    const ids = url.searchParams.get('ids');

    // Collect IDs to delete
    let deleteIds = [];
    if (ids) {
        deleteIds = ids.split(',').map(s => s.trim()).filter(s => /^\d+$/.test(s));
    } else if (id) {
        deleteIds = [id];
    }

    if (!deleteIds.length) {
        return new Response(JSON.stringify({ error: 'Missing id or ids' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    try {
        const placeholders = deleteIds.map(() => '?').join(',');
        await env.DB.prepare(`DELETE FROM submissions WHERE id IN (${placeholders})`).bind(...deleteIds).run();

        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        try {
            const detail = deleteIds.length === 1
                ? `Deleted submission #${deleteIds[0]}`
                : `Bulk deleted ${deleteIds.length} submissions: #${deleteIds.join(', #')}`;
            await env.ADMIN_DB.prepare(
                'INSERT INTO admin_logs (action, details, ip) VALUES (?, ?, ?)'
            ).bind('delete_submission', detail, ip).run();
        } catch {}

        return new Response(JSON.stringify({ success: true, deleted: deleteIds.length }), {
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
