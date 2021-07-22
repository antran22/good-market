import {Router} from "express";

const searchRouter = Router()
let Post = require('../models/Post')
searchRouter.get('/search', function renderFilteredPost(req, res, next) {
    // let tags = req.query.tags;
    // let title = req.query.title;
    // let posts = Post.find({title:title, tags:tags});\
    let posts = [new Post({
        ID: '00000',
        title: 'fumino furuhashi',
        imagePaths: ['https://static.zerochan.net/Furuhashi.Fumino.full.2786855.jpg'],
        description: 'waifu',
        price: 99999999,
        seller: 'Taishi Tsutsui',
        tags: ['anime', 'student', 'genius'],
        comments: ['wonderful!!']
    }), new Post({
        ID: '00001',
        title: 'Mafuyu Kirisu',
        imagePaths: ['https://static.wikia.nocookie.net/bokutachi-study/images/0/06/20190803_194047.png'],
        description: 'waifu',
        price: 999999999,
        seller: 'Taishi Tsutsui',
        tags: ['anime', 'teacher', 'sensei'],
        comments: ['nice!!']
    })]

    res.renderTemplate('template/search', {posts: posts})
});
export default searchRouter;