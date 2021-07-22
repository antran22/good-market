const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let TagSchema = new Schema({
    imagePaths: [String],
    title: {type:String, require:true},
    description: {type:String, require:true}
});
module.exports = mongoose.model("Tag", TagSchema)

