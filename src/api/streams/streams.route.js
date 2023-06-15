const router = require('express').Router();

const streams = require('./streams.js');

router.get('/', (req, res) => {
    res.json(streams);
});

router.get('/less', (req, res) => {
    let data = [];

    for (const [key, value] of streams.entries()) {
        data.push({
            serviceId: key,
            containerId: value.id
        });
    }

    res.json(data);
});

module.exports = router;
