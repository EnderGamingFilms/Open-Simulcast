import fs from 'fs';
import path from 'path';

let services = [];

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Function to load services from the JSON file
function loadServices() {
    const filePath = path.join(__dirname, 'services.json');
    if (fs.existsSync(filePath)) {
        const servicesJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        for (const service of servicesJson) {
            addService(service);
        }
    }
}

// Function to add a new service
function addService(service) {
    services.push(service);
}

// Function to modify an existing service
function modifyService(serviceName, newService) {
    const index = services.findIndex(service => service.serviceName === serviceName);
    if (index !== -1) {
        services[index] = newService;
    }
}

// Function to delete a service
function deleteService(serviceName) {
    services = services.filter(service => service.serviceName !== serviceName);
}

// Function to save the services to disk
function saveServices() {
    fs.writeFileSync('services.json', JSON.stringify(services), 'utf8');
}

// module.exports = {
//     loadServices,
//     addService,
//     modifyService,
//     deleteService,
//     saveServices,
//     services
// };

export { saveServices, loadServices, addService, deleteService, modifyService, services };
