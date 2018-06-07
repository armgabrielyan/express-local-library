const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {
    BookInstance.find()
        .populate('book')
        .exec((err, bookInstances) => {
            if (err) {
                return next(err);
            }
        
            res.render(
                'bookinstance_list',
                {
                    title: 'BookInstances List',
                    bookInstances
                }
            );
        });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec((err, bookInstance) => {
            if (err) {
                return next(err);
            }

            res.render('bookinstance_detail',{ bookInstance });
        });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
    Book.find()
        .exec((err, books) => {
            if (err) {
                return next(err);
            }

            res.render('bookinstance_form', 
                {
                    title: 'Create BookInstance',
                    book_list: books
                }
            );
        });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        const bookinstance = new BookInstance(body);

        if (!errors.isEmpty()) {
            return Book.find()
                .exec((err, books) => {
                    if (err) {
                        next(err);
                    }

                    res.render('bookinstance_form',
                        {
                            title: 'Create BookInstance',
                            book_list: books,
                            bookinstance,
                            selected_book: bookinstance.book,
                            errors: errors.array()
                        }
                    );
                });
        }

        bookinstance.save(err => {
            if (err) {
                return(err);
            }

            res.redirect(bookinstance.url);
        });
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
    BookInstance.findById(req.params.id)
        .exec((err, bookInstance) => {
            if (err) {
                return next(err);
            }

            res.render('bookinstance_delete',{ bookInstance });
        });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
    BookInstance.findByIdAndRemove(req.body.bookInstanceId)
        .exec(err => {
            if (err) {
                return next(err);
            }

            res.redirect('/catalog/bookinstances');
        });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res, next) => {
    Promise.all([
        BookInstance.findById(req.params.id),
        Book.find()
    ])
        .then(data => {
            const bookinstance = data[0];
            const books = data[1];

            res.render('bookinstance_form',
                {
                    title: 'Update BookInstance',
                    book_list: books,
                    bookinstance,
                    selected_book: bookinstance.book
                }
            );
        })
        .catch(err => next(err));
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        const bookinstance = new BookInstance({
            ...body,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            return Promise.all([
                BookInstance.findById(req.params.id),
                Book.find()
            ])
                .then(data => {
                    const bookinstance = data[0];
                    const books = data[1];
        
                    res.render('bookinstance_form',
                        {
                            title: 'Update BookInstance',
                            book_list: books,
                            bookinstance,
                            selected_book: bookinstance.book,
                            errors: errors.array()
                        }
                    );
                })
                .catch(err => next(err));
        }

        BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, (err, updatedBookInstance) => {
            if (err) {
                return next(err);
            }

            res.redirect(bookinstance.url);
        });
    }
];
