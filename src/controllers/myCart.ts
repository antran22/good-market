import {Router} from "express";

const myCartRouter = Router()
import PostModel from "@/models/Post";
import CartModel from "@/models/Cart";
import Cart from "@/models/Cart";

myCartRouter.get('/add-to-cart/:id', (req, res) => {
    // console.log(req.user);
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        const id = req.url.replace('/add-to-cart/:id','');
        CartModel.find({_id:id}).exec((err, docs)=>{
            let a = null;
            if (docs && docs.length >0){
                a = docs[0];
            }
            res.renderTemplate('template/post_full', {product: a});
        });
    }
});
myCartRouter.get('/post/me/create',
    async function renderCreatePost(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/login');
            return;
        }
        res.renderTemplate('template/postCreator');
    })


export default myCartRouter;