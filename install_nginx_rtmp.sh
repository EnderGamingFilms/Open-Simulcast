#!/bin/bash

# Set the working directory to /tmp
cd /tmp

# Update package lists
sudo apt-get update

# Install necessary packages
sudo apt-get install -y build-essential libpcre3 libpcre3-dev libssl-dev zlib1g-dev wget unzip

# Download the source code
wget http://nginx.org/download/nginx-1.21.1.tar.gz
wget https://github.com/arut/nginx-rtmp-module/archive/refs/heads/master.zip

# Unpack the source code
tar -xf nginx-1.21.1.tar.gz
unzip master.zip

# Navigate into the nginx directory
cd nginx-1.21.1

# Configure the build with the RTMP module
./configure --with-http_ssl_module --add-module=../nginx-rtmp-module-master

# Build and install
make
sudo make install

# Configure NGINX for RTMP streaming
echo 'rtmp {
    server {
        listen 1935;
        chunk_size 4000;
        application live {
            live on;
            record off;
        }
    }
}' | sudo tee -a /usr/local/nginx/conf/nginx.conf

# Start NGINX
sudo /usr/local/nginx/sbin/nginx

# Clean up /tmp
cd /tmp
rm -rf nginx-1.21.1 master.zip nginx-rtmp-module-master nginx-1.21.1.tar.gz