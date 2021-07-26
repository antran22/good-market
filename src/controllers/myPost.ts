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
            res.renderTemplate('template/postList', {post: chunks, isSeller: true});
        });
    }
});
myPostRouter.get('/post/me/create',
    async function renderCreatePost(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/login');
            return;
        }
        let doc = new PostModel({
            title: '',
            images: [null],
            description: '',
            price: 0,
            tags: [],
            seller: req.user._id
        });
        res.renderTemplate('template/postCreator',{product:doc});
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
        newPost.save();
        res.redirect('/post/me');

    })
myPostRouter.get('/fix/:id', (req, res)=>{
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {

        const id = req.url.replace('/fix/:id','');
        PostModel.findOne({_id:id, seller: req.user._id}, ).exec((err, doc)=>{
            if(doc){
                // console.log(doc);
                res.renderTemplate('template/postCreator', {product:doc});
            } else {
                res.redirect('/post/me');
            }

        });
    }
});
myPostRouter.post('/fix/:id',
    multerUpload.array("productImages"),
    async (req, res)=>{
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        const id = req.url.replace('/fix/:id','');
        let newPost = {
            title: req.body.title,
            images: [],
            description: req.body.description,
            price: req.body.price,
        };
        await PostModel.findOne({_id:id, seller: req.user._id}).exec((err, post)=>{
            if(!post){
                res.send("Can not find the product!")
            } else {
                console.log("this is from fix/:id"+id);
                console.log(req.body);
            }
            newPost.images=post.images;
        })
        if (req.files && req.files.length ){
            newPost.images=[];
            for (let i = 0; i < req.files.length; i++) {
                newPost.images.push(req.files[i].path);
            }
        }


        // console.log(newPost);

        const r = await PostModel.updateOne({_id:id, seller: req.user._id}, newPost);
        // console.log(r.nModified);
        res.redirect('/post/me');
    }
});
myPostRouter.get('/post/me/delete/:id', async (req, res)=>{
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        const id = req.url.replace('/post/me/delete/:id','');
        PostModel.findOne({_id:id, seller: req.user._id}).exec((err, post)=>{
            console.log(post);
        })
        await PostModel.deleteOne({_id:id, seller: req.user._id});
        console.log({_id:id, seller: req.user._id});
        res.redirect('/post/me');
    }
});
export default myPostRouter;