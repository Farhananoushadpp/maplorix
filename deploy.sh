#!/bin/bash

# Maplorix Job Consultancy Website - Deployment Script
# This script helps deploy the website for hosting

echo "🚀 Starting Maplorix Website Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14.0.0 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to 14.0.0 or higher."
    exit 1
fi

echo "✅ Node.js version check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if environment file exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  No .env.production file found. Creating default configuration..."
    cat > .env.production << EOF
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_NAME=Maplorix
VITE_APP_DESCRIPTION=Professional Job Consultancy Services
EOF
    echo "📝 Created default .env.production file. Please update the API_BASE_URL before deployment."
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if dist folder was created
if [ ! -d "dist" ]; then
    echo "❌ Dist folder was not created"
    exit 1
fi

echo "📁 Build output created in 'dist' folder"

# Show build summary
echo ""
echo "🎉 Deployment Ready!"
echo ""
echo "📋 Build Summary:"
echo "   • Build files: $(find dist -type f | wc -l) files"
echo "   • Build size: $(du -sh dist | cut -f1)"
echo "   • Output folder: dist/"
echo ""
echo "🌐 Next Steps:"
echo "   1. Upload the 'dist' folder to your hosting provider"
echo "   2. Configure environment variables on your hosting platform"
echo "   3. Ensure your backend API is accessible"
echo "   4. Test the deployed application"
echo ""
echo "📖 For detailed deployment instructions, see DEPLOYMENT.md"
echo ""

# Optional: Start preview server
read -p "🔍 Do you want to preview the build locally? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Starting preview server on http://localhost:4173"
    npm run preview
fi
