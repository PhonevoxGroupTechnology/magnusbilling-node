import 'dotenv/config';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { logging } from '../src/utils/logging.js'
import { createMocks } from './helpers/mocks.js';
const { assert, expect } = chai;
// for this test
import SipModel from '../src/models/clients/SipModel.js';
import SipController from '../src/controllers/clients/SipController.js';

chai.use(sinonChai);

// const api_logger = logging.getLogger("api");
// const test_logger = logging.getLogger("test");
// const transport_console = new logging.transports.Console({level: logging.DEBUG})

// api_logger.addTransport(transport_console);
// test_logger.addTransport(transport_console);

// CalleridController mocking: payload formatting to Model.query

describe("SipController mocking: payload formatting to Model.query", () => {
    let SipModelMock = {
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
        SipModelMock.spy.create = sinon.spy(SipModel, "create");
        SipModelMock.spy.update = sinon.spy(SipModel, "update");
        SipModelMock.spy.delete = sinon.spy(SipModel, "delete");
        SipModelMock.stub.query = sinon.stub(SipModel, "query");
        SipModelMock.stub.query.resolves({ success: true, message: "Mock response", response: { "Mock": "response" } });
        ({ req, res, next } = createMocks()); // prepare the fake request
    })

    afterEach(() => {
        sinon.restore();
        ({ req, res, next } = createMocks());
    })

    it("should format to create", async () => {
        const expectedPayload = {
            "module": "sip",
            "action": "save",
            "id_user": 52416532054094,
            "callerid": "",
            "secret": "Expected secret",
            "qualify": "yes",
            "host": "dynamic",
            "disallow": "all",
            "allow": "g729,gsm,opus,alaw,ulaw",
            "defaultuser": "Expected defaultuser",
            "id": 0,
            "name": ""
        }

        req.body = {
            "id_user": 52416532054094,
            "defaultuser": "Expected defaultuser",
            "secret": "Expected secret",
        };

        // test
        await SipController.create(req, res, next);

        // assertions
        expect(SipModelMock.spy.create).to.have.been.calledOnce
        expect(SipModelMock.stub.query).to.have.been.calledOnce
        assert.deepEqual(SipModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to query:req.query", async () => {
        const expectedPayload = {
            "module": "sip",
            "action": "read",
            "filter": "[{\"type\":\"string\",\"field\":\"host\",\"value\":\"Expected host\",\"comparison\":\"eq\"},{\"type\":\"string\",\"field\":\"disallow\",\"value\":\"Expected disallow\",\"comparison\":\"eq\"},{\"type\":\"string\",\"field\":\"allow\",\"value\":\"Expected allow\",\"comparison\":\"eq\"},{\"type\":\"string\",\"field\":\"defaultuser\",\"value\":\"Expected defaultuser\",\"comparison\":\"eq\"},{\"type\":\"number\",\"field\":\"id\",\"value\":52416532054094,\"comparison\":\"eq\"}]"
        }

        req.query = {
            "id": 52416532054094,
            "host": "Expected host",
            "disallow": "Expected disallow",
            "allow": "Expected allow",
            "defaultuser": "Expected defaultuser"
        }

        // test
        await SipController.query(req, res, next);

        // assertions
        expect(SipModelMock.stub.query).to.have.been.calledOnce
        chai.assert.deepEqual(SipModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to query:req.params with id", async () => {
        const expectedPayload = {
            "module": "sip",
            "action": "read",
            "filter": "[{\"type\":\"number\",\"field\":\"id\",\"value\":52416532054094,\"comparison\":\"eq\"}]"
        }

        req.params = {
            "id": 52416532054094
        }

        // test
        await SipController.query(req, res, next);

        // assertions
        expect(SipModelMock.stub.query).to.have.been.calledOnce
        chai.assert.deepEqual(SipModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to query:req.params with defaultuser", async () => {
        const expectedPayload = {
            "module": "sip",
            "action": "read",
            "filter": "[{\"type\":\"string\",\"field\":\"defaultuser\",\"value\":\"Expected defaultuser\",\"comparison\":\"eq\"}]"
        }

        req.params = {
            "defaultuser": "Expected defaultuser"
        }

        // test
        await SipController.query(req, res, next);

        // assertions
        expect(SipModelMock.stub.query).to.have.been.calledOnce
        chai.assert.deepEqual(SipModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })

    it("should format to update:req.params with id", async () => {
        const expectedPayload = {
            "module": "sip",
            "action": "save",
            "id": 52416532054094,
            "defaultuser": "Expected default user",
            "secret": "Expected secret",
            "callerid": "Expected callerid",
            "qualify": "Expected qualify",
            "host": "Expected host",
            "disallow": "Expected disallow",
            "allow": "Expected allow"
        }


        req.body = {
            "defaultuser": "Expected default user",
            "secret": "Expected secret",
            "callerid": "Expected callerid",
            "qualify": "Expected qualify",
            "host": "Expected host",
            "disallow": "Expected disallow",
            "allow": "Expected allow"
        }

        req.params = {
            "id": 52416532054094
        }

        // test
        await SipController.update(req, res, next);

        // assertions
        expect(SipModelMock.stub.query).to.have.been.calledOnce
        expect(SipModelMock.spy.update).to.have.been.calledOnce
        chai.assert.deepEqual(SipModelMock.stub.query.getCall(0).args[0], expectedPayload, "Payload is different from what we've expected to receive.")
    })




})
