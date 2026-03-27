export class DuplicateEntityError extends Error {
    constructor(protected readonly entityName: string) {
        super(`A ${entityName} with given values already exists.`);
        this.name = "DuplicateEntityError";
    }
}