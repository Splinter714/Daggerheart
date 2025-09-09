#!/bin/bash

# Test deployment script for Daggerheart GM Dashboard
echo "🧪 Starting TEST deployment to GitHub Pages..."

# Check if we're on the main branch
current_branch=$(git branch --show-current)
echo "📍 Current branch: $current_branch"

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to test branch
echo "🌐 Deploying to TEST branch (gh-pages-test)..."
npm run deploy:test

if [ $? -eq 0 ]; then
    echo "✅ TEST deployment successful!"
    echo "🔗 Your test app will be available at: https://splinter714.github.io/Daggerheart/"
    echo "📝 Note: GitHub Pages may take a few minutes to update."
    echo ""
    echo "⚠️  This deployed to the 'gh-pages-test' branch for testing."
    echo "   To deploy to production, use: npm run deploy"
else
    echo "❌ TEST deployment failed!"
    exit 1
fi