# ===================================================
# GDG Event Management & Registration - Backend
# ===================================================
FROM node:20-alpine

# Install OpenSSL and libc dependencies required by Prisma engine binaries
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy application source code and prisma schema
COPY . .

# Ensure entrypoint script is executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose API port
EXPOSE 5000

# Set default production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Entrypoint script dynamically adapts Prisma provider to PostgreSQL if configured
ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["npm", "start"]
