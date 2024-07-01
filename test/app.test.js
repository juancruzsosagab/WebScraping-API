import * as chai from 'chai';
import request from 'supertest';
import app from '../app.js';

const { expect } = chai;

describe('API Endpoints', () => {
  describe('POST /login', () => {
    it('should return a token with valid credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: process.env.USERNAME_API,
          password: process.env.PASSWORD_API
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('should return 401 with invalid credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: 'invalid',
          password: 'invalid'
        });
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Invalid credentials');
    });
  });

  describe('GET /scrape', () => {
    it('should return scraped data with a valid token', async () => {
      // First, get a valid token
      const loginRes = await request(app)
        .post('/login')
        .send({
          username: process.env.USERNAME_API,
          password: process.env.PASSWORD_API
        });
      const token = loginRes.body.token;

      const res = await request(app)
        .get('/scrape')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data').that.is.an('array');
    });

    it('should return 401 without a token', async () => {
      const res = await request(app)
        .get('/scrape');
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Unauthorized: Token not provided');
    });
  });
});
