import {Router} from "express";
import Post from "@/models/Post";
import * as _ from 'lodash';
import User from "@/models/User";

const searchRouter = Router();

async function search(query, onlyPost = false) {
    let hard_condition = {}
    let score = {}
    if (query.key) {
        hard_condition['$text'] = {$search: query.key}
        score['score'] = {$meta: "textScore"}
    }

    // .sort( { score: { $meta: "textScore" } } )
    if (query.fromdate && query.todate) {
        hard_condition["createdAt"] = {$gt: new Date(query.fromdate), $lt: new Date(query.todate)}
    }
    if (query.fromprice && query.toprice) {
        hard_condition["price"] = {$gt: parseInt(query.fromprice), $lt: parseInt(query.toprice)}
    }
    if (query.seller) {
        hard_condition["seller"] = query.seller;
    }

    let rs_posts = await Post.find(), rs_users = [];
    // console.log(hard_condition)
    if (Object.keys(hard_condition).length > 0) {
        if (Object.keys(score).length > 0) {
            if(query.key){
                rs_users = await User.find(hard_condition).sort({score: {$meta: "textScore"}}).limit(20);
            }
            rs_posts = await Post.find(hard_condition).sort({score: {$meta: "textScore"}}).limit(2000);

        } else {
            if(query.key){
                rs_users = await User.find(hard_condition).limit(20);
            }
            rs_posts = await Post.find(hard_condition).limit(2000);
        }
    }
    return [].concat(rs_users, rs_posts)

}

function change_page(a: String, page) {
    let curr = a;
    console.log(a, page)
    if (curr.includes("page=")) {
        curr = curr.replace(/page=(\d+)/, "page=" + page.toString())
    } else {
        if (curr.includes("?")) {
            curr += "&page=" + page.toString()
        } else {
            curr += "?page=" + page.toString()
        }
    }
    // return page
    return curr
}

searchRouter.get("/", async (req, res, next) => {
    // console.log(req.query);
    const rs = await search(req.query);
    const posts = rs;
    const post_pages = await _.chunk(posts, 20);
    let m = 0;
    // @ts-ignore
    if (req.query.page && parseInt(req.query.page) > 0) {
        // @ts-ignore
        m = parseInt(req.query.page)
    }
    let pages = {};
    pages["all"] = post_pages.map((e, i) => change_page(req.url, i));
    if (m > 0) {
        pages["prev"] = change_page(req.url, m - 1);
    }
    if (m < post_pages.length - 1) {
        pages["next"] = change_page(req.url, m + 1);
    }
    console.log(post_pages)
    console.log(pages)
    return res.renderTemplate("templates/index", {searchrs: post_pages[m], pages: pages, keyword: req.query.key});

});
searchRouter.post("/", async (req, res) => {
    console.log('post search')
    console.log(req)
    if (req.body.search) {
        res.send(await search(req.body.search));
    }

    // return res.renderTemplate("templates/search");
});
export default searchRouter;
