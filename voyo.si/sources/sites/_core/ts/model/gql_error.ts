class GqlError extends Error {
    tMessage: string = ''; // = translated message
    code: string = '';
    status: number = 0;
    errors: Array<any>; // Original errors

    constructor(errors: Array<any>) {
        const firstError = errors[0]?.extensions?.message || errors[0] || {};
        super(firstError.tMessage || firstError.message || 'GraphQL Error');

        this.name = 'GqlError';
        this.errors = errors;
        this.code = firstError.code || '';
        this.status = firstError.status || 0;

        // Maintain proper prototype chain
        Object.setPrototypeOf(this, GqlError.prototype);
    }
}

export default GqlError;
