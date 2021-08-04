import { Router } from "express";
import UserModel, { IUser } from "@/models/User";
import CommentModel, {
  validateCommentContent,
  validateCommentRating,
  validateCommentTitle,
} from "@/models/Comment";
import { notNil } from "@/utils";
import { NotFoundError } from "@/exceptions";
import { authenticationGuard } from "@/controllers/_utils";
import { reloadIfValidationFailed } from "@/utils/validator";
import PostModel from "@/models/Post";
import _ from "lodash";
import { ObjectId, mongo } from "mongoose";

const userPageRouter = Router();

const combineFilter = (...filters: object[]): object => {
  return _.reduce(
    filters,
    (combinedFilter, filter) => {
      return { ...combinedFilter, ...filter };
    },
    {}
  );
};

const buildChartLink = (userId: string, fromDate?: Date): string => {
  let result = "/post?user=" + userId;
  if (fromDate) {
    result += "&from-date=" + fromDate.toISOString();
    result += "&to-date=" + new Date().toISOString();
  }
  return result;
};

interface StatisticQueryResult {
  total: number;
  sold: number;
  totalThisMonth: number;
  soldThisMonth: number;
  totalThisYear: number;
  soldThisYear: number;
}

async function userStatistic(userId: string) {
  const today = new Date();
  const beginningOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const beginningOfYear = new Date(today.getFullYear(), 1, 1);

  const soldFilter = { sold: true };
  const inThisMonthFilter = {
    createdAt: { $gt: beginningOfMonth, $lt: today },
  };
  const inThisYearFilter = { createdAt: { $gt: beginningOfYear, $lt: today } };

  const queryResults: StatisticQueryResult[] = await PostModel.aggregate([
    {
      $match: {
        seller: new mongo.ObjectId(userId),
      },
    },
    {
      $facet: {
        total: [{ $count: "total" }],
        sold: [{ $match: soldFilter }, { $count: "sold" }],
        totalThisMonth: [
          { $match: inThisMonthFilter },
          { $count: "totalThisMonth" },
        ],
        soldThisMonth: [
          { $match: combineFilter(inThisMonthFilter, soldFilter) },
          { $count: "soldThisMonth" },
        ],
        totalThisYear: [
          { $match: inThisYearFilter },
          { $count: "totalThisYear" },
        ],
        soldThisYear: [
          { $match: combineFilter(inThisYearFilter, soldFilter) },
          { $count: "soldThisYear" },
        ],
      },
    },
    {
      $project: {
        total: { $arrayElemAt: ["$total.total", 0] },
        sold: { $arrayElemAt: ["$sold.sold", 0] },
        totalThisMonth: { $arrayElemAt: ["$totalThisMonth.totalThisMonth", 0] },
        soldThisMonth: { $arrayElemAt: ["$soldThisMonth.soldThisMonth", 0] },
        totalThisYear: { $arrayElemAt: ["$totalThisYear.totalThisYear", 0] },
        soldThisYear: { $arrayElemAt: ["$soldThisYear.soldThisYear", 0] },
      },
    },
  ]);

  const queryResult = queryResults[0];

  console.log(queryResult);

  return {
    link: buildChartLink(userId),
    sold: queryResult.sold,
    unsold: queryResult.total - queryResult.sold,

    thisMonth: {
      link: buildChartLink(userId, beginningOfMonth),
      unsold: queryResult.totalThisMonth - queryResult.soldThisMonth,
      sold: queryResult.soldThisMonth,
    },

    thisYear: {
      link: buildChartLink(userId, beginningOfYear),
      unsold: queryResult.totalThisYear - queryResult.soldThisYear,
      sold: queryResult.soldThisYear,
    },
  };
}

userPageRouter.get(
  "/user/:id",
  async function showPersonalPage(req, res, next) {
    const user = await UserModel.findByIdWithComments(req.params.id);
    if (notNil(user)) {
      const statistic = await userStatistic(user.id);
      return res.renderTemplate("templates/user", {
        user: user,
        statistic: statistic,
      });
    }
    next(new NotFoundError(`Cannot find user with id ${req.params.id}`));
  }
);

userPageRouter.post(
  "/user/:id/comment",
  authenticationGuard,
  validateCommentTitle,
  validateCommentRating,
  validateCommentContent,
  reloadIfValidationFailed,

  async function addComment(req, res) {
    const user: IUser = await UserModel.findById(req.params.id);
    const newComment = new CommentModel({
      rating: req.body.rating,
      title: req.body.title,
      content: req.body.content,
      author: req.user,
    });

    await newComment.save();
    user.comments.push(newComment);
    await user.save();
    res.redirect("back");
  }
);

export default userPageRouter;
