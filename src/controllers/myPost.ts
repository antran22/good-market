import {Router} from "express";
import Post from "@/models/Post";
const myPostRouter = Router()
import TagModel, {ITag} from "@/models/Tag" ;
import PostModel from "@/models/Post";
import {PopulatedDoc} from "mongoose";
import {IUser} from "@/models/User";


myPostRouter.get('/post/me', function renderFilteredPost(req, res, next) {
    // console.log(req.user);
    if (!req.isAuthenticated()){
        res.redirect('/login');
    } else{
        PostModel.find({seller: req.user._id}).exec(function (err, posts) {
            const chunks = [];
            for (let post of posts) {
                chunks.push(post);
            };
            res.renderTemplate('template/postList', {post: chunks});
        });
    }
});
myPostRouter.get('/post/me/create', async function renderCreatePost(req, res) {
    if (!req.isAuthenticated()){
        res.redirect('/login');
        return;
    }
    console.log(req);
    res.renderTemplate('template/postCreator');
    // res.redirect('/post/me');
})

myPostRouter.post('/post/me/create', async function turnBack(req, res) {
    if (!req.isAuthenticated()){
        res.redirect('/login');
        return;
    }
    console.log(req.body)
    let newPost = new PostModel({
        title: req.body.title,
        images: [],
        description: req.body.description,
        price: req.body.price,
        tags: [],
        seller: req.user._id
    })
    await newPost.save();
    console.log(req.body);
    // console.log(res);
    res.redirect('/post/me');

})

export default myPostRouter;