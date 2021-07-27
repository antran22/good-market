import multer from "multer";
import env from "@/config/env";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, env("UPLOAD_DIR") + "/");
  },
});
const multerUpload = multer({
  storage: storage,
});

export default multerUpload;
