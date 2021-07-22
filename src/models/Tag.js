const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let TagSchema = new Schema({
    imagePaths: [String],
    // tag title is unique, so it's role is ID
    title: {type:String, require:true, unique:true},
    description: {type:String, require:true}
});
module.exports = mongoose.model("Tag", TagSchema)

