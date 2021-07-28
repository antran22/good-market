import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import env from "@/config/env";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, env("UPLOAD_DIR") + "/");
  },
  filename(req, file, callback) {
    callback(null, "/" + uuidv4() + path.extname(file.originalname));
  },
});
const multerUpload = multer({
  storage: storage,
});

export default multerUpload;
