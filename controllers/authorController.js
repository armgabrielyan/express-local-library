const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Author = require('../models/author');
const Book = require('../models/book');

// Display list of all Authors.
exports.author_list = (req, res, next) => {
    Author.find((err, authors) => {
        if (err) {
            return next(err);
        }

        res.render(
            'author_list', 
            {
                title: 'Authors List',
                authors
            }
        );
    });
};

// Display detail page for a specific Author.
exports.author_detail = (req, res, next) => {
    Promise.all([
        Author.findById(req.params.id),
        Book.find({ author: req.params.id })
    ])
        .then(data => {
            const author = data[0];
            const authorBooks = data[1];

            res.render(
                'author_detail',
                {
                    author,
                    authorBooks
                }
            );
        })
        .catch(err => next(err));
};

// Display Author create form on GET.
exports.author_create_get = (req, res) => res.render('author_form', { title: 'Create Author' });

// Handle Author create on POST.
exports.author_create_post = [
    body('first_name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('First name must be specified.')
        .isAlphanumeric()
        .withMessage('First name has non-alphanumeric characters.'),
    body('last_name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Last name must be specified.')
        .isAlphanumeric()
        .withMessage('Last name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('last_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),
    (req, res, next) => {
        const { body } = req;
        const author = new Author(body);
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('author_form',
                {
                    title: 'Create Author',
                    author,
                    errors: errors.array()
                }
            );
        }

        author.save(err => {
            if (err) {
                return next(err);
            }

            res.redirect(author.url);
        });
    }
];


// Display Author delete form on GET.
exports.author_delete_get = (req, res, next) => {
    Promise.all([
        Author.findById(req.params.id),
        Book.find({ 'author': req.params.id })
    ])
        .then(data => {
            const author = data[0];
            const books = data[1];

            if (author === null) {
                res.redirect('/catalog/authors');
            }

            res.render('author_delete',
                {
                    title: 'Delete author',
                    author,
                    author_books: books
                }
            );
        })
        .catch(err => next(err));
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
    const { authorid } = req.body;
    Promise.all([
        Author.findById(authorid),
        Book.find({ 'author': authorid })
    ])
        .then(data => {
            const author = data[0];
            const books = data[1];

            if (books.length > 0) {
                res.render('author_delete',
                    {
                        title: 'Delete author',
                        author,
                        author_books: books
                    }
                );
            }

            Author.findByIdAndRemove(authorid)
                .exec(err => {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/catalog/authors');
                });
        })
        .catch(err => next(err));
};

// Display Author update form on GET.
exports.author_update_get = (req, res, next) => {
    Author.findById(req.params.id)
        .exec((err, author) => {
            if (err) {
                next(err);
            }

            res.render(
                'author_form', 
                {
                    title: 'Update Author',
                    author
                }
            );
        });
};

// Handle Author update on POST.
exports.author_update_post = [
    body('first_name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('First name must be specified.')
        .isAlphanumeric()
        .withMessage('First name has non-alphanumeric characters.'),
    body('last_name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Last name must be specified.')
        .isAlphanumeric()
        .withMessage('Last name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('last_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        const author = new Author({
            ...body,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            res.render(
                'author_form', 
                {
                    title: 'Update Author',
                    author,
                    errors: errors.array()
                }
            );
        }

        Author.findByIdAndUpdate(req.params.id, author, {}, (err, updatedAuthor) => {
            if (err) {
                return next(err);
            }

            res.redirect(updatedAuthor.url);
        });
    }
];
