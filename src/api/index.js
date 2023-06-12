const router = require('express').Router();
const services = require('./services/services.route');

router.get('/', (req, res) => {
  res.status(200).json({
    message: '🍕 Api route 🍕',
  });
});

// routes registration
router.use('/services', services);

module.exports = router;