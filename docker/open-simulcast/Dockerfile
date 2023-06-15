FROM node:18-slim

FROM endergamingfilms/nginx-rtmps

LABEL maintainer="EnderGamingFilms"

# use bash so we can source files
SHELL ["/bin/bash", "-c"]

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

# env variables
ENV CONTAINER_STORES=/data/containers
ENV RTMP_CONFIG_PATH=/data/nginx.conf.template
ENV SERVICES_PATH=/data/services.json

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NVM_VERSION 0.37.2
ENV NODE_VERSION 18.16.0
ENV NPM_VERSION 9.7.1

# install node via nvm
RUN mkdir -p ${NVM_DIR} \
    && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh | bash \
    && source ${NVM_DIR}/nvm.sh \
    && nvm install ${NODE_VERSION} \
    && npm install -g npm@${NPM_VERSION} \
    && nvm alias default ${NODE_VERSION}

# add node and npm to path so the commands are available
ENV NODE_PATH ${NVM_DIR}/versions/node/v${NODE_VERSION}/lib/node_modules
ENV PATH ${NVM_DIR}/versions/node/v${NODE_VERSION}/bin:$PATH

RUN source ~/.bashrc && nvm --version

RUN mkdir -p /include && mkdir -p /data && mkdir -p /var/log/nginx

RUN touch /var/log/nginx/error.log \
    && touch /var/log/nginx/access.log \
    && touch /var/log/nginx/rtmp.log \
    && touch /var/log/nginx/nginx.pid

# Copy over the configurations
COPY ./include/ /include/

# Make the start script executable
RUN chmod -R +x /include/

# RTMP
EXPOSE 1935

# EXPRESS SERVER
EXPOSE 5678

# Get the latest version of Open-Simulcast
RUN git clone https://github.com/EnderGamingFilms/Open-Simulcast.git

# Change working directory
WORKDIR /Open-Simulcast

# Make the scripts executatgfv ble
RUN chmod -R +x .

# Install project dependencies
RUN npm install && npm run client-install

# Build the client
RUN cd ./client && \
    npm run build && \
    mv ./dist /tmp && \
    rm -rf ./* && \
    mv /tmp/dist ./

# Set the start script as the entrypoint
ENTRYPOINT ["/include/docker-entrypoint.sh"]
