require('dotenv').config()

const app = require('./app');

const streams = require('./api/streams/streams.js');
const services = require('./api/services/services.js');

const port = process.env.PORT || 5678;

app.listen(port, () => {
	console.log(`Server is up at port http://localhost:${port}`);

    // Load saved services from the file	
	streams.loadStreams();
});

process.on('SIGINT', async () => {
    console.log('Shutting down streams and saving services...');

    services.saveServices();

    await streams.shutdown();

    process.exit();
});
