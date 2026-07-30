const http = require('http');

const request = (path, method, body) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/auth${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let respData = '';
      res.on('data', (chunk) => respData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(respData) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

(async () => {
  console.log('1. Testing Login on Empty DB (0 users)...');
  const emptyLogin = await request('/login', 'POST', { email: 'test@example.com', password: 'password123' });
  console.log('Empty DB Login Result:', emptyLogin);

  console.log('\n2. Testing User Registration (Owner)...');
  const signupOwner = await request('/signup', 'POST', {
    email: 'owner@esteticademo.com',
    password: 'ownerpassword123',
    confirmPassword: 'ownerpassword123',
    role: 'owner'
  });
  console.log('Owner Signup Result:', signupOwner);

  console.log('\n3. Testing Duplicate Registration...');
  const dupSignup = await request('/signup', 'POST', {
    email: 'owner@esteticademo.com',
    password: 'ownerpassword123',
    confirmPassword: 'ownerpassword123',
    role: 'owner'
  });
  console.log('Duplicate Signup Result:', dupSignup);

  console.log('\n4. Testing Login with Registered Owner...');
  const loginOwner = await request('/login', 'POST', {
    email: 'owner@esteticademo.com',
    password: 'ownerpassword123'
  });
  console.log('Owner Login Result:', loginOwner);

  console.log('\n5. Testing User Registration (Manager)...');
  const signupManager = await request('/signup', 'POST', {
    email: 'manager@esteticademo.com',
    password: 'managerpassword123',
    confirmPassword: 'managerpassword123',
    role: 'manager'
  });
  console.log('Manager Signup Result:', signupManager);
})();
