export class ApiError extends Error {
    status;
    code;
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
export const badRequest = (msg) => new ApiError(400, 'bad_request', msg);
export const unauthorized = () => new ApiError(401, 'unauthorized', 'missing or invalid credentials');
export const forbidden = (msg = 'forbidden') => new ApiError(403, 'forbidden', msg);
export const notFound = (msg = 'not found') => new ApiError(404, 'not_found', msg);
export const conflict = (msg) => new ApiError(409, 'conflict', msg);
//# sourceMappingURL=errors.js.map