# Stage 1: Dependencies
FROM node:20.15.1-alpine3.20 AS dependencies
# Install build dependencies
RUN apk add --no-cache python3 make g++
# Set working directory
WORKDIR /app
# Install app dependencies
COPY package.json package-lock.json ./
RUN npm ci


# Stage 2: Build
FROM dependencies AS build

WORKDIR /app
# Copy the rest of the application source code
COPY . .
# Build the application
RUN npm run build


# Stage 3: Production
FROM node:20.15.1-alpine3.20 AS production
# Set working directory
WORKDIR /app

# Copy the built application and dependencies from the build stage
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD ["node", "dist/main.js"]