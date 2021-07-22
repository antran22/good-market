import multer from "multer";
import env from "@/config/env";

const multerUpload = multer({ dest: env("UPLOAD_DIR") });

export default multerUpload;
