const express = require('express');
const router = express.Router();

const bookInstanceController = require('../controllers/bookInstanceController');

router.get('/book-instance/create', bookInstanceController.bookInstanceCreateGet);
router.post('/book-instance/create', bookInstanceController.bookInstanceCreatePost);
router.get('/book-instance/:id/delete', bookInstanceController.bookInstanceDeleteGet);
router.post('/book-instance/:id/delete', bookInstanceController.bookInstanceDeletePost);
router.get('/book-instance/:id/update', bookInstanceController.bookInstanceUpdateGet);
router.post('/book-instance/:id/update', bookInstanceController.bookInstanceUpdatePost);
router.get('/book-instance/:id', bookInstanceController.bookInstanceDetail);
router.get('/book-instances', bookInstanceController.bookInstanceList);

module.exports = router;
