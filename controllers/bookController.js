const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');

exports.index = function(req, res) {
    res.send('NOT IMPLEMENTED: Site Home Page');
};

// Display list of all books.
exports.book_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Book list');
};

// Display detail page for a specific book.
exports.book_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
};

// Display book create form on GET.
exports.book_create_get = (req, res, next) => {
    Promise.all([Author.find(), Genre.find()])
        .then(data=> {
            const authors = data[0];
            const genres = data[1];
            res.render('book_form', 
                {
                    title: 'Create Book',
                    authors,
                    genres
                }
            );
        })
        .catch(err => next(err));
};

// Handle book create on POST.
exports.book_create_post = [
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (req.body.genre === undefined) {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty.').isLength({ min: 1 }).trim(),
    sanitizeBody('*').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        const book = new Book(body);

        if (!errors.isEmpty()) {
            return Promise.all([Author.find(), Genre.find()])
                .then(data => {
                    const authors = data[0];
                    const genres = data[1];

                    for (genre of genres) {
                        if (book.genre.indexOf(genre._id) !== -1) {
                            genre.checked = true;
                        }
                    }

                    res.render('book_form',
                        {
                            title: 'Create Book',
                            authors,
                            genres,
                            book,
                            errors: errors.array()
                        }
                    );
                })
                .catch(err => next(err));
        }

        book.save(err => {
            if (err) {
                return next(err);
            }

            res.redirect(book.url);
        });
    }
];

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};
