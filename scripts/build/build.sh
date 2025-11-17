# NOTE:
# These are just sample build and deploy scripts. You may need to modify these for
# your own environment.

# Sample build script if you want to build a single artifact and deploy on 
# different environments:
#
# The "output" value in the next.config.ts file is set to "standalone", which means
# that the build step will put only the necessary dependencies in the .next/standalone/node_modules
# directory so that you do not need to include the /node_modules directory at the root of the
# project 
#
# If you want to remove the "output: standalone" configuration setting in the 
# next.config.ts file you can do that too prior to build. You will want to do
# this, for example, if running with Docker.

#!/usr/bin/env bash

npm ci
npm run build
tar czf opentrust-identity.tar.gz .next package.json next.config.ts public


# Simple deployment script if you are using the archive file generated 
# in the previous steps above.
#
# You will need some way to provision the environment (.env) file on the deployment
# server (in addition to managing the various secret values that need to be
# deployed in the .env file)

#!/usr/bin/env bash
set -e

APP_NAME="opentrust-identity"
DEPLOY_DIR="/usr/local/$APP_NAME"
ENV_FILE=".env"

# 1. Upload artifact to server
# (Skip this if you're already on the server)
# scp build-artifact.tar.gz user@server:/tmp/

# 2. Extract artifact
sudo mkdir -p $DEPLOY_DIR
sudo tar xzf opentrust-identity.tar.gz -C $DEPLOY_DIR

# 3. Copy environment file
# e.g., .env.staging or .env.production
cp $ENV_FILE $DEPLOY_DIR/

# 4. Set permissions
sudo chown -R nodeuser:nodeuser $DEPLOY_DIR
cd $DEPLOY_DIR

# 5. Export env vars and start
export $(grep -v '^#' $ENV_FILE | xargs)

# Comment out the next line during actual deployment, since it prints
# all env values to the console. It might be useful to print these in
# lower environments during initial setup and testing, but should not be
# a routine part of deployment.
echo "Starting Next.js app with NODE_ENV=$NODE_ENV"
nohup npm start > app.log 2>&1 &
