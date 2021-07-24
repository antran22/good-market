import multer from "multer";
import env from "@/config/env";
import path from "path";

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, env("UPLOAD_DIR")+'/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const multerUpload = multer({
    storage: storage
});

export default multerUpload;
