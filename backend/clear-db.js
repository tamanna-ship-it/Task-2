const { db } = require('./src/config/db');

db.run('DELETE FROM users', (err) => {
  if (err) console.error('Error truncating table:', err);
  else console.log('✅ Users table truncated successfully. Database is now 100% empty.');
  process.exit(0);
});
