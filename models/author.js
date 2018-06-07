const mongoose = require('mongoose');
const moment = require('moment');

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

AuthorSchema
    .virtual('lifespan')
    .get(function() {
        const finalYear = this.date_of_death || Date.now();
        return moment(finalYear).diff(this.date_of_birth, 'years');
    });

AuthorSchema
    .virtual('date_of_birth_yyyy_mm_dd')
    .get(function() {
        return moment(this.date_of_birth).format('YYYY-MM-DD');
    });

AuthorSchema
    .virtual('date_of_death_yyyy_mm_dd')
    .get(function() {
        return moment(this.date_of_death).format('YYYY-MM-DD');
    });

module.exports = mongoose.model('Author', AuthorSchema);
