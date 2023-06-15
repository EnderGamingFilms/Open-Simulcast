#!/bin/bash

# Copy the template files from /tmp to /app if they don't exist in the mounted location
if [ ! -f /app/nginx.conf.template ]; then
  cp /include/nginx.conf.template /app/nginx.conf.template
fi

if [ ! -f /app/stunnel.conf.template ]; then
  cp /include/stunnel.conf.template /app/stunnel.conf.template
fi

if [ ! -f /app/start-service.sh ]; then
  cp /include/start-service.sh /app/start-service.sh
fi

# Update the Nginx and Stunnel configuration files based on the environment variables
envsubst < /app/nginx.conf.template > /etc/nginx/nginx.conf
envsubst < /app/stunnel.conf.template > /etc/stunnel/stunnel.conf

# Change permissions of all files in /include to be executable
chmod -R +x /app

# Start services
/app/start-service.sh
