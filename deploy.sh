#!/bin/bash

echo "🚀 CCIC Camp Meeting 2025 - Deployment Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the camp-meeting-app directory${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${BLUE}Step 2: Building the application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

echo -e "${BLUE}Step 3: Choose deployment option:${NC}"
echo "1. Deploy to Vercel (Recommended)"
echo "2. Deploy to Netlify"
echo "3. Prepare for GitHub Pages"
echo "4. Just build (already done)"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}Deploying to Vercel...${NC}"

        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}Installing Vercel CLI...${NC}"
            npm install -g vercel
        fi

        # Check if user is logged in
        if ! vercel whoami &> /dev/null; then
            echo -e "${YELLOW}Please log in to Vercel:${NC}"
            vercel login
        fi

        echo -e "${BLUE}Deploying to production...${NC}"
        vercel --prod

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}🎉 Successfully deployed to Vercel!${NC}"
            echo -e "${GREEN}Your app is now live!${NC}"
        else
            echo -e "${RED}Deployment failed${NC}"
        fi
        ;;

    2)
        echo -e "${YELLOW}Preparing for Netlify deployment...${NC}"
        echo -e "${GREEN}✅ Build files are ready in the 'dist' folder${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Go to https://netlify.com"
        echo "2. Drag and drop the 'dist' folder to deploy"
        echo "3. Or connect your GitHub repository for automatic deployments"
        ;;

    3)
        echo -e "${YELLOW}Setting up for GitHub Pages...${NC}"

        # Check if gh-pages is installed
        if ! npm list gh-pages &> /dev/null; then
            echo -e "${YELLOW}Installing gh-pages...${NC}"
            npm install --save-dev gh-pages
        fi

        echo -e "${GREEN}✅ Ready for GitHub Pages!${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Push your code to GitHub"
        echo "2. Run: npm run deploy"
        echo "3. Enable GitHub Pages in your repository settings"
        ;;

    4)
        echo -e "${GREEN}✅ Build completed!${NC}"
        echo -e "${BLUE}Build files are in the 'dist' folder${NC}"
        ;;

    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎊 Deployment process completed!${NC}"
echo -e "${BLUE}Your CCIC Camp Meeting 2025 app is ready to use!${NC}"

# Display app features
echo ""
echo -e "${YELLOW}App Features:${NC}"
echo "✅ Users can click the circle to upload photos"
echo "✅ Real-time flyer generation with their photo"
echo "✅ Download personalized flyers"
echo "✅ No server storage - all client-side processing"
echo "✅ Mobile responsive design"
echo ""
echo -e "${BLUE}Need to adjust photo positioning?${NC}"
echo "Check the console logs and modify constants in src/App.jsx"
echo ""
echo -e "${GREEN}Happy sharing! 🚀${NC}"
