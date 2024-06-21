var express = require('express');
var router = express.Router();

const messageController = require('../../controllers/message.controller');


router.post('/:discussion/:sender', messageController.createMessage);
router.get('/:discussionId', messageController.getMessages);
router.delete('/:messageId', messageController.deleteMessage);
router.put('/:messageId', messageController.updateMessage);
router.patch('/:messageId', messageController.markAsRead);






module.exports = router;