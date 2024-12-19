import 'dotenv/config';
import assert from 'assert'
import { expect } from 'chai';
import sinon from 'sinon';
import UserModel from '../src/models/clients/UserModel.js';
import UserController from '../src/controllers/clients/UserController.js';
import { logging } from '../src/utils/logging.js'
import { createMocks } from './helpers/mocks.js';

console.log(UserModel)

const logger = logging.getLogger('api');
const test_logger = logging.getLogger('test');
const transport_console = new logging.transports.Console()

logger.addTransport(transport_console);
test_logger.addTransport(transport_console);
logger.setLevel('unit')
test_logger.setLevel('unit')

describe('UserController - CREATE, READ, UPDATE, DELETE', () => {
    let createSpy;
    let updateSpy;
    let deleteSpy;
    let queryStub;
    let req;
    let res;
    let next;

    beforeEach(() => {
        createSpy = sinon.spy(UserModel, 'create'); // spy to not block the default behaviour
        updateSpy = sinon.spy(UserModel, 'update');
        deleteSpy = sinon.spy(UserModel, 'delete');
        queryStub = sinon.stub(UserModel, 'query'); // stub to block the default behaviour
        ({req, res, next} = createMocks()); // prepare the fake request
    })

    afterEach(() => {
        sinon.restore();
        ({req, res, next} = createMocks());
    })

    it('#create', async () => {
        const expectedPayload = {
            module: 'user',
            action: 'save',
            createUser: 1, // means we want to create a new user
            id: 0, // means create a new record
            active: "1",
            id_group: 3,
            username: 'Expected username',
            email: 'Expected@email.com',
            password: 'Expected password',
        }

        req.body = {
            username: 'Expected username',
            email: 'Expected@email.com',
            password: 'Expected password',
        };

        await UserController.create(req, res, next);
        assert(createSpy.calledOnce, 'create method should have been called once');
        assert(queryStub.calledOnce, 'query method should have been called once');

        const actualPayload = queryStub.getCall(0).args[0];
        assert.deepEqual(actualPayload, expectedPayload, 'payload should match expected payload');

    })
})
/*






    it('should create a new user successfully', async () => {

        // simulate query behaviour. dont worry about response itself
        const mockQueryResponse = { success: true, response: {} };  // Ajuste conforme necessário
        userModelMock.resolves(mockQueryResponse);

        // example data sent to creation method
        const userData = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'testpassword',
        };
        req.body = userData

        const expectedPayload = {
            module: 'user',
            action: 'save',
            createUser: 1, // means we want to create a new user
            id: 0, // means create a new record
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'testpassword',
        }

        await userController.create(req, res, next);
        assert(userModelMock.calledOnce, `Expected the mock query to be called once, but it was called ${userModelMock.callCount} times`);


        const actualPayload = userModelMock.getCall(0).args[0]; // first arg of first call

        // assert.deepEqual(actualPayload, expectedPayload, 'Payload sent to query does not match expected one.');

        // check values
        Object.keys(expectedPayload).forEach(key => {
            expect(actualPayload).to.have.property(key, expectedPayload[key]);
        });
    })
})

*/