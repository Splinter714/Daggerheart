#!/bin/bash

# Simple test deployment
echo "🧪 Deploying test version..."

# Go back to main branch
git checkout main

# Build the project normally
npm run build

# Deploy to a test branch
gh-pages -d dist -b gh-pages-test -m "Test deployment"

echo "✅ Test deployment complete!"
echo "🔗 Your test app will be available at: https://splinter714.github.io/Daggerheart/"
echo "📝 Note: You'll need to configure GitHub Pages to use the 'gh-pages-test' branch"
echo "   Go to Settings > Pages > Source > Deploy from a branch > gh-pages-test"