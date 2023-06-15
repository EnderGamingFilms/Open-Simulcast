#!/bin/bash

# Copy the template files from /tmp to /data if they don't exist in the mounted location
if [ ! -f /data/nginx.conf.template ]; then
  cp /include/nginx.conf.template /data/nginx.conf.template
fi

if [ ! -f /data/stunnel.conf.template ]; then
  cp /include/stunnel.conf.template /data/stunnel.conf.template
fi

if [ ! -f /data/start-service.sh ]; then
  cp /include/start-service.sh /data/start-service.sh
fi

# Change permissions of all files in /include to be executable
chmod -R +x /data

# Update the Nginx and Stunnel configuration files based on the environment variables
envsubst < /data/nginx.conf.template > /etc/nginx/nginx.conf
envsubst < /data/stunnel.conf.template > /etc/stunnel/stunnel.conf

# Start services
/data/start-service.sh
