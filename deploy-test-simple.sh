#!/bin/bash

# Simple test deployment to subdirectory
echo "🧪 Deploying test version to subdirectory..."

# Build for test subdirectory
npm run build:test

# Create test directory structure
mkdir -p test-deploy
cp -r dist/* test-deploy/

# Deploy using gh-pages with custom dest
gh-pages -d test-deploy -m "Test deployment to subdirectory"

echo "✅ Test deployment complete!"
echo "🔗 Check: https://splinter714.github.io/Daggerheart/test/"