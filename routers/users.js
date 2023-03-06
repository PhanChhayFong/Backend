const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { Upload } = require("../helpers/SaveUpload");
const { DeleteImage } = require("../helpers/DeleteUpload");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

var myemail = process.env.ADMIN_EMAIL;
var mypassword = process.env.APP_PASSWORD;

function sendEmail(customer_email, OTP) {
  console.log(customer_email, OTP);
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: myemail,
        pass: mypassword,
      },
    });

    const mail_configs = {
      from: myemail,
      to: customer_email,
      subject: "Email Verification!!!",
      text: `Hi ${customer_email}!! Please verify the OTP before reset your password... OTP: ${OTP}`,
      html: `<h1>Hi ${customer_email}</h1><p>Your OTP: ${OTP}</p>`,
    };

    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: "Ann error has occured" });
      }
      console.log("Email sent: " + info.response);
      return resolve({ message: "Email send successfully" });
    });
  });
}
function sendMessageToEmail(username, customer_email, subject, message) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: myemail,
        pass: mypassword,
      },
    });

    const mail_configs = {
      from: myemail,
      to: myemail,
      subject: `${subject}`,
      // text: `Hi ${customer_email}!! Please verify the OTP before reset your password... OTP: ${OTP}`,
      html: `
      <h1>From Email: ${customer_email}</h1>
        <h3>Hi!!! I'm ${username}</h3>
        <p>${message}</p>
      `,
    };

    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: "Ann error has occured" });
      }
      console.log("Email sent: " + info.response);
      return resolve({ message: "Email send successfully" });
    });
  });
}
//get all users data
router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});
//get user by id
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID was not found." });
  }
  res.status(200).send(user);
});
//count all users
router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) res.status(500).json({ success: false });
  res.send({
    userCount: userCount,
  });
});
// get user status isAdmin: true
router.get("/get/user-admin", async (req, res) => {
  const userAdmin = await User.find({ isAdmin: true });

  if (!userAdmin) return res.sendStatus(401);

  res.send(userAdmin);
});
//get OTP
router.post("/OTP", async (req, res) => {
  var OTP = Math.floor(Math.random() * 9000 + 1000);
  sendEmail(req.body.email, OTP);
  res.send({ OTP: OTP });
});
//import user info
router.post("/", Upload.single("image"), async (req, res) => {
  const file = req.file;
  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      address: req.body.address,
      nationality: req.body.nationality,
      DOB: req.body.DOB,
      image: `${basePath}${fileName}`,
    });
    user = await user.save();

    if (!user) return res.status(400).send("the user cannot be created!");

    res.send(user);
  } else {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      address: req.body.address,
      nationality: req.body.nationality,
      DOB: req.body.DOB,
    });
    user = await user.save();

    if (!user) return res.status(400).send("the user cannot be created!");

    res.send(user);
  }
});
//update user by id
router.put("/:id", Upload.single("image"), async (req, res) => {
  // const userExist = await User.findById(req.params.id);
  // let newPassword;
  // if (req.body.password) {
  //   newPassword = bcrypt.hashSync(req.body.password, 10);
  // } else {
  //   newPassword = userExist.passwordHash;
  // }
  const file = req.file;
  const basePath = `${req.protocol}://${req.get("host")}`;
  const image = await User.findById(req.params.id, {
    image: { $substr: ["$image", basePath.length, -1] },
    _id: 0,
  });
  if (file) DeleteImage(image.image);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      // passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      address: req.body.address,
      nationality: req.body.nationality,
      DOB: req.body.DOB,
      image: file
        ? `${basePath}/public/upload/${file.filename}`
        : `${basePath}${image.image}`,
    },
    { new: true }
  );

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});
//update active by id
router.put("/active/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      active: req.body.active,
    },
    { new: true }
  );
  res.send(user);
});
//change password by id
router.put("/chPass/:id/:oldPass", async (req, res) => {
  const userExist = await User.findById(req.params.id);
  if (bcrypt.compareSync(req.params.oldPass, userExist.passwordHash)) {
    let newPassword;
    if (req.body.password) newPassword = bcrypt.hashSync(req.body.password, 10);
    else newPassword = userExist.passwordHash;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        passwordHash: newPassword,
      },
      { new: true }
    );
    if (!user) return res.status(400).send("the password cannot be change!");
    res.send(user);
  } else res.status(400).send("Old Password is wrong!");
});
//set login
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!user) return res.status(400).send("This Email not found");

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_TIME }
    );
    res.status(200).send({ user: user, token: token });
    // res.status(200).send("Login Success");
  } else {
    res.status(400).send("Password is wrong!");
  }
});
//set sign-up
router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
  });
  user = await user.save();

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});
//send Message
router.post("/message/:n/:e/:s/:m", async (req, res) => {
  sendMessageToEmail(req.params.n, req.params.e, req.params.s, req.params.m);
});
// delete user by id
router.delete("/:id", async (req, res) => {
  const image = await User.findById(req.params.id, {
    image: { $substr: ["$image", 21, -1] },
    _id: 0,
  });
  DeleteImage(image.image);
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
// forgot password
router.post("/fgPassword", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("This Email not found");
  if (user) {
    var OTP = Math.floor(Math.random() * 9000 + 1000);
    sendEmail(user.email, OTP);
    res.status(200).send({
      user: user,
      OTP: OTP,
    });
  }
});
//change forgot password by id
router.put("/chfgPass/:id", async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) newPassword = bcrypt.hashSync(req.body.password, 10);
  else newPassword = userExist.passwordHash;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      passwordHash: newPassword,
    },
    { new: true }
  );
  if (!user) return res.status(400).send("the password cannot be change!");
  res.send(user);
});
module.exports = router;
