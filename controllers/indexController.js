const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookInstance');

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
        .catch(next);
};
