import 'dotenv/config';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import UserModel from '../src/models/clients/UserModel.js';
import UserController from '../src/controllers/clients/UserController.js';
import { logging } from '../src/utils/logging.js'
import { createMocks } from './helpers/mocks.js';

chai.use(sinonChai);
const { expect } = chai;

const logger = logging.getLogger("api");
const test_logger = logging.getLogger("test");
const transport_console = new logging.transports.Console()

logger.addTransport(transport_console);
test_logger.addTransport(transport_console);
logger.setLevel("unit")
test_logger.setLevel("unit")

describe("UserController payload formatting to Model.query", () => {
    let UserModelMock = {
        spy: {
            create: undefined,
            update: undefined,
            delete: undefined,
            query: undefined, // not used
        },
        stub: {
            create: undefined, // not used
            update: undefined, // not used
            delete: undefined, // not used
            query: undefined,
        }
    }
    let createSpy;
    let updateSpy;
    let deleteSpy;
    let UserModelQuery;
    let req;
    let res;
    let next;

    beforeEach(() => {
        UserModelMock.spy.create = sinon.spy(UserModel, "create");
        UserModelMock.spy.update = sinon.spy(UserModel, "update");
        UserModelMock.spy.delete = sinon.spy(UserModel, "delete");
        UserModelMock.stub.query = sinon.stub(UserModel, "query");
        UserModelMock.stub.query.resolves({ success: true, message: "Mock response", response: {"Mock": "response"} });
        ({ req, res, next } = createMocks()); // prepare the fake request
    })

    afterEach(() => {
        sinon.restore();
        ({ req, res, next } = createMocks());
    })

    it('should format to create an user', async () => {
        const expectedPayload = {
            "module": "user",
            "action": "save",
            "createUser": 1, // means we want to create a new user
            "id": 0, // means create a new record
            "active": "1",
            "id_group": 3,
            "username": "Expected username",
            "email": "Expected@email.com",
            "password": "Expected password",
        }

        req.body = {
            "username": "Expected username",
            "email": "Expected@email.com",
            "password": "Expected password",
        };

        await UserController.create(req, res, next);

        expect(UserModelMock.spy.create).to.have.been.calledOnce
        expect(UserModelMock.stub.query).to.have.been.calledOnce.calledWithMatch(expectedPayload)
    })

    it("should format to search an user via req.query", async () => {
        const expectedPayload = { 
            "module": "user", 
            "action": "read",
            "filter": "[{\"type\":\"string\",\"field\":\"username\",\"value\":\"Expected username\",\"comparison\":\"eq\"},{\"type\":\"string\",\"field\":\"password\",\"value\":\"Expected password\",\"comparison\":\"eq\"},{\"type\":\"string\",\"field\":\"id\",\"value\":\"Expected id\",\"comparison\":\"eq\"}]",
        }

        req.query = {
            "id": "Expected id",
            "username": "Expected username",
            "password": "Expected password",
        }

        await UserController.query(req, res, next);
        expect(UserModelMock.stub.query).to.have.been.calledOnce.calledWithMatch(expectedPayload)
    })

    it("should format to find an user via id in req.params", async () => {
        const expectedPayload = { 
            "module": "user", 
            "action": "read",
            "filter": "[{\"type\":\"string\",\"field\":\"id\",\"value\":\"Expected id\",\"comparison\":\"eq\"}]",
        }

        req.params = {
            "id": "Expected id",
        }

        await UserController.query(req, res, next);
        expect(UserModelMock.stub.query).to.have.been.calledOnce.calledWithMatch(expectedPayload)
    })

    it("should format to find an user via username in req.params", async () => {
        const expectedPayload = { 
            "module": "user", 
            "action": "read",
            "filter": "[{\"type\":\"string\",\"field\":\"username\",\"value\":\"Expected username\",\"comparison\":\"eq\"}]",
        }

        req.params = {
            "username": "Expected username",
        }

        await UserController.query(req, res, next);
        expect(UserModelMock.stub.query).to.have.been.calledOnce.calledWithMatch(expectedPayload)
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