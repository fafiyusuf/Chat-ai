#!/bin/bash

echo "🚀 Setting up Chat Application Backend..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created. Please edit it with your configuration.${NC}"
    echo -e "${YELLOW}⚠️  You need to configure DATABASE_URL and JWT secrets before continuing.${NC}"
    echo -e "${YELLOW}   Open .env file and update the required values.${NC}"
    read -p "Press enter to continue after updating .env file..."
fi

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Generate Prisma Client
echo -e "\n${YELLOW}🔧 Generating Prisma Client...${NC}"
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prisma Client generated${NC}"

# Ask user if they want to run migrations
echo -e "\n${YELLOW}Would you like to push the database schema? (y/n)${NC}"
read -p "" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗄️  Pushing database schema...${NC}"
    npm run prisma:push
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to push database schema${NC}"
        echo -e "${YELLOW}   Please check your DATABASE_URL in .env file${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Database schema pushed${NC}"
    
    # Ask if they want to seed
    echo -e "\n${YELLOW}Would you like to seed the database with demo data? (y/n)${NC}"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🌱 Seeding database...${NC}"
        npm run prisma:seed
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database seeded successfully${NC}"
            echo -e "${GREEN}  Demo users created (password: password123):${NC}"
            echo -e "    - alice@example.com"
            echo -e "    - bob@example.com"
            echo -e "    - charlie@example.com"
            echo -e "    - diana@example.com"
        fi
    fi
fi

# Create logs directory
mkdir -p logs

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Review your .env configuration"
echo -e "  2. Start the development server: ${GREEN}npm run dev${NC}"
echo -e "  3. Server will run on: ${GREEN}http://localhost:3001${NC}"
echo -e "  4. Health check: ${GREEN}http://localhost:3001/health${NC}"
echo -e "\n${YELLOW}Optional:${NC}"
echo -e "  - View database: ${GREEN}npm run prisma:studio${NC}"
echo -e "  - Build for production: ${GREEN}npm run build${NC}"
echo -e "\n${YELLOW}📚 Read README.md for API documentation and WebSocket events${NC}"
