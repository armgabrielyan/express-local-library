const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookInstance');

const validateBook = [
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
];

exports.bookList = (req, res, next) => {
    Book.find()
        .populate('author')
        .exec((err, books) => {
            if (err) {
                return next(err);
            }

            res.render('book_list', { title: 'Books List', books });
        });
};

exports.bookDetail = (req, res, next) => {
    Promise.all([
        Book.findById(req.params.id).populate('genre'),
        BookInstance.find({ book: req.params.id })
    ])
        .then(data => {
            const [book, bookInstances] = data;
            res.render('book_detail', { title: 'Book Detail', book, bookInstances });
        })
        .catch(next);
};

exports.bookCreateGet = (req, res, next) => {
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
        .catch(next);
};

exports.bookCreatePost = [
    validateBook,
    (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        const book = new Book(body);

        if (!errors.isEmpty()) {
            return Promise.all([Author.find(), Genre.find()])
                .then(data => {
                    const [authors, genres] = data;

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
                .catch(next);
        }

        book.save(err => {
            if (err) {
                return next(err);
            }

            res.redirect(book.url);
        });
    }
];

exports.bookDeleteGet = (req, res, next) => {
    Promise.all([
        Book.findById(req.params.id).populate('genre'),
        BookInstance.find({ book: req.params.id })
    ])
        .then(data => {
            const [book, bookInstances] = data;
            res.render('book_delete', { title: 'Delete Book', book, bookInstances });
        })
        .catch(next);
};

exports.bookDeletePost = (req, res, next) => {
    Book.findByIdAndRemove(req.body.id)
        .exec(err => {
            if (err) {
                return next(err);
            }

            res.redirect('/catalog/books');
        });
};

exports.bookUpdateGet = (req, res, next) => {
    Promise.all([
        Book.findById(req.params.id).populate('author').populate('genre'),
        Author.find(),
        Genre.find()
    ])
        .then(data => {
            const [book, authors, genres] = data;

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

exports.bookUpdatePost = [
    validateBook,
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
                    const [authors, genres] = data;

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
                .catch(next);
        }

        Book.findByIdAndUpdate(req.params.id, book, {}, (err, updatedBook) => {
            if (err) {
                return next(err);
            }

            res.redirect(updatedBook.url);
        });
    }
];
