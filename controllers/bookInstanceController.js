const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const BookInstance = require('../models/bookInstance');
const Book = require('../models/book');

const validateBookInstance = [
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
];

exports.bookInstanceList = (req, res, next) => {
    BookInstance.find()
        .populate('book')
        .exec((err, bookInstances) => {
            if (err) {
                return next(err);
            }
        
            res.render('book_instance_list',
                {
                    title: 'BookInstances List',
                    bookInstances
                }
            );
        });
};

exports.bookInstanceDetail = (req, res, next) => {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec((err, bookInstance) => {
            if (err) {
                return next(err);
            }

            res.render('book_instance_detail',{ bookInstance });
        });
};

exports.bookInstanceCreateGet = (req, res, next) => {
    Book.find()
        .exec((err, books) => {
            if (err) {
                return next(err);
            }

            res.render('book_instance_form', 
                {
                    title: 'Create BookInstance',
                    books
                }
            );
        });
};

exports.bookInstanceCreatePost = [
    validateBookInstance,
    (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        const bookInstance = new BookInstance(body);

        if (!errors.isEmpty()) {
            return Book.find()
                .exec((err, books) => {
                    if (err) {
                        next(err);
                    }

                    res.render('book_instance_form',
                        {
                            title: 'Create BookInstance',
                            books,
                            bookInstance,
                            selectedBook: bookInstance.book,
                            errors: errors.array()
                        }
                    );
                });
        }

        bookInstance.save(err => {
            if (err) {
                return(err);
            }

            res.redirect(bookInstance.url);
        });
    }
];

exports.bookInstanceDeleteGet = (req, res, next) => {
    BookInstance.findById(req.params.id)
        .exec((err, bookInstance) => {
            if (err) {
                return next(err);
            }

            res.render('book_instance_delete',{ bookInstance });
        });
};

exports.bookInstanceDeletePost = (req, res, next) => {
    BookInstance.findByIdAndRemove(req.body.bookInstanceId)
        .exec(err => {
            if (err) {
                return next(err);
            }

            res.redirect('/catalog/book-instances');
        });
};

exports.bookInstanceUpdateGet = (req, res, next) => {
    Promise.all([
        BookInstance.findById(req.params.id),
        Book.find()
    ])
        .then(data => {
            const [bookInstance, books] = data;

            res.render('book_instance_form',
                {
                    title: 'Update BookInstance',
                    books,
                    bookInstance,
                    selectedBook: bookInstance.book
                }
            );
        })
        .catch(next);
};

exports.bookInstanceUpdatePost = [
    validateBookInstance,
    (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        const bookInstance = new BookInstance({
            ...body,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            return Promise.all([
                BookInstance.findById(req.params.id),
                Book.find()
            ])
                .then(data => {
                    const [bookInstance, books] = data
        
                    res.render('book_instance_form',
                        {
                            title: 'Update BookInstance',
                            books,
                            bookInstance,
                            selectedBook: bookinstance.book,
                            errors: errors.array()
                        }
                    );
                })
                .catch(next);
        }

        BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {}, (err, updatedBookInstance) => {
            if (err) {
                return next(err);
            }

            res.redirect(bookInstance.url);
        });
    }
];
