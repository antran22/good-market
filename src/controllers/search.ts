import { Router } from "express";
import PostModel, {IPost} from "@/models/Post";

const searchRouter = Router();
async function search(query) {
  let hard_condition = {}
  let score = {}
  if (query.key){
    hard_condition['$text'] = { $search: query.key }
    score['score'] =  { $meta: "textScore" }
  }

  // .sort( { score: { $meta: "textScore" } } )
  if(query.fromdate && query.todate){
    hard_condition["createdAt"] = { $gt:new Date(query.fromdate), $lt:new Date(query.todate)}
  }
  if(query.fromprice && query.toprice) {
    hard_condition["price"] = {$gt: parseInt(query.fromprice), $lt: parseInt(query.toprice)}
  }
  console.log(hard_condition)
  if (Object.keys(hard_condition).length>0){
    if(Object.keys(score).length>0){
      return PostModel.find(hard_condition).sort( { score: { $meta: "textScore" } } ).limit(20);
    } else {
      return PostModel.find(hard_condition).limit(20)
    }
  } else {
    return PostModel.find()
  }

}
searchRouter.get("/",  async (req, res, next)=> {
  console.log(req.query);
  const posts = await search(req.query);

  return res.renderTemplate("templates/index", { posts });
});
searchRouter.post("/", async (req, res)=> {
  console.log('post search')
  console.log(req)
  if (req.body.search){
    res.send(await search(req.body.search));
  }

  // return res.renderTemplate("templates/search");
});
export default searchRouter;
