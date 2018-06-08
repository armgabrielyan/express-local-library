const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');


exports.index = (req, res, next) => {
    Promise.all([
        Book.find().count(),
        BookInstance.find().count(),
        BookInstance.find({ status: 'Available' }).count(),
        Author.find().count(),
        Genre.find().count()
    ])
        .then(data => {
            const [
                bookCount, 
                bookInstanceCount, 
                bookInstanceAvailableCount, 
                authorCount, 
                genreCount
            ] = data;

            res.render(
                'index',
                {
                    title: 'Local Library Home',
                    bookCount, 
                    bookInstanceCount, 
                    bookInstanceAvailableCount, 
                    authorCount, 
                    genreCount
                }
            );
        })
};

// Display list of all books.
exports.book_list = (req, res, next) => {
    Book.find()
        .populate('author')
        .exec((err, books) => {
            if (err) {
                return next(err);
            }

            res.render('book_list', { title: 'Books List', books });
        });
};

// Display detail page for a specific book.
exports.book_detail = (req, res, next) => {
    Promise.all([
        Book.findById(req.params.id).populate('genre'),
        BookInstance.find({ book: req.params.id })
    ])
        .then(data => {
            const [book, bookInstances] = data;
            res.render('book_detail', { title: 'Book Detail', book, bookInstances });
        })
        .catch(err => next(err));
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
exports.book_delete_get = (req, res, next) => {
    Promise.all([
        Book.findById(req.params.id).populate('genre'),
        BookInstance.find({ book: req.params.id })
    ])
        .then(data => {
            const [book, bookInstances] = data;
            res.render('book_delete', { title: 'Delete Book', book, bookInstances });
        })
        .catch(err => next(err));
};

// Handle book delete on POST.
exports.book_delete_post = (req, res, next) => {
    Book.findByIdAndRemove(req.body.id)
        .exec(err => {
            if (err) {
                return next(err);
            }

            res.redirect('/catalog/books');
        });
};

// Display book update form on GET.
exports.book_update_get = (req, res, next) => {
    Promise.all([
        Book.findById(req.params.id).populate('author').populate('genre'),
        Author.find(),
        Genre.find()
    ])
        .then(data => {
            const book = data[0];
            const authors = data[1];
            const genres = data[2];

            if (book === null) {
                const err = new Error('Book is not found');
                err.status = 404;
                return next(err);
            }

            genres.forEach(genre => {
                const ids = book.genre.map(bookGenre => bookGenre._id.toString());
                if (ids.indexOf(genre._id.toString()) !== -1) {
                    genre.checked = true;
                }
            });

            res.render('book_form', 
                {
                    title: 'Update Book',
                    authors,
                    genres,
                    book
                }
            );
        })
        .catch(err => next(err));
};

// Handle book update on POST.
exports.book_update_post = [
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
        const book = new Book({
            ...body,
            genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            return Promise.all([
                Author.find(),
                Genre.find()
            ])
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
                            title: 'Update Book',
                            authors,
                            genres,
                            book,
                            errors: errors.array()
                        }
                    );
                })
                .catch(err => next(err));
        }

        Book.findByIdAndUpdate(req.params.id, book, {}, (err, updatedBook) => {
            if (err) {
                return next(err);
            }

            res.redirect(updatedBook.url);
        });
    }
]
