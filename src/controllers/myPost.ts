import {Router} from "express";

const myPostRouter = Router()
import PostModel from "@/models/Post";
import multerUpload from "@/utils/multer";
import * as fs from 'fs';
import * as path from 'path';
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
        res.renderTemplate('template/postCreator', {product: doc});
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
myPostRouter.get('/fix/:id', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {

        const id = req.params.id;
        PostModel.findOne({_id: id, seller: req.user._id},).exec((err, doc) => {
            if (doc) {
                // console.log(doc);
                res.renderTemplate('template/postCreator', {product: doc});
            } else {
                res.redirect('/post/me');
            }

        });
    }
});
myPostRouter.post('/fix/:id',
    multerUpload.array("productImages"),
    async (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/login');
        } else {
            const id = req.params.id;
            let newPost = {
                title: req.body.title,
                images: [],
                description: req.body.description,
                price: req.body.price,
            };
            await PostModel.findOne({_id: id, seller: req.user._id}).exec(async (err, post) => {
                if ((req.files) && (req.files.length != 0) ) {
                    // @ts-ignore
                    newPost.images = req.files.map(x=>x.path);
                } else {
                    newPost.images = post.images.map(x=>x);
                }
                await PostModel.updateOne({_id: id, seller: req.user._id}, newPost);

            })
            res.redirect('/post/me');

        }
    });
myPostRouter.get('/post/me/delete/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        const id = req.params.id;
        PostModel.findOne({_id: id, seller: req.user._id}).exec((err, post) => {
            console.log(post);
            for (const image of post.images.values()) {
                fs.unlinkSync(image);
            }
        })
        await PostModel.deleteOne({_id: id, seller: req.user._id});
        console.log({_id: id, seller: req.user._id});
        res.redirect('/post/me');
    }
});
export default myPostRouter;