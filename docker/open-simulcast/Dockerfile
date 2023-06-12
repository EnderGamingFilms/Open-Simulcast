FROM endergamingfilms/nginx-rtmps

LABEL maintainer="EnderGamingFilms"

# Versions of NodeJS to use
ENV NODE_VERSION 18.x
ENV NPM_VERSION 9.7.1

# Install dependencies
RUN apt-get update && \
    apt-get install -y curl

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/${NODE_VERSION} | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@${NPM_VERSION} && \
    rm -rf /var/lib/apt/lists/*

# Check installation
RUN node -v && npm -v

# Copy over the configurations
COPY ./include/ /include/

# Make the start script executable
RUN chmod -R +x /include/

# WEBUI
EXPOSE 5173

# RTMP
EXPOSE 1935

# Clone your repository
RUN git clone https://github.com/EnderGamingFilms/Open-Simulcast.git

# Change working directory
WORKDIR /Open-Simulcast

# Install dependencies
RUN npm install

# Install dependencies for client
RUN npm run client-install

# Set the start script as the entrypoint
ENTRYPOINT ["/include/docker-entrypoint.sh"]
