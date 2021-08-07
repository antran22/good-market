import {Router} from "express";
import PostModel, {
    IPost,
    validatePostDescription,
    validatePostPrice,
    validatePostTitle,
} from "@/models/Post";
import * as _ from 'lodash';
import multerUpload from "@/config/multer";
import {authenticationGuard} from "@/controllers/_utils";
import {ForbiddenError, NotFoundError} from "@/exceptions";
import {padWithSlash} from "@/utils";
import CommentModel, {
    validateCommentContent,
    validateCommentTitle,
} from "@/models/Comment";
import {reloadIfValidationFailed} from "@/utils/validator";


const postRouter = Router();
const CHUNK = 40;

postRouter.get(
    "/post/create",
    authenticationGuard,
    async function renderCreatePostView(req, res) {
        return res.renderTemplate("templates/post/create", {post: null});
    }
);

function change_page(a: String, page) {
    let curr = a;
    if (curr.includes("page=")) {
        curr = curr.replace(/page=(\d+)/, "page=" + page.toString())
    } else {
        if (curr.includes("?")) {
            curr += "&page=" + page.toString()
        } else {
            curr += "?page=" + page.toString()
        }
    }
    return curr
}

postRouter.post(
    "/post/create",
    authenticationGuard,
    multerUpload.array("images[]", 5),
    validatePostTitle,
    validatePostDescription,
    validatePostPrice,

    async function createPost(req, res) {
        const errors = req.validate();
        if (!errors.isEmpty()) {
            req.flashValidationErrors(errors);
            return res.renderTemplate("templates/post/create", {
                post: {
                    title: req.body.title,
                    description: req.body.description,
                    price: req.body.price,
                },
            });
        }

        if (!(req.files instanceof Array)) {
            req.files = [];
        }
        const newPost = new PostModel({
            title: req.body.title,
            images: req.files.map((file) => padWithSlash(file.path)),
            description: req.body.description,
            price: req.body.price,
            seller: req.user._id,
        });

        await newPost.save();
        res.status(201).redirect("/post");
    }
);

postRouter.get(
    "/post/:id/edit",
    authenticationGuard,
    async function renderEditPostView(req, res, next) {
        const post: IPost = await PostModel.findById(req.params.id);
        if (!post) {
            throw new NotFoundError(`No post with id ${req.params.id} existing`);
        }
        if (!req.isMe(post.seller)) {
            throw new ForbiddenError(`You cannot edit other people's post`);
        }
        return res.renderTemplate("templates/post/edit", {post});
    }
);

postRouter.post(
    "/post/:id/edit",
    authenticationGuard,
    multerUpload.array("images[]", 5),
    validatePostTitle,
    validatePostDescription,
    validatePostPrice,
    reloadIfValidationFailed,
    async function editPost(req, res, next) {
        const post: IPost = await PostModel.findById(req.params.id);

        if (!post) {
            throw new NotFoundError(`No post with id ${req.params.id} existing`);
        }
        if (!req.isMe(post.seller)) {
            throw new ForbiddenError(`You cannot edit other people's post`);
        }

        post.title = req.body.title;
        post.description = req.body.description;
        post.price = req.body.price;
        post.tag = req.body.tag;
        post.sold = !!req.body.sold;

        if (req.files && req.files instanceof Array && req.files.length > 0) {
            post.images = req.files.map((file) => padWithSlash(file.path));
        }

        await post.save();
        res.redirect("/post");
    }
);

postRouter.get(
    "/post/:id/delete",
    authenticationGuard,
    async function deletePost(req, res) {
        const postId = req.params.id;
        const post: IPost = await PostModel.findById(postId);

        if (!post) {
            throw new NotFoundError(`No post with id ${req.params.id} existing`);
        }
        if (post.seller.toString() != req.user._id.toString()) {
            throw new ForbiddenError("You cannot delete other people's post");
        }

        post.delete();

        res.redirect("/post");
    }
);

postRouter.get("/post", async function renderPostList(req, res) {
    let user = req.getQuery("user");

    const keyword = req.getQuery("keyword");

    const fromDate = req.getQueryDate("from-date");
    const toDate = req.getQueryDate("to-date");

    const fromPrice = req.getQueryInt("from-price");
    const toPrice = req.getQueryInt("to-price");

    let query = PostModel.find();
    if (user === "me" && req.isAuthenticated()) {
        user = req.user._id;
    }

    if (user) {
        query = query.where("seller", user);
    }

    if (fromDate) {
        query = query.where("createdAt").gte(fromDate.getTime());
    }

    if (toDate) {
        toDate.setHours(23, 59, 59);
        query = query.where("createdAt").lte(toDate.getTime());
    }

    if (fromPrice) {
        query = query.where("price").gte(fromPrice);
    }

    if (toPrice) {
        query = query.where("price").lte(toPrice);
    }

    if (keyword) {
        // let regex = "";
        // keyword.split(' ').forEach(element => {
        //   regex += `(?=.*${element}.*)`;
        // });
        // query = query.where("title").regex("(?i)" + regex + "(?-i)");
        query = query.where("$text", {$search: keyword})
    }

    const posts = await query;
    const post_pages = await _.chunk(posts, CHUNK);
    let m = 0;
    // @ts-ignore
    if (req.query.page && parseInt(req.query.page) > 0) {
        // @ts-ignore
        m = parseInt(req.query.page)
    }
    if(m<0 || m>=post_pages.length){
        m=0;
    }
    let pages = {};
    if (m > 0) {
        pages["prev"] = change_page(req.url, m - 1);
    }
    if (m < post_pages.length - 1) {
        pages["next"] = change_page(req.url, m + 1);
    }
    const caption = "showing ".concat((m * CHUNK + 1).toString()).concat("-").concat((m * CHUNK + post_pages[m].length).toString()).concat(" / ").concat((posts.length).toString()).concat(" results");
    console.log(caption)
    return res.renderTemplate("templates/post/list", {
        posts: post_pages[m],
        pages: pages,
        caption: caption
    });
    // return res.renderTemplate("templates/post/list", { posts });
});

postRouter.get("/post/:id", async function renderSinglePost(req, res) {
    const post = await PostModel.findByIdFullyPopulated(req.params.id);
    if (!post) {
        throw new NotFoundError(`No post with id ${req.params.id} existing`);
    }
    return res.renderTemplate("templates/post/view", {post});
});

postRouter.post(
    "/post/:id/comment",
    authenticationGuard,
    validateCommentTitle,
    validateCommentContent,
    reloadIfValidationFailed,

    async function addComment(req, res) {
        const post: IPost = await PostModel.findById(req.params.id);
        const newComment = new CommentModel({
            title: req.body.title,
            content: req.body.content,
            author: req.user,
        });

        await newComment.save();
        post.comments.push(newComment);
        await post.save();
        res.redirect("back");
    }
);

export default postRouter;
