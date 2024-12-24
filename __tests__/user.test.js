import 'dotenv/config';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { logging } from '../src/utils/logging.js'
import { createMocks } from './helpers/mocks.js';
const { assert, expect } = chai;
// for this test
import UserModel from '../src/models/clients/UserModel.js';
import UserController from '../src/controllers/clients/UserController.js';

chai.use(sinonChai);

// const api_logger = logging.getLogger("api");
const test_logger = logging.getLogger("test");
const transport_console = new logging.transports.Console({level: logging.DEBUG})

// api_logger.addTransport(transport_console);
test_logger.addTransport(transport_console);

describe("UserController mocking: payload formatting to Model.query", () => {
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

    it('should format to create', async () => {
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

        // test
        await UserController.create(req, res, next);

        // assertions
        expect(UserModelMock.spy.create).to.have.been.calledOnce
        expect(UserModelMock.stub.query).to.have.been.calledOnce
        assert.deepEqual(UserModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to query:req.query", async () => {
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

        // test
        await UserController.query(req, res, next);
        
        // assertions
        expect(UserModelMock.stub.query).to.have.been.calledOnce
        chai.assert.deepEqual(UserModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to query:req.params with id", async () => {
        const expectedPayload = { 
            "module": "user", 
            "action": "read",
            "filter": "[{\"type\":\"string\",\"field\":\"id\",\"value\":\"Expected id\",\"comparison\":\"eq\"}]",
        }

        req.params = {
            "id": "Expected id",
        }

        // test
        await UserController.query(req, res, next);
        
        // assertions
        expect(UserModelMock.stub.query).to.have.been.calledOnce
        assert.deepEqual(UserModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to query:req.params with username", async () => {
        const expectedPayload = { 
            "module": "user", 
            "action": "read",
            "filter": "[{\"type\":\"string\",\"field\":\"username\",\"value\":\"Expected username\",\"comparison\":\"eq\"}]",
        }

        req.params = {
            "username": "Expected username",
        }
    
        // test
        await UserController.query(req, res, next);
        
        // assertions
        expect(UserModelMock.stub.query).to.have.been.calledOnce
        assert.deepEqual(UserModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to update:req.params with id", async () => {
        const expectedPayload = {
            "module": "user",
            "action": "save",
            "id": 52416532054094,
            "password": "Expected password",
            "username": "Expected username",
            "email": "Expected@email.com",
        }

        req.body = {
            "username": "Expected username",
            "email": "Expected@email.com",
            "password": "Expected password",
        }

        req.params = {
            "id": 52416532054094
        }

        // test
        await UserController.update(req, res, next);

        // assertions
        expect(UserModelMock.stub.query).to.have.been.calledOnce
        assert.deepEqual(UserModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")

    })

})
