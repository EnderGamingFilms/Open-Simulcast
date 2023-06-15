const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Docker = require('dockerode');
const services = require('../services/services.js');
const nginx = require('../system/nginx.js');
const os = require('os');

// Initialize Docker client
let docker;
let mountPath;
let usingNginx = false;

if (os.platform() === 'win32') {
    docker = new Docker({
        host: '127.0.0.1',
        port: 2375
    });
} else {
    docker = new Docker({
        socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock'
    });

    usingNginx = true;
}

mountPath = process.env.CONTAINER_STORES || '../../../local/containers';

// Store NodeMediaServer instances
const data = new Map();

// Load services from a saved configuration
async function loadStreams() {
    await services.loadServices();

    if (usingNginx) {
        await nginx.generateNginxConfig();
    }

    for (const service of services.data) {
        const { serviceName, port, rtmpUrl, streamKey, useTls, enabled, containerId, serviceId } = service;

        console.log(`Loading ${serviceId}...`);

        // Check if a container for the service already exists
        const container = await docker.getContainer(containerId);

        await container.inspect(async function (err, containerData) {
            if (err && err.statusCode === 404) {
                console.log('Container not found creating new...');

                await createContainer(serviceName, port, rtmpUrl, streamKey, useTls, enabled);
            } else {
                data.set(serviceId, container);

                // Start or stop the container based on the service's enabled status
                let running = false;
                if (service.enabled) {
                    try {
                        if (!containerData.State.Running) {
                            await container.start();
                            running = true;
                        } else {
                            running = true;
                        }
                    } catch (error) {
                        console.log(`Failed to start container - ${containerId}`);
                    }
                } else {
                    try {
                        if (containerData.State.Running) {
                            await container.stop();
                            running = false;
                        }
                    } catch (error) {
                        console.log(`Failed to stop container - ${containerId}`);
                    }
                }

                service.enabled = running;
            }
        });
    }
}

// Function to create and start a container
async function createContainer(serviceName, port, rtmpUrl, streamKey, useTls, enabled) {
    // Generate a unique identifier for the container
    const containerName = `${serviceName}-${uuidv4()}`;
    const serviceIdentifier = `${serviceName.toLowerCase()}-${services.randomIdentifier(8)}`;
    const configPath = path.join(mountPath, serviceIdentifier);

    console.log(`Creating ${serviceName} at key ${serviceIdentifier}...`);

    rtmpUrl = rtmpUrl.replace('rtmp://', '').replace('rtmps://', '').trim();

    const pushUrl = useTls ? `rtmp://127.0.0.1:19350/service` : `rtmp://${rtmpUrl}`;

    const container = await docker.createContainer({
        Image: 'endergamingfilms/nginx-rtmps',
        Env: [
            `RTMP_PUSH_URL=${pushUrl}`,
            `STREAM_KEY=${streamKey.trim()}`,
            `STUNNEL_CONNECT_URL=${rtmpUrl}`
        ],
        name: containerName,
        HostConfig: {
            Binds: [`${configPath}:/data`],
            PortBindings: {
                "1935/tcp": [
                    {
                        "HostPort": `${port}`
                    }
                ]
            }
        }
    });

    data.set(serviceIdentifier, container);

    await container.start();

    if (!enabled) {
        container.stop();
    }

    // Add service to services
    services.addService({
        serviceName,
        port,
        rtmpUrl,
        streamKey,
        useTls,
        enabled,
        containerId: container.id,
        serviceId: serviceIdentifier
    });

    services.saveServices();

    if (usingNginx) {
        nginx.generateNginxConfig();
    }

    return { container, serviceId: serviceIdentifier };
}

// Functino to stop a running stream
async function stopStream(serviceId) {
    const container = data.get(serviceId);

    if (!container) {
        return {
            success: false,
            message: `Container does not exist - ${serviceId}`,
            data: true // assume if you are stopping a container it was originally running
        };
    }

    const containerData = await container.inspect();
    const running = containerData.State.Running;

    if (!running) {
        return {
            success: false,
            message: `Container is not running - ${serviceId}`,
            data: false
        };
    }

    await container.stop();

    const info = await container.inspect();

    return {
        success: true,
        message: `Container stopped - ${serviceId}`,
        data: info.State.Running
    };
}

// Function to start a stopped stream
async function startStream(serviceId) {
    const container = data.get(serviceId);

    if (!container) {
        return {
            success: false,
            message: `Container does not exist - ${serviceId}`,
            data: false // assume if you are starting a container it was originally running
        };
    }

    const containerData = await container.inspect();
    const running = containerData.State.Running;

    if (running) {
        return {
            success: false,
            message: `Container is already running - ${serviceId}`,
            data: true
        };
    }

    await container.start();

    const info = await container.inspect();

    return {
        success: true,
        message: `Container started - ${serviceId}`,
        data: info.State.Running
    };
}

// Function to delete a stream from the data map
async function deleteStream(serviceId) {
    const container = data.get(serviceId);

    data.delete(serviceId);

    await container.remove();
}

// Function to stop all stream containers
async function shutdown() {
    for (const service of services.data) {
        const { containerId } = service;

        const container = await docker.getContainer(containerId);

        try {
            await container.stop();
        } catch (error) {
            console.log(`Container already stopped - ${containerId}`);
        }
    }
}

module.exports = {
    loadStreams,
    createContainer,
    stopStream,
    startStream,
    deleteStream,
    shutdown
};