#!/bin/bash

# Manual deployment script for Daggerheart GM Dashboard
echo "🚀 Starting manual deployment to GitHub Pages..."

# Check if we're on the main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  Warning: You're not on the main branch (currently on: $current_branch)"
    echo "   Consider switching to main branch first: git checkout main"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🔗 Your app is available at: https://splinter714.github.io/Daggerheart/"
    echo ""
    echo "📝 Note: It may take a few minutes for changes to be visible."
else
    echo "❌ Deployment failed!"
    exit 1
fi