FROM node:20-alpine

WORKDIR /app

# Client
COPY client/package*.json client/
RUN cd client && npm ci
COPY client/ client/
RUN cd client && npm run build

# Server
COPY server/package*.json server/
RUN cd server && npm ci
COPY server/ server/
RUN cd server && npx prisma generate && npm run build

# Serve the built client as static files from the server (single-service deploy).
RUN cp -r client/dist server/public

WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 3000

# `prisma db push` syncs the schema on every boot — safe for additive changes, and refuses
# (rather than silently dropping data) if a change would be destructive. There's no
# `prisma/migrations` history in this project; see README for the production-migration note.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
