import fetch from 'node-fetch';

const API = 'http://localhost:3000';

function parseSetCookie(headers) {
  const raw = headers.raw?.()['set-cookie'];
  if (!raw) return [];
  return raw;
}

async function post(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });

  const txt = await res.text();
  let json = null;
  try {
    json = txt ? JSON.parse(txt) : null;
  } catch {
    json = { message: txt };
  }

  return { status: res.status, json, setCookies: res.headers.getSetCookie ? res.headers.getSetCookie() : parseSetCookie(res.headers) };
}

async function get(path) {
  const res = await fetch(API + path, {
    method: 'GET',
    credentials: 'include'
  });
  const txt = await res.text();
  let json = null;
  try {
    json = txt ? JSON.parse(txt) : null;
  } catch {
    json = { message: txt };
  }
  return { status: res.status, json };
}

const email = process.env.DEBUG_EMAIL || 'debuguser12345@example.com';
const password = process.env.DEBUG_PASSWORD || 'Strong#1234';

console.log('--- Debug auth (backend direct) ---');
console.log('Email:', email);

// 1) Signup
try {
  const signup = await post('/api/v1/signup', {
    firstName: 'Debug',
    lastName: 'User',
    emailId: email,
    password
  });
  console.log('Signup response:', signup);
} catch (e) {
  console.error('Signup request failed:', e);
}

// 2) Login
try {
  const login = await post('/api/v1/login', { emailId: email, password });
  console.log('Login response:', login);
} catch (e) {
  console.error('Login request failed:', e);
}

console.log('Note: cookie-based auth in Node needs a cookie jar to test subsequent GET /user/view.');
console.log('Run this only to verify signup/login backend responses.');

