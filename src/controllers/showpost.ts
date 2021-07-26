import {Router} from "express";
const showRouter = Router()
import PostModel from "@/models/Post";


showRouter.get('/post/:id', (req, res, next) =>{
    const id = req.url.replace('/post/:id','');
    // res.send('you r searching product '+req.url.replace('/post/:id',''));
    PostModel.findOne({_id:id}).exec((err, docs)=>{
        let a = null;
        if(docs){
            a=docs;
        }
        // if (docs && docs.length >0){
        //     a = docs[0];
        // }
        res.renderTemplate('template/post_full', {product: a});
    })


});
export default showRouter;