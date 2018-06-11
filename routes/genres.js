const express = require('express');
const router = express.Router();

const genreController = require('../controllers/genreController');

router.get('/genre/create', genreController.genreCreateGet);
router.post('/genre/create', genreController.genreCreatePost);
router.get('/genre/:id/delete', genreController.genreDeleteGet);
router.post('/genre/:id/delete', genreController.genreDeletePost);
router.get('/genre/:id/update', genreController.genreUpdateGet);
router.post('/genre/:id/update', genreController.genreUpdatePost);
router.get('/genre/:id', genreController.genreDetail);
router.get('/genres', genreController.genreList);

module.exports = router;
