#!/bin/bash

echo "Starting deployment process..."

# 1. Push to GitHub
echo "Attempting to push to GitHub..."
git push -u origin main

if [ $? -ne 0 ]; then
    echo "Git push failed. Please manually run 'git push -u origin main' and handle authentication."
else
    echo "Git push successful."
fi

# 2. Publish to Marketplace
echo "To publish to the VS Code Marketplace, you need a Personal Access Token (PAT)."
echo "If you have one, run:"
echo "npx vsce publish -p <YOUR_TOKEN>"
echo ""
echo "If you haven't logged in yet, run:"
echo "npx vsce login TheSuperLeo"
