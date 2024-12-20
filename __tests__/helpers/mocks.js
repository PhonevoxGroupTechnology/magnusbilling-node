import sinon from 'sinon';

export const createMocks = (body = {}) => {
    const req = {
        body,
        query: {},
        params: {},
        logprefix: '[MOCK]',
    }

    const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
    }

    const next = (...args) => {
        console.log(`[MOCK-NEXT] ${args.join(' ')}`);
    }

    return { req, res, next };
}