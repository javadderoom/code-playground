# // frontend/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx nuxi build

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Nuxt output is in the .output folder
COPY --from=builder /app/.output ./.output

USER node
EXPOSE 3000
# Nitro server entry point
CMD ["node", ".output/server/index.mjs"]