// Load required packages
import Docker from 'dockerode';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import * as services from './services.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Initialize Docker client
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Store NodeMediaServer instances
const streams = new Map();

// Create Express app
const app = express();
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.json());

// ...Express routes...
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.get('/services', (req, res) => {
    res.json(services.services);
});

app.post('/services', async (req, res) => {
    const { serviceName, rtmpUrl, streamKey, useTls } = req.body;

    // Check for existing service
    const existingService = services.services.find(service => service.serviceName === serviceName);
    if (existingService) {
        return res.status(400).json({ error: 'Service with this name already exists' });
    }

    const port = getAvailablePort();
    await createContainer(serviceName, port, rtmpUrl, streamKey, useTls);

    res.status(201).json({ message: 'Service created successfully' });
});

app.put('/services/:serviceName', (req, res) => {
    const { serviceName } = req.params;
    const newService = req.body;

    const existingService = services.services.find(service => service.serviceName === serviceName);
    if (!existingService) {
        return res.status(404).json({ error: 'Service not found' });
    }

    services.modifyService(serviceName, newService);

    res.json({ message: 'Service modified successfully' });
});

app.delete('/services/:serviceName', (req, res) => {
    const { serviceName } = req.params;

    const existingService = services.services.find(service => service.serviceName === serviceName);
    if (!existingService) {
        return res.status(404).json({ error: 'Service not found' });
    }

    // Stop and remove the Docker container
    const { container } = streams.get(serviceName);
    container.stop();
    container.remove();

    // Remove the service
    services.deleteService(serviceName);
    streams.delete(serviceName);

    res.json({ message: 'Service deleted successfully' });
});


// Listen for shutdown signal
process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down...');

    // ...Stop all Docker containers instances...
    streams.forEach(stream => stream.container.stop());

    // ...Save services to disk...
    services.saveServices();

    process.exit();
});

// Start the express server
const port = process.env.WEBUI_PORT || 3000;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});

app.on('ready', () => {
    // Load services from file
    loadStreams();
});

// Load services from a saved configuration
async function loadStreams() {
    // Load saved services from the file
    services.loadServices();

    for (const service of service.services) {
        const { serviceName, port, rtmpUrl, streamKey, useTls, enabled, containerId } = service;

        // Check if a container for the service already exists
        try {
            const container = docker.getContainer(containerId);
            const containerData = await container.inspect();


            streams.set(serviceName, { container, port });

            // Start or stop the container based on the service's enabled status
            if (!containerData.State.Running && enabled) {
                await container.start();
            } else {
                await container.stop();
            }
        } catch (error) {
            // If the container does not exist, create a new one
            await createContainer(serviceName, port, rtmpUrl, streamKey, useTls);
        }
    }
}

// Get an available port for a new container
function getAvailablePort() {
    let port = 1936; // Start from port 1936 since 1935 is used by the main server
    let maxPort = port;
    for (const service of streams.services) {
        if (service.port > maxPort) {
            maxPort = service.port;
        }
    }
    return ++maxPort;
}

// Function to create and start a container
async function createContainer(serviceName, port, rtmpUrl, streamKey, useTls) {
    // Generate a unique identifier for the container
    const containerName = `${serviceName}-${uuidv4()}`;
    const configPath = path.join('/mnt/user/appdata/My-Custom-App/local/containers/', containerName);

    const pushUrl = useTls ? `rtmp://127.0.0.1:19350/service` : `rtmp://${rtmpUrl}`;

    const container = await docker.createContainer({
        Image: 'endergamingfilms/nginx-rtmps', // The image for your nginx-rtmps server
        Env: [
            `RTMP_PUSH_URL=${pushUrl}`,
            `STREAM_KEY=${streamKey}`,
            `STUNNEL_CONNECT_URL=${rtmpUrl}`
        ],
        name: containerName,
        HostConfig: {
            Binds: [`${configPath}:/app/data`],
            PortBindings: {
                "1935/tcp": [
                    {
                        "HostPort": `${port}`
                    }
                ]
            }
        }
    });

    streams.set(containerName, container);
    await container.start();

    // Add service to services
    services.addService({
        serviceName,
        port,
        rtmpUrl,
        streamKey,
        useTls,
        enabled: true,
        containerId: container.id // For instance
    });
}


