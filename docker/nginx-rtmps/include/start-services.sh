#!/bin/bash

# Start Stunnel and Nginx
stunnel /etc/stunnel/stunnel.conf
nginx -g 'daemon off;'
