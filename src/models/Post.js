const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let PostSchema = new Schema({
        ID: {type:String, required:true, unique:true},
        imagePaths: [{type:String, require:true}],
        title: {type:String, require:true},
        description: {type:String, require:true},
        price: {type:Number, require:true},
        seller: {type:String, require:true},
        tags:[String],
        comments:[String]
    });
module.exports = mongoose.model("Post", PostSchema)

