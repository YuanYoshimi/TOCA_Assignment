FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

# Copy backend source
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Copy data files (mounted at runtime via docker-compose, but include as fallback)
COPY data /app/data

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
