import { Router } from "express";
import MessageModel, { validateMessageText } from "@/models/Message";
import UserModel from "@/models/User";
import socketIO from "@/config/socketIO";
import { ServerError } from "@/exceptions";

const messageRouter = Router();

messageRouter.get(
  "/message",
  async function renderMessageListView(req, res) {}
);

messageRouter.get(
  "/message/:userId",
  async function renderMessageConversationView(req, res) {
    const messages = await MessageModel.findByParticipants(
      req.user._id,
      req.params.userId,
      new Date().getTime()
    );
    const partner = await UserModel.findById(req.params.userId);
    return res.renderTemplate("templates/message/conversation", {
      messages: messages,
      partner,
    });
  }
);

messageRouter.get(
  "/message/:userId/fetch",
  async function fetchMoreMessage(req, res) {
    try {
      const messages = await MessageModel.findByParticipants(
        req.user._id,
        req.params.userId,
        req.getQueryIntRequired("oldestMessage")
      );

      const messagesWithFromMeFlag = messages.map((message) => {
        return {
          createdAt: message["createdAt"],
          text: message.text,
          fromMe: req.isMe(message.sender),
        };
      });

      return res.json(messagesWithFromMeFlag);
    } catch (err) {
      if (err instanceof ServerError) {
        res.status(err.statusCode).json({ error: err.message });
      }
    }
  }
);

messageRouter.post(
  "/message/:userId",
  validateMessageText,
  async function createMessage(req, res) {
    const errors = req.validate();
    if (!errors.isEmpty()) {
      return res.status(400).json({
        messages: errors.array().map((error) => error.msg),
      });
    }

    try {
      const newMessage = new MessageModel({
        sender: req.user,
        recipient: req.params.userId,
        text: req.body.text,
      });
      await newMessage.save();

      socketIO
        .getInstance()
        .to(req.params.userId)
        .emit("message", req.body.text);

      return res.status(201).json({ messages: ["OK"] });
    } catch (e) {
      return res.status(500).json({
        messages: [e.message],
      });
    }
  }
);

export default messageRouter;
