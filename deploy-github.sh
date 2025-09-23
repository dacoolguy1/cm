#!/bin/bash

echo "🚀 CCIC Camp Meeting 2025 - GitHub Pages Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the camp-meeting-app directory"
    echo "Usage: cd camp-meeting-app && ./deploy-github.sh"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_warning "Git not initialized. Initializing now..."
    git init
    print_success "Git repository initialized"
fi

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "Prerequisites check completed"

print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully"

# Check if gh-pages is installed
if ! npm list gh-pages &> /dev/null; then
    print_status "Installing gh-pages..."
    npm install --save-dev gh-pages
    print_success "gh-pages installed"
fi

print_status "Building the application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "Build completed successfully"

# Check if remote repository is configured
if ! git remote -v | grep -q origin; then
    print_warning "No remote repository configured"
    echo ""
    echo -e "${PURPLE}Please set up your GitHub repository first:${NC}"
    echo "1. Create a new repository on GitHub named 'ccic-camp-meeting-2025'"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/ccic-camp-meeting-2025.git"
    echo "3. Run this script again"
    echo ""
    read -p "Do you want to continue with deployment anyway? (y/n): " continue_deploy

    if [ "$continue_deploy" != "y" ] && [ "$continue_deploy" != "Y" ]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
fi

# Commit current changes if there are any
if [ -n "$(git status --porcelain)" ]; then
    print_status "Committing current changes..."
    git add .
    git commit -m "Deploy: CCIC Camp Meeting 2025 app $(date)"
    print_success "Changes committed"
fi

# Deploy to GitHub Pages
print_status "Deploying to GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    print_success "Successfully deployed to GitHub Pages!"
    echo ""
    echo -e "${PURPLE}🌐 Your app will be available at:${NC}"

    # Try to extract username from git remote
    if git remote -v | grep -q origin; then
        REMOTE_URL=$(git remote get-url origin)
        if [[ $REMOTE_URL == *"github.com"* ]]; then
            USERNAME=$(echo $REMOTE_URL | sed -n 's/.*github\.com[:/]\([^/]*\)\/.*/\1/p')
            echo -e "${GREEN}https://${USERNAME}.github.io/ccic-camp-meeting-2025${NC}"
        else
            echo -e "${GREEN}https://YOUR_USERNAME.github.io/ccic-camp-meeting-2025${NC}"
        fi
    else
        echo -e "${GREEN}https://YOUR_USERNAME.github.io/ccic-camp-meeting-2025${NC}"
    fi

    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to Settings → Pages"
    echo "3. Ensure source is set to 'Deploy from a branch'"
    echo "4. Select 'gh-pages' branch"
    echo "5. Wait 5-10 minutes for deployment to complete"

else
    print_error "Deployment failed"
    echo ""
    echo -e "${YELLOW}Common solutions:${NC}"
    echo "• Ensure you have push access to the repository"
    echo "• Check your internet connection"
    echo "• Verify the remote repository URL is correct"
    echo "• Make sure the repository exists on GitHub"
    exit 1
fi

echo ""
print_success "🎉 Deployment process completed!"

echo ""
echo -e "${PURPLE}📱 App Features:${NC}"
echo "✅ Users can click the circle to upload photos"
echo "✅ Real-time flyer generation with their photo"
echo "✅ Download personalized flyers instantly"
echo "✅ No server storage - all client-side processing"
echo "✅ Mobile responsive design"
echo "✅ Professional UI/UX"

echo ""
echo -e "${BLUE}🔧 Need to adjust photo positioning?${NC}"
echo "Modify these constants in src/App.jsx:"
echo "• CIRCLE_CENTER_X = 540 (horizontal position)"
echo "• CIRCLE_CENTER_Y = 650 (vertical position)"
echo "• CIRCLE_RADIUS = 150 (photo size)"

echo ""
echo -e "${GREEN}🚀 Your CCIC Camp Meeting 2025 app is now live!${NC}"
echo -e "${PURPLE}Share it with your community! 🎊${NC}"
