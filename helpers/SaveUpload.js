const multer = require("multer");
//allow image extension
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
//getting original image and upload in server with new name
const storage = multer.diskStorage({
  destination: function (req, file,cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/upload/");
  },
  filename: function (req, file,cb) {
    // const fileName = file.originalname.replace(' ','-');
    //   const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    //   cb(null, `${fileName}-${Date.now()}.${extension}`)
    cb(null, `${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage});
exports.Upload = uploadOptions;
