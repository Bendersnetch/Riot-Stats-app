# Base image for building
FROM node:20-alpine AS build

WORKDIR /app

# Copy everything into the image
COPY . .

# Install dependencies
RUN npm install

# Build Nuxt app
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
