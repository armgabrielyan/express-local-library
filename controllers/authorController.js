const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Author = require('../models/author');

// Display list of all Authors.
exports.author_list = (req, res) => {
    res.send('NOT IMPLEMENTED: Author list');
};

// Display detail page for a specific Author.
exports.author_detail = (req, res) => {
    res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
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
exports.author_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};
