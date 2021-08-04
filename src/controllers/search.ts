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

export default searchRouter;
