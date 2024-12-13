import axios from "axios";
import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';
import Logger from '../src/utils/logging.js';

const logger = new Logger('tests.user', false).create();

let testUser = {
    username: 'mocha_testing',
    email: 'mocha_testing@example.com',
    password: '@#mocha_testing',
}

describe('CRUD Validation on /api/clients/user', () => {
    // it('should make a successful request', async () => {
    //     const res = await request(app)
    //         .post('/api/clients/user')  // Substitua com a rota real da sua API
    //         .send({ username: testUser.username, email: testUser.email, password: testUser.password });
            
    //     expect(res.statusCode).to.equal(200);  // Verifica o status da resposta
    //     console.log(`- Request result: ${res.body}`)
    //     expect(res.body).to.have.property('success').that.equals(true)
    //     expect(res.body).to.have.property('data');
    //     expect(res.body.data).to.have.property('id');
    //     createdUserId = res.body.data.id;
    // });

    // it('should not allow us to create a duplicate user', async () => {
    //     const res = await request(app)
    //         .post('/api/clients/user')
    //         .send({ username: testUser.username, email: testUser.email, password: testUser.password });

    //     expect(res.statusCode).to.equal(200); // i hate how magnus handles this
    // })


    // make a new user // CREATE
    let createdUserId
    it('should create a new user', async () => {
        const res = await request(app)
            .post('/api/clients/user')
            .send({ username: testUser.username, email: testUser.email, password: testUser.password });

        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('success').that.equals(true)
        expect(res.body).to.have.property('data');
        expect(res.body.data).to.have.property('id');
    })
    it('should confirm module&action is blocked in create', async () => {
        const res = await request(app)
            .post('/api/clients/user')
            .send({ module: 'did', action: 'destroy', username: testUser.username, email: testUser.email, password: testUser.password });
        
        
    })

    // try to create a duplicate user (need to fail)
    it('should not allow us to make duplicate users', async () => {})

    // list users // READ
    it('should list all users', async () => {})
    it('should confirm module&action is blocked in read', async () => {})

    // get mocha user
    it('should get the test user', async () => {})

    // update mocha user // UPDATE
    it('should update the test user password', async () => {})
    it('should confirm module&action is blocked in update', async () => {})

    // delete mocha user // DELETE
    it('should delete the test user', async () => {})
    it('should confirm module&action is blocked in delete', async () => {})

    // guarantee module and action is blocked

});

describe('GET /api/clients/user', async () => {
    const res = await request(app)
        .get('/api/clients/user')
        .send({});

    logger.unit(`- Request result: ${res.body}`)
    expect(res.statusCode).to.equal(200);

})