const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/chat', chatController.chat);
router.get('/conversations/:sessionId', chatController.getConversations);
router.get('/sessions', chatController.getSessions);
router.get('/api-keys', chatController.getApiKeys);
router.post('/api-keys', chatController.saveApiKey);
router.delete('/api-keys/:id', chatController.deleteApiKey);

module.exports = router;
