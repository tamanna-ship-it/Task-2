const http = require('http');

const testLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

(async () => {
  console.log('Testing Owner Login...');
  const ownerRes = await testLogin('owner@estetica.com', 'owner123');
  console.log('Owner Login Result:', ownerRes);

  console.log('\nTesting Manager Login...');
  const managerRes = await testLogin('manager@estetica.com', 'manager123');
  console.log('Manager Login Result:', managerRes);

  console.log('\nTesting Invalid Password...');
  const invalidRes = await testLogin('owner@estetica.com', 'wrongpassword');
  console.log('Invalid Login Result:', invalidRes);
})();
