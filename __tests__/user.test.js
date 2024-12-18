import axios from "axios";
import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';
import { logging } from '../src/utils/logging.js';

const logger = logging.getLogger('test');
const transport_console = new logging.transports.Console()
const transport_file = new logging.transports.FileRotate({
    filename: './logs/test-%DATE%.log',
    maxSize: '20m',
    maxFiles: '14d',
})

// logger.addTransport(transport_console);
// logger.addTransport(transport_file);
logger.setLevel('unit')

let testUser = {
    username: 'mocha_testing',
    email: 'mocha_testing@example.com',
    password: '@#mocha_testing',
}

describe('CRUD Validation on /api/clients/user', () => {
    let createdUserId;
    let lastResponse;

    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            logger.info(`Test "${this.currentTest.title}" failed!`);
            logger.info('Response body:', JSON.stringify(lastResponse.body, null, 2));
        }
    });



    // RULE TESTS

    it('should make sure mocha user does not exist', async () => {
        const res = await request(app)
            .delete(`/api/clients/user/${testUser.username}`)
            .send()
            lastResponse = res;

        expect([200, 404]).to.include(res.statusCode);
        if (res.statusCode === 200) {
            logger.info(`test user ${testUser.username} exist, deleting...`)
            expect(res.body).to.have.property('success').that.equals(true);
            expect(res.body).to.have.property('response');
            expect(res.body.response).to.have.property('id');
            expect(res.body.response.id).to.equal(createdUserId);
        } else if (res.statusCode === 404) {
            logger.info(`test user ${testUser.username} does not exist.`);
            expect(res.body).to.have.property('success').that.equals(false);
            expect(res.body).to.have.property('message').that.equals('ID not found');
        }
    })


    it('should get module rules', async () => {
        const res = await request(app)
            .get('/api/clients/user/rules')
            .send()
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true);
        expect(res.body).to.have.property('data');
        expect(res.body.data).to.have.property('rules');
    })

    // CREATE TESTS

    it('should block us from sending module and/or action', async () => {
        const res = await request(app)
            .post('/api/clients/user')
            .send({ module: 'sip', action: 'destroy', username: testUser.username, email: testUser.email, password: testUser.password });
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.have.property('success').that.equals(false);
        expect(res.body).to.have.property('errors'); // this might change to be honest
        expect(res.body.errors).to.have.lengthOf(1);
    })

    it('should create a new user successfully', async () => {
        const res = await request(app)
            .post('/api/clients/user')
            .send({ username: testUser.username, email: testUser.email, password: testUser.password });
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true);
        expect(res.body).to.have.property('response');
        createdUserId = res.body.response.id;
    })

    it('should block us from creating a duplicate user', async () => {
        const res = await request(app)
            .post('/api/clients/user')
            .send({ username: testUser.username, email: testUser.email, password: testUser.password });
            lastResponse = res;

        expect(res.statusCode).to.equal(500);
        expect(res.body).to.have.property('success').that.equals(false);
    })

    it('should update user via id', async () => {
        const res = await request(app)
            .put(`/api/clients/user/id/${createdUserId}`)
            .send({ password: 'd3092jf0foe3oe32' });
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true);
        expect(res.body).to.have.property('response');
        expect(res.body.response).to.have.property('id').that.equals(createdUserId);
    })

    it('should update user via username', async () => {
        const res = await request(app)
            .put(`/api/clients/user/${testUser.username}`)
            .send({ password: 'd3092jf0foe3oe32' });
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true);
        expect(res.body).to.have.property('response');
        expect(res.body.response).to.have.property('id').that.equals(createdUserId);
    })

    it('should list every user', async () => {
        const res = await request(app)
            .get('/api/clients/user')
            .send()
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true);
        expect(res.body).to.have.property('response');
        expect(res.body.response).to.have.property('rows');
        expect(res.body.response).to.have.property('count');
        let userCount  = res.body.response.count;
        expect(res.body.response).to.have.property('rows').that.have.lengthOf(userCount);
    })

    it('should return the test user via search parameters', async () => {
        const res = await request(app)
            .get('/api/clients/user')
            .query({ username: testUser.username })
            .send()
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true);
        expect(res.body).to.have.property('response');
        expect(res.body.response).to.have.property('rows').that.have.lengthOf(1);
        expect(res.body.response.rows[0]).to.have.property('username').that.equals(testUser.username);
    })

    it('should return the test user via id', async () => {
        const res = await request(app)
            .get(`/api/clients/user/id/${createdUserId}`)
            .send()
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true);
        expect(res.body).to.have.property('response');
        expect(res.body.response).to.have.property('rows').that.have.lengthOf(1);
        expect(res.body.response.rows[0]).to.have.property('id').that.equals(createdUserId);
        expect(res.body.response.rows[0]).to.have.property('username').that.equals(testUser.username);
    })

    it('should return the test user via username', async () => {
        const res = await request(app)
            .get(`/api/clients/user/${testUser.username}`)
            .send()
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true);
        expect(res.body).to.have.property('response');
        expect(res.body.response).to.have.property('rows').that.have.lengthOf(1);
        expect(res.body.response.rows[0]).to.have.property('id').that.equals(createdUserId);
        expect(res.body.response.rows[0]).to.have.property('username').that.equals(testUser.username);
    })

    it('should delete the test user', async () => {
        const res = await request(app)
            .delete(`/api/clients/user/id/${createdUserId}`)
            .send()
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true);
        expect(res.body).to.have.property('response');
        expect(res.body.response).to.have.property('id').that.equals(parseInt(createdUserId));
    })

    it('should return not found when trying to delete an already deleted user', async () => {
        const res = await request(app)
            .delete(`/api/clients/user/id/${createdUserId}`)
            .send()
            lastResponse = res;

        logger.unit(JSON.stringify(res.body))
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.have.property('success').that.equals(false);
    })



    // // list users // READ
    // it('should list all users', async () => {})
    // it('should confirm module&action is blocked in read', async () => {})

    // // get mocha user
    // it('should get the test user', async () => {})

    // // update mocha user // UPDATE
    // it('should update the test user password', async () => {})
    // it('should confirm module&action is blocked in update', async () => {})

    // // delete mocha user // DELETE
    // it('should delete the test user', async () => {})
    // it('should confirm module&action is blocked in delete', async () => {})

    // // guarantee module and action is blocked

});
