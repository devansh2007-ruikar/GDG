#!/bin/sh
set -e

echo "=========================================="
echo "🚀 GDG Event Management Backend Starting"
echo "=========================================="

# Check if database is PostgreSQL
if echo "$DATABASE_URL" | grep -q "postgres"; then
  echo "🐘 Detected PostgreSQL connection URL in DATABASE_URL."
  echo "🔄 Switching Prisma schema provider from 'sqlite' to 'postgresql'..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
else
  echo "📁 Using SQLite database provider."
fi

# Generate Prisma Client for the chosen database provider
echo "⚙️  Generating Prisma Client..."
npx prisma generate

# Synchronize schema structure with database
echo "📦 Synchronizing database schema (prisma db push)..."
npx prisma db push --accept-data-loss

# Seed initial platform data (Admins, Users, Sample Events) if empty
echo "🌱 Running platform seed script..."
node prisma/seed.js || echo "⚠️ Seed script finished (data may already exist)."

echo "=========================================="
echo "✅ Backend database initialization complete"
echo "🌐 Starting server on port ${PORT:-5000}..."
echo "=========================================="

exec "$@"
