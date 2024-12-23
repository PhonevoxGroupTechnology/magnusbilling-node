import sinon from 'sinon';
import { logging } from '../../src/utils/logging.js'

const test_logger = logging.getLogger("test.mocks");

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
        test_logger.error(`[createMocks:next] ${args.join(' ')}`);
    }

    return { req, res, next };
}