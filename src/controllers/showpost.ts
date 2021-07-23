import {Router} from "express";
import Post from "@/models/Post";
const showRouter = Router()
import TagModel, {ITag} from "@/models/Tag" ;
import PostModel from "@/models/Post";
import {PopulatedDoc} from "mongoose";
import {IUser} from "@/models/User";


showRouter.get('/post/#', async function renderFilteredPost(req, res, next) {
    console.log(req.query.postID);
    PostModel.find({_id: req.query.postID}).exec(function (err, posts) {
        const chunks = [];
        for (let post of posts) {
            chunks.push(post);
        };
        res.renderTemplate('template/post', {post: chunks});
    });


});
export default showRouter;