const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Genre = require('../models/genre');
const Book = require('../models/book');

const validateGenre = [
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    sanitizeBody('name').trim().escape(),
];

exports.genreList = (req, res, next) => {
    Genre.find((err, genres) => {
        if (err) {
            return next(err);
        }

        res.render('genre_list', { title: 'Genres List', genres });
    });
};

exports.genreDetail = (req, res, next) => {
    Promise.all([
        Genre.findById(req.params.id),
        Book.find({ genre: req.params.id })
    ])
        .then(data => {
            const [genre, genreBooks] = data;

            res.render('genre_detail', 
                { 
                    title: 'Create Genre',
                    genre,
                    genreBooks
                }
            );
        })
        .catch(next);
};

exports.genreCreateGet = (req, res) => res.render('genre_form', { title: 'Create Genre' });

exports.genreCreatePost = [
    validateGenre,
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

exports.genreDeleteGet = (req, res, next) => {
    Promise.all([
        Genre.findById(req.params.id),
        Book.find({ genre: req.params.id })
    ])
        .then(data => {
            const [genre, genreBooks] = data;
            res.render('genre_delete', { genre, genreBooks });
        })
        .catch(next);
};

exports.genreDeletePost = (req, res, next) => {
    const { id } = req.body;
    Promise.all([
        Genre.findById(id),
        Book.find({ genre: id })
    ])
        .then(data => {
            const [genre, genreBooks] = data;

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
        .catch(next);
};

exports.genreUpdateGet = (req, res, next) => {
    Genre.findById(req.params.id)
        .exec((err, genre) => {
            if (err) {
                return next(err);
            }

            return res.render('genre_form', { title: 'Update Genre', genre });
        });
};

exports.genreUpdatePost = [
    validateGenre,
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
