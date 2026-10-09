# ===================================================
# Stage 1: Build Vite React Application
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install npm packages
RUN npm install

# Copy frontend source files
COPY . .

# Set default API URL argument (defaults to relative /api which nginx proxies)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# ===================================================
# Stage 2: Production Nginx Server
# ===================================================
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
