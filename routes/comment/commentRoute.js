var express = require('express');
var router = express.Router();

const commentController = require('../../controllers/comment.controller');

router.post('/', commentController.createComment);
router.get('/', commentController.getComments);
router.get('/:commentId', commentController.getComment);
router.put('/:commentId', commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;