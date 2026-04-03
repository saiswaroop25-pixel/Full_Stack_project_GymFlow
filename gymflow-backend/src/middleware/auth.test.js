const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const { protect, adminOnly } = require('./auth');

process.env.JWT_SECRET = 'test-secret';

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test('protect rejects requests without a bearer token', () => {
  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  protect(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Access denied. No token provided.');
});

test('protect accepts valid tokens and sets req.user', () => {
  const token = jwt.sign({ id: 'user-1', role: 'USER' }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  let nextCalled = false;

  protect(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, 'user-1');
  assert.equal(req.user.role, 'USER');
});

test('adminOnly blocks non-admin users', () => {
  const req = { user: { role: 'USER' } };
  const res = createResponse();
  let nextCalled = false;

  adminOnly(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, 'Access denied. Admin privileges required.');
});

test('adminOnly allows admin users', () => {
  const req = { user: { role: 'ADMIN' } };
  const res = createResponse();
  let nextCalled = false;

  adminOnly(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});
