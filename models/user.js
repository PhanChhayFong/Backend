const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    default: "",
  },
  nationality: {
    type: String,
    default: "",
  },
  DOB: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: "false",
  },
  image: {
    type: String,
    default: "",
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

exports.User = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
