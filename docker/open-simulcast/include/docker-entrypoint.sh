#!/bin/bash

# Copy the template files from /tmp to /app/data if they don't exist in the mounted location
if [ ! -f /app/data/nginx.conf.template ]; then
  cp /include/nginx.conf.template /app/data/nginx.conf.template
fi

if [ ! -f /app/data/stunnel.conf.template ]; then
  cp /include/stunnel.conf.template /app/data/stunnel.conf.template
fi

if [ ! -f /app/data/start-service.sh ]; then
  cp /include/start-service.sh /app/data/start-service.sh
fi

# Update the Nginx and Stunnel configuration files based on the environment variables
envsubst < /app/data/nginx.conf.template > /etc/nginx/nginx.conf
envsubst < /app/data/stunnel.conf.template > /etc/stunnel/stunnel.conf

# Change permissions of all files in /include to be executable
chmod -R +x /app/data

# Start services
/app/data/start-service.sh
