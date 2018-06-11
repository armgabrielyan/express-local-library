const express = require('express');
const router = express.Router();

const authorController = require('../controllers/authorController');

router.get('/author/create', authorController.authorCreateGet);
router.post('/author/create', authorController.authorCreatePost);
router.get('/author/:id/delete', authorController.authorDeleteGet);
router.post('/author/:id/delete', authorController.authorDeletePost);
router.get('/author/:id/update', authorController.authorUpdateGet);
router.post('/author/:id/update', authorController.authorUpdatePost);
router.get('/author/:id', authorController.authorDetail);
router.get('/authors', authorController.authorList);

module.exports = router;
