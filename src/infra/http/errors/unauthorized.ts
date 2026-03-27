export class UnauthorizedError extends Error {
    readonly status = 401;

    constructor() {
        super("Unauthorized");
        this.name = "UnauthorizedError";
    }
};