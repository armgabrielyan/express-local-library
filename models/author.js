const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        maxlength: 100
    },
    last_name: {
        type: String,
        required: true,
        maxlength: 100
    },
    date_of_birth: Date,
    date_of_death: Date
});

AuthorSchema
    .virtual('name')
    .get(function() {
        return `${this.first_name} ${this.last_name}`;
    });

AuthorSchema
    .virtual('url')
    .get(function() {
        return `/catalog/author/${this._id}`;
    });

module.exports = mongoose.model('Author', AuthorSchema);
