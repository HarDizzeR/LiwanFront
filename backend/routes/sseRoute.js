const express = require('express');
const router = express.Router();
const { sseConnect, getConnectedClients } = require('../controllers/sseController');
const { protect } = require('../controllers/authController');

// SSE connection endpoint
router.get('/connect', protect, sseConnect);

// Health check endpoint
router.get('/status', protect, (req, res) => {
  res.json(getConnectedClients());
});

router.get('/debug/auth', protect, (req, res) => {
    res.json({
      user: req.employee,
      headers: req.headers
    });
  });
  
  router.get('/debug/connections', protect, (req, res) => {
    res.json(getConnectedClients());
  });

module.exports = router;