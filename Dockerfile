# Stage 1: build the frontend (static bundle, no Node needed at runtime for it)
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: server runtime (serves API + the built frontend)
FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node server/ ./
COPY --chown=node:node --from=client-build /app/client/dist /app/client/dist
ENV NODE_ENV=production
USER node
EXPOSE 5000
CMD ["sh", "-c", "node src/seed.js && node src/index.js"]
