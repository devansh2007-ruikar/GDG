const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

module.exports = async () => {
  // Load .env.test
  dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });

  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  const originalSchema = fs.readFileSync(schemaPath, 'utf8');

  console.log(`\n🔄 Setting up clean test database (${isPostgres ? 'PostgreSQL' : 'SQLite test.db'})...`);

  if (!isPostgres) {
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

    // Temporarily use sqlite provider for local SQLite test runner
    const sqliteSchema = originalSchema.replace(
      'provider = "postgresql"',
      'provider = "sqlite"'
    );
    fs.writeFileSync(schemaPath, sqliteSchema, 'utf8');
    execSync('npx prisma generate', { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' });
    execSync('DATABASE_URL="file:./test.db" npx prisma db push --skip-generate', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
    });
    execSync('sqlite3 test.db "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=15000;"', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
    });
  } else {
    // Live PostgreSQL test database
    execSync('npx prisma db push --skip-generate', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
    });
  }

  // Seed test database
  execSync('node prisma/seed.js', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });

  console.log('✅ Test database ready and seeded.\n');
};
