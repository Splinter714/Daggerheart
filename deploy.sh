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

# Step 1: Increment app version
echo "📈 Incrementing app version..."
npm version patch --no-git-tag-version --no-git-commit

if [ $? -ne 0 ]; then
    echo "❌ Version increment failed!"
    exit 1
fi

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ Version incremented to: $NEW_VERSION"

# Step 2: Summarize and commit any uncommitted changes (including version bump)
echo "📝 Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    echo "📋 Uncommitted changes found. Summarizing..."
    
    # Get a summary of changes
    echo "Changed files:"
    git status --short
    
    # Stage all changes
    git add -A
    
    # Create a simple commit message summarizing changes
    COMMIT_MSG="Update to version $NEW_VERSION"
    
    # Add bullet points for changed files (excluding package.json version change)
    CHANGED_FILES=$(git diff --cached --name-only | grep -v "^package.json$" | head -5)
    if [ -n "$CHANGED_FILES" ]; then
        COMMIT_MSG="$COMMIT_MSG"$'\n'
        for file in $CHANGED_FILES; do
            COMMIT_MSG="$COMMIT_MSG"$'\n'"- $(basename "$file")"
        done
        if [ $(git diff --cached --name-only | grep -v "^package.json$" | wc -l) -gt 5 ]; then
            COMMIT_MSG="$COMMIT_MSG"$'\n'"- ... and more"
        fi
    fi
    
    echo "💾 Committing changes..."
    git commit -m "$COMMIT_MSG"
    
    if [ $? -ne 0 ]; then
        echo "❌ Commit failed!"
        exit 1
    fi
else
    # Even if no other changes, commit the version bump
    git add package.json
    git commit -m "Increment version to $NEW_VERSION"
    echo "✅ Version bump committed"
fi

# Step 3: Push to remote
echo "⬆️  Pushing to remote..."
git push

if [ $? -ne 0 ]; then
    echo "❌ Push failed!"
    exit 1
fi

# Step 4: Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Step 5: Deploy to GitHub Pages
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