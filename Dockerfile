# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /frontend/TataPowerFrontend

# Copy package files
COPY package*.json ./ 

# Install dependencies
RUN npm install

# Copy all files
COPY . . 

# Build the app with the correct base URL
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /frontend/TataPowerFrontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]