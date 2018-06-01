const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance list');
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);
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
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};