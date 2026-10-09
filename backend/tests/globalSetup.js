const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

module.exports = async () => {
  // Load .env.test
  dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });

  console.log('\n🔄 Setting up clean test database (test.db)...');

  // Cleanly remove any existing test database files to avoid SQLite corruption
  const filesToDelete = ['test.db', 'test.db-journal', 'test.db-wal', 'test.db-shm'];
  for (const file of filesToDelete) {
    const p = path.resolve(__dirname, '..', file);
    if (fs.existsSync(p)) {
      try {
        fs.unlinkSync(p);
      } catch {
        // Ignore if locked
      }
    }
  }

  // Generate fresh schema on test.db
  execSync('DATABASE_URL="file:./test.db" npx prisma db push --skip-generate', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  // Enable WAL mode and 15s busy timeout for high-concurrency support on SQLite
  execSync('sqlite3 test.db "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=15000;"', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  // Seed test database
  execSync('DATABASE_URL="file:./test.db" node prisma/seed.js', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  console.log('✅ Test database ready, configured in WAL mode, and seeded.\n');
};
