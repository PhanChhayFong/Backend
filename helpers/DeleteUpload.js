const fs = require("fs");
const path = require("path");

const DeleteUpload = (ImagePath) => {
  const oldImagePath = path.join(__dirname, "../", ImagePath);
  if (fs.existsSync(oldImagePath)) {
    fs.unlink(oldImagePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Delete File successfully.");
    });
  }
};
exports.DeleteImage = DeleteUpload;
