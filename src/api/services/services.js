const fs = require('fs');
const path = require('path');

let data = [];

const filePath = process.env.SERVICES_PATH || path.resolve(__dirname, '../../../local/services.json');

// Function to load services from the JSON file
async function loadServices() {
    console.log('Loading services...');

    if (fs.existsSync(filePath)) {
        const servicesJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        for (const service of servicesJson) {
            addService(service);
        }
    }
}

// Function to add a new service
function addService(service) {
    // If this service already exists, modify it instead
    const existingService = get(service.serviceId);

    if (existingService) {
        modifyService(service.serviceId, service);
        return;
    }

    data.push(service);
}

// Function to get a service by name
function get(serviceId) {
    return data.find(service => service.serviceId === serviceId);
}

// Function to modify an existing service
function modifyService(serviceId, newService) {
    const index = data.findIndex(service => service.serviceId === serviceId);
    if (index !== -1) {
        data[index] = newService;
    }
}

// Function to delete a service
function deleteService(serviceId) {
    data = data.filter(service => service.serviceId !== serviceId);
}

// Function to save the services to disk
function saveServices() {
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
}

// Get an available port for a new service
function getAvailablePort() {
    let port = 1936; // Start from port 1936 since 1935 is used by the main server
    let maxPort = port;
    for (const service of data) {
        if (service.port > maxPort) {
            maxPort = service.port;
        }
    }
    return ++maxPort;
}

function randomIdentifier(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

module.exports = {
    loadServices,
    addService,
    modifyService,
    deleteService,
    saveServices,
    getAvailablePort,
    randomIdentifier,
    get,
    data
};
