const router = require('express').Router();

const services = require('./services.js');
const streams = require('../streams/streams.js');

router.get('/', (req, res) => {
    res.json(services);
});

router.post('/', async (req, res) => {
    const { serviceName, rtmpUrl, streamKey, useTls } = req.body;

    // Check for existing service
    const existingService = services.get(serviceName);
    if (existingService) {
        return res.status(400).json({ error: 'Service with this name already exists' });
    }

    const port = services.getAvailablePort();
    const result = await streams.createContainer(serviceName, port, rtmpUrl, streamKey, useTls, true);

    const created = services.get(result.serviceId);

    res.status(201).json(created);
});

router.post('/enable/:serviceId', async (req, res) => {
    const { serviceId: serviceId } = req.params;

    const service = services.get(serviceId);

    if (!service) {
        return res.status(404).json({ error: 'Service not found' });
    }

    const result = await streams.startStream(serviceId);

    if (!result || !result.success) {
        console.log(result);

        return res.status(500).json({ error: 'Something went wrong' }); 
    } else {
        console.log('=============================');
        console.log('         Action Made         ');
        console.log('=============================');
        console.log(result);
    }

    service.enabled = result.data;

    services.saveServices();

    res.json(services.get(serviceId));
});

router.post('/disable/:serviceId', async (req, res) => {
    const { serviceId: serviceId } = req.params;

    const service = services.get(serviceId);

    if (!service) {
        return res.status(404).json({ error: result.message });
    }

    const result = await streams.stopStream(serviceId);

    if (!result || !result.success) {
        console.log(result);
        
        return res.status(500).json({ error: result.message }); 
    } else {
        console.log('=============================');
        console.log('         Action Made         ');
        console.log('=============================');
        console.log(result);
    }

    service.enabled = result.data;

    services.saveServices();

    res.json(services.get(serviceId));
});



router.get('/:serviceId', async (req, res) => {
    const { serviceId: serviceId } = req.params;

    const service = services.get(serviceId);

    if (!service) {
        return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
});

router.delete('/:serviceId', async (req, res) => {
    const { serviceId: serviceId } = req.params;

    const existingService = services.get(serviceId);
    if (!existingService) {
        return res.status(404).json({ error: 'Service not found' });
    }

    await streams.stopStream(serviceId);

    // Remove the service
    await streams.deleteStream(serviceId);
    
    services.deleteService(serviceId);

    services.saveServices();

    res.json({ message: 'Service deleted successfully' });
});

module.exports = router;
