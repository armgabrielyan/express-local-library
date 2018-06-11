const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');

router.get('/book/create', bookController.bookCreateGet);
router.post('/book/create', bookController.bookCreatePost);
router.get('/book/:id/delete', bookController.bookDeleteGet);
router.post('/book/:id/delete', bookController.bookDeletePost);
router.get('/book/:id/update', bookController.bookUpdateGet);
router.post('/book/:id/update', bookController.bookUpdatePost);
router.get('/book/:id', bookController.bookDetail);
router.get('/books', bookController.bookList);

module.exports = router;
