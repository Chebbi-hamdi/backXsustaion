var express = require('express');
var router = express.Router();

const discussionController = require('../../controllers/discussion.controller');

router.post('/:IdSender', discussionController.createDiscussion);
router.get('/get/:participants', discussionController.getExistingDiscussion);
router.get('/Conversation/:id/:pageNumber', discussionController.getConversationLoad);
router.get('/Conversation/:id', discussionController.getConversation);
router.get('/:discussionId', discussionController.getDiscussions);
router.get('/disc/:discussionId', discussionController.getDiscussionsAdmin);
router.get('/', discussionController.getAllDiscussions);
router.get('/getConversationById/:Id1', discussionController.getConversationById);
router.put('/:discussionId', discussionController.updateDiscussion);

module.exports = router;
