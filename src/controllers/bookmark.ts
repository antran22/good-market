import { Router } from "express";
import User from "@/models/User";
import Post from "@/models/Post";

const bookmarkHandle = Router();

bookmarkHandle.get('/bookmark',
    async (req, res) => {
    try{
        let user = await User.findById(req.query.user);
        switch (req.query.action) {
            case ("add"):
                user.bookmark.push(req.query.post);
                console.log(user.bookmark)
                user.save();
                res.sendStatus(200);
                break;
            case ("delete"):
                user.bookmark= user.bookmark.filter(x => x!=req.query.post);
                console.log(user.bookmark)
                user.save();
                res.sendStatus(200);
                break;
            default:
                const posts = await Post.find({ _id: { $in: user.bookmark } } );
                return res.renderTemplate("templates/post/list", { posts , caption:null, pages:null});
        }

    } catch (e){
        res.sendStatus(404);
    }

})

export default bookmarkHandle;
