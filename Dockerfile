# Dockerfile
FROM node:18-alpine

# Install necessary utilities
# RUN apk add --no-cache samba-client

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Create a script to run both processes
RUN echo '#!/bin/sh\n\
npm start & \
node src/server/server.js\n\
wait' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000 3001

# Run the combined start script
CMD ["/app/start.sh"]
