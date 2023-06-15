const router = require('express').Router();
const services = require('./services/services.route');
const streams = require('./streams/streams.route');

router.get('/', (req, res) => {
  res.status(200).json({
    message: '🍕 Api route 🍕',
  });
});

// routes registration
router.use('/services', services);
router.use('/streams', streams);

module.exports = router;