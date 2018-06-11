var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController');

router.get('/catalog', indexController.index);
router.get('/', (req, res) => res.redirect('/catalog'));

module.exports = router;
