const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Author = require('../models/author');
const Book = require('../models/book');

const validateAuthor = [
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
];

exports.authorList = (req, res, next) => {
    Author.find((err, authors) => {
        if (err) {
            return next(err);
        }

        res.render('author_list', 
            {
                title: 'Authors List',
                authors
            }
        );
    });
};

exports.authorDetail = (req, res, next) => {
    Promise.all([
        Author.findById(req.params.id),
        Book.find({ author: req.params.id })
    ])
        .then(data => {
            const [author, authorBooks] = data;

            res.render('author_detail',
                {
                    author,
                    authorBooks
                }
            );
        })
        .catch(next);
};

exports.authorCreateGet = (req, res) => res.render('author_form', { title: 'Create Author' });

exports.authorCreatePost = [
    validateAuthor,
    (req, res, next) => {
        const { body } = req;
        const author = new Author(body);
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            res.render('author_form',
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

exports.authorDeleteGet = (req, res, next) => {
    Promise.all([
        Author.findById(req.params.id),
        Book.find({ 'author': req.params.id })
    ])
        .then(data => {
            const [author, authorBooks] = data;

            if (author === null) {
                res.redirect('/catalog/authors');
            }

            res.render('author_delete',
                {
                    title: 'Delete author',
                    author,
                    authorBooks
                }
            );
        })
        .catch(next);
};

exports.authorDeletePost = (req, res, next) => {
    const { authorId } = req.body;
    Promise.all([
        Author.findById(authorId),
        Book.find({ 'author': authorId })
    ])
        .then(data => {
            const [author, authorBooks] = data;

            if (authorBooks.length > 0) {
                res.render('author_delete',
                    {
                        title: 'Delete author',
                        author,
                        authorBooks
                    }
                );
            }

            Author.findByIdAndRemove(authorId)
                .exec(err => {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/catalog/authors');
                });
        })
        .catch(next);
};

exports.authorUpdateGet = (req, res, next) => {
    Author.findById(req.params.id)
        .exec((err, author) => {
            if (err) {
                next(err);
            }

            res.render('author_form', 
                {
                    title: 'Update Author',
                    author
                }
            );
        });
};

exports.authorUpdatePost = [
    validateAuthor,
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
