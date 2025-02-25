import request from 'supertest';
import app from '../src/app';
import { StatusCodes } from 'http-status-codes';

describe('Sample Test Suite', () => {
  test('GET / should return hello message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.text).toBe('hello');
  });
});
