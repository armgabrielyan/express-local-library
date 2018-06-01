const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Genre = require('../models/genre');

// Display list of all Genre.
exports.genre_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre list');
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => res.render('genre_form', { title: 'Create Genre' });

// Handle Genre create on POST.
exports.genre_create_post = [
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    sanitizeBody('name').trim().escape(),
    (req, res, next) => {
        const { body } = req;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('genre_form', 
                { 
                    title: 'Create Genre',
                    genre: body,
                    errors: errors.array()
                }
            );
        }

        Genre.findOne({ name: body.name })
            .exec((err, foundGenre) => {
                if (err) {
                    return next(err);
                }

                if (foundGenre) {
                    res.redirect(foundGenre.url);
                }

                Genre.create({ name: body.name }, (err, genre) => {
                    if (err) {
                        return next(err);
                    }

                    res.redirect(genre.url);
                })
            });
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};
