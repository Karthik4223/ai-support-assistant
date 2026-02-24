const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/chat', chatController.chat);
router.get('/conversations/:sessionId', chatController.getConversations);
router.get('/sessions', chatController.getSessions);

module.exports = router;
