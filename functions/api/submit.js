export async function onRequestPost(context) {
    const { request, env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const data = await request.json();

        // Turnstile verification
        const turnstileToken = data['cf-turnstile-response'];
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

        // Validate required fields
        if (!data.name || !data.email || !data.service || !data.message) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // Validate field lengths to prevent DB bloat
        const limits = {
            name: 100, email: 150, phone: 30, service: 50, message: 1000,
            building_type: 50, floors: 10, area_size: 50, survey_purpose: 50,
            inspection_building_type: 50, inspection_type: 50,
            object_type: 50, intended_use: 50,
            crop_type: 50, area_ha: 20,
            spray_crop_type: 50, spray_area_ha: 20, season: 20,
            patrol_frequency: 50, camera_type: 30,
            space_type: 50, access_method: 30, lang: 5
        };
        for (const [field, max] of Object.entries(limits)) {
            if (data[field] && String(data[field]).length > max) {
                return new Response(JSON.stringify({ error: `Field "${field}" exceeds ${max} characters` }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }
        }

        await env.DB.prepare(`
            INSERT INTO submissions (
                name, email, phone, service, message,
                building_type, floors,
                area_size, survey_purpose,
                inspection_building_type, inspection_type,
                object_type, intended_use,
                crop_type, area_ha,
                spray_crop_type, spray_area_ha, season,
                patrol_frequency, camera_type,
                space_type, access_method,
                lang
            ) VALUES (
                ?1, ?2, ?3, ?4, ?5,
                ?6, ?7,
                ?8, ?9,
                ?10, ?11,
                ?12, ?13,
                ?14, ?15,
                ?16, ?17, ?18,
                ?19, ?20,
                ?21, ?22,
                ?23
            )
        `).bind(
            data.name,
            data.email,
            data.phone || null,
            data.service,
            data.message,
            data.building_type || null,
            data.floors || null,
            data.area_size || null,
            data.survey_purpose || null,
            data.inspection_building_type || null,
            data.inspection_type || null,
            data.object_type || null,
            data.intended_use || null,
            data.crop_type || null,
            data.area_ha || null,
            data.spray_crop_type || null,
            data.spray_area_ha || null,
            data.season || null,
            data.patrol_frequency || null,
            data.camera_type || null,
            data.space_type || null,
            data.access_method || null,
            data.lang || 'en'
        ).run();

        return new Response(JSON.stringify({ success: true }), {
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

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
