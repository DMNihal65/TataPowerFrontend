#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting deployment process...${NC}"

# # Pull latest changes
# echo -e "${GREEN}📥 Pulling latest changes from git...${NC}"
# git pull origin main

# Build and deploy using docker-compose
echo -e "${GREEN}🏗️  Building and deploying containers...${NC}"
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check if container is running
echo -e "${GREEN}🔍 Checking container status...${NC}"
docker ps | grep react-app

echo -e "${GREEN}✅ Deployment completed!${NC}"