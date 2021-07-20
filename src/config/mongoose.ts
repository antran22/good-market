import { Schema, model, connect } from "mongoose";
import env from "@/config/env";

export default async function connectMongoDB() {
  try {
    const mongoDBUrl = env(
      "MONGODB_URL",
      "mongodb://localhost:27017/good-market"
    );
    await connect(mongoDBUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB at", mongoDBUrl);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
