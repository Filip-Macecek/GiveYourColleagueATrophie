# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json* frontend/yarn.lock* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci; elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

# Copy source
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/vitest.config.ts ./
COPY frontend/index.html ./

# Build application
RUN npm run build

# Runtime stage - serve with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
