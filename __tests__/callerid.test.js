import 'dotenv/config';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { logging } from '../src/utils/logging.js'
import { createMocks } from './helpers/mocks.js';
const { assert, expect } = chai;
// for this test
import CalleridModel from '../src/models/clients/CalleridModel.js';
import CalleridController from '../src/controllers/clients/CalleridController.js';

chai.use(sinonChai);

const api_logger = logging.getLogger("api");
const test_logger = logging.getLogger("test");
const transport_console = new logging.transports.Console({level: logging.TRACE})

api_logger.addTransport(transport_console);
test_logger.addTransport(transport_console);

describe("CalleridController mocking: payload formatting to Model.query", () => {
    let CalleridModelMock = {
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
    let CallerIdControllerMock = {
        stub: {
            getId: undefined,
        }
    }
    
    let req;
    let res;
    let next;

    beforeEach(() => {
        CalleridModelMock.spy.create = sinon.spy(CalleridModel, "create");
        CalleridModelMock.spy.update = sinon.spy(CalleridModel, "update");
        CalleridModelMock.spy.delete = sinon.spy(CalleridModel, "delete");
        CalleridModelMock.stub.query = sinon.stub(CalleridModel, "query");
        CallerIdControllerMock.stub.getId = sinon.stub(CalleridController, "getId");
        CalleridModelMock.stub.query.resolves({ success: true, message: "Mock response", data: { "Mock": "response" } });
        CallerIdControllerMock.stub.getId.resolves([52416532054094]);
        ({ req, res, next } = createMocks()); // prepare the fake request
    })

    afterEach(() => {
        sinon.restore();
        ({ req, res, next } = createMocks());
    })

    it("should format to create", async () => {
        CallerIdControllerMock.stub.getId.resolves();
        const expectedPayload = {
            "module": "callerid",
            "action": "save",
            "cid": "Expected cid",
            "id_user": 52416532054094,
            "id": 0,
        }

        req.body = {
            "id_user": 52416532054094,
            "cid": "Expected cid",
        };

        // test
        await CalleridController.create(req, res, next);

        // assertions
        expect(CalleridModelMock.spy.create).to.have.been.calledOnce
        expect(CalleridModelMock.stub.query).to.have.been.calledOnce

        const payload = CalleridModelMock.stub.query.getCall(0).args[0]
        assert.deepEqual(payload, expectedPayload, "Payload to create an record is different from what we've expected to receive.")
    })

    it("should format to query:req.query", async () => {
        const expectedPayload = {
            "module": "callerid",
            "action": "read",
            "filter": "[{\"type\":\"string\",\"field\":\"cid\",\"value\":\"Expected cid\",\"comparison\":\"eq\"},{\"type\":\"number\",\"field\":\"id_user\",\"value\":52416532054094,\"comparison\":\"eq\"}]"
        }

        req.query = {
            "cid": "Expected cid",
            "id_user": 52416532054094,
        }

        // test
        await CalleridController.query(req, res, next);

        // assertions
        expect(CalleridModelMock.stub.query).to.have.been.calledOnce
        chai.assert.deepEqual(CalleridModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to query:req.params with id", async () => {
        const expectedPayload = {
            "module": "callerid",
            "action": "read",
            "filter": "[{\"type\":\"number\",\"field\":\"id\",\"value\":52416532054094,\"comparison\":\"eq\"}]"
        }

        req.params = {
            "id": 52416532054094
        }

        // test
        await CalleridController.query(req, res, next);

        // assertions
        expect(CalleridModelMock.stub.query).to.have.been.calledOnce
        chai.assert.deepEqual(CalleridModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to query:req.params with cid", async () => {
        const expectedPayload = {
            "module": "callerid",
            "action": "read",
            "filter": "[{\"type\":\"string\",\"field\":\"cid\",\"value\":\"Expected cid\",\"comparison\":\"eq\"}]"
        }

        req.params = {
            "cid": "Expected cid"
        }

        // test
        await CalleridController.query(req, res, next);

        // assertions
        expect(CalleridModelMock.stub.query).to.have.been.calledOnce
        chai.assert.deepEqual(CalleridModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to update:req.params with id", async () => {
        const expectedPayload = {
            "module": "callerid",
            "action": "save",
            "id": 52416532054094,
            "description": "Expected description",
        }


        req.body = {
            "description": "Expected description",
        }

        req.params = {
            "id": 52416532054094
        }

        // test
        await CalleridController.update(req, res, next);

        // assertions
        expect(CalleridModelMock.stub.query).to.have.been.calledOnce
        expect(CalleridModelMock.spy.update).to.have.been.calledOnce
        chai.assert.deepEqual(CalleridModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

})
