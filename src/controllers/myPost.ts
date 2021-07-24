import {Router} from "express";

const myPostRouter = Router()
import PostModel from "@/models/Post";
import multerUpload from "@/utils/multer";

myPostRouter.get('/post/me', (req, res) => {
    // console.log(req.user);
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        PostModel.find({seller: req.user._id}).exec(function (err, posts) {
            const chunks = [];
            for (let post of posts) {
                chunks.push(post);
            }
            res.renderTemplate('template/postList', {post: chunks});
        });
    }
});
myPostRouter.get('/post/me/create',
    async function renderCreatePost(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/login');
            return;
        }
        res.renderTemplate('template/postCreator');
    })


myPostRouter.post('/post/me/create',
    multerUpload.array("productImages"),
    async (req, res) => {
        if (!req.isAuthenticated()) {
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
        });
        for (let i = 0; i < req.files.length; i++) {
            newPost.images.push(req.files[i].path);
        }
        await newPost.save();
        // console.log(newPost);
        res.redirect('/post/me');

    })

export default myPostRouter;