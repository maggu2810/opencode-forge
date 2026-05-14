import { ApiError } from './errors';
export function json(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
        },
    });
}
export function ok(data, status = 200) {
    return json(status, { ok: true, data });
}
export function errorResponse(err) {
    if (err instanceof ApiError) {
        return json(err.status, {
            ok: false,
            error: {
                code: err.code,
                message: err.message,
            },
        });
    }
    if (err instanceof Error) {
        return json(500, {
            ok: false,
            error: {
                code: 'internal_error',
                message: err.message,
            },
        });
    }
    return json(500, {
        ok: false,
        error: {
            code: 'internal_error',
            message: 'unknown error',
        },
    });
}
//# sourceMappingURL=response.js.map