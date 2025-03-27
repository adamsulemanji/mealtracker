#!/bin/bash

# Navigate to the frontend folder
cd frontend || { echo "Frontend folder not found"; exit 1; }

# Run the build script
if [ -f "./build.sh" ]; then
    ./build.sh
else
    echo "build.sh not found in frontend folder"
    exit 1
fi

# Navigate back to the root directory
cd ..

# Deploy using CDK
cdk deploy