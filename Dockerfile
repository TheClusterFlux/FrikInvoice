# Multi-stage build for production
# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set production environment variables for build
# Note: REACT_APP_API_URL should be passed as build arg and set as ENV
ARG REACT_APP_API_URL=https://invoice-manager-api.theclusterflux.com/api/v1
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# Build the production bundle
RUN npm run build

# Stage 2: Serve the static files with nginx
FROM nginx:alpine

# Copy custom nginx config if needed (optional)
# For now, we'll use the default nginx config

# Copy the built static files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing and API proxying
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Proxy API requests to the API server \
    location /api/v1 { \
        proxy_pass https://invoice-manager-api.theclusterflux.com; \
        proxy_ssl_server_name on; \
        proxy_set_header Host invoice-manager-api.theclusterflux.com; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_set_header Origin https://invoice-manager.theclusterflux.com; \
    } \
    \
    # SPA routing \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
