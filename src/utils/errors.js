export class QueryError extends Error {
    constructor(message) {
        super(message);
        this.name = "QueryError";
        this.message = message;
    }
}

export class MagnusError extends Error {
    constructor(message) {
        super(message);
        this.name = "MagnusError";
        this.message = message;
    }
}