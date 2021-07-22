const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let CommentSchema = new Schema({
    ID: {type: String, required: true, unique: true},
    imagePaths: [{type: String, require: true}],
    title: {type: String, require: true},
    description: {type: String, require: true},
    author: {type: String, require: true},
    last_update: Date
});
module.exports = mongoose.model("Comment", CommentSchema)

