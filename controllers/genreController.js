const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Genre = require('../models/genre');
const Book = require('../models/book');

// Display list of all Genre.
exports.genre_list = (req, res, next) => {
    Genre.find((err, genres) => {
        if (err) {
            return next(err);
        }

        res.render('genre_list', { title: 'Genres List', genres });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
    Promise.all([
        Genre.findById(req.params.id),
        Book.find({ genre: req.params.id })
    ])
        .then(data => {
            const genre = data[0];
            const genreBooks = data[1];

            res.render('genre_detail', 
                { 
                    title: 'Create Genre',
                    genre,
                    genreBooks
                }
            );
        })
        .catch(err => next(err));
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
            res.render('genre_form', 
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
exports.genre_delete_get = (req, res, next) => {
    Promise.all([
        Genre.findById(req.params.id),
        Book.find({ genre: req.params.id })
    ])
        .then(data => {
            const genre = data[0];
            const genreBooks = data[1];

            res.render('genre_delete', { genre, genreBooks });
        })
        .catch(err => next(err));
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
    const { id } = req.body;
    Promise.all([
        Genre.findById(id),
        Book.find({ genre: id })
    ])
        .then(data => {
            const genre = data[0];
            const genreBooks = data[1];

            if (genreBooks.length > 0) {
                res.render('genre_delete', { genre, genreBooks });
            }

            Genre.findByIdAndRemove(id)
                .exec(err => {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/catalog/genres');
                })
        })
        .catch(err => next(err));
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
    Genre.findById(req.params.id)
        .exec((err, genre) => {
            if (err) {
                return next(err);
            }

            return res.render('genre_form', { title: 'Update Genre', genre });
        });
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    sanitizeBody('name').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        const genre = new Genre({
            ...body,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            res.render('genre_form', 
                { 
                    title: 'Update Genre',
                    genre,
                    errors: errors.array()
                }
            );
        }

        Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, updatedGenre) => {
            if (err) {
                return next(err);
            }

            res.redirect(updatedGenre.url);
        });
    }
];
