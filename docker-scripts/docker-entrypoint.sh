#!/bin/bash

# Update the Nginx and Stunnel configuration files based on the environment variables
envsubst < /app/data/nginx.conf.template > /etc/nginx/nginx.conf
envsubst < /app/data/stunnel.conf.template > /etc/stunnel/stunnel.conf

# Start Stunnel and Nginx
stunnel /etc/stunnel/stunnel.conf
nginx -g 'daemon off;'
