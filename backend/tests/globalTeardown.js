const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = async () => {
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  if (schema.includes('provider = "sqlite"')) {
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema, 'utf8');
    execSync('npx prisma generate', { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' });
  }
};
