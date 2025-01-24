#!/bin/bash

# print all the .env.production variables
cat .env.production

# Load the .env.production variables
export $(cat .env.production | xargs)


# Run the Next.js build command
npm run build
