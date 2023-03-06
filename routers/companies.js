//modules
const { default: mongoose } = require("mongoose");
const express = require("express");
const { Upload } = require("../helpers/SaveUpload");
const { DeleteImage } = require("../helpers/DeleteUpload");
//models
const { Company } = require("../models/company");
//router
const router = express.Router();
//get company data
router.get(`/`, async (req, res) => {
  const company = await Company.find();
  if (!company) res.status(500).json({ success: false });
  res.send(company);
});
//search company by id
router.get(`/:id`, async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    res.status(500).json({
      success: false,
      message: "The Company with given ID was not found!!!",
    });
  }
  res.send(company);
});
//import company
router.post(`/`, Upload.single("logo"), async (req, res) => {
  const file = req.file;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  let company = new Company({
    name: req.body.name,
    email: req.body.email,
    telephone: req.body.telephone,
    facebook: req.body.facebook,
    twitter: req.body.twitter,
    telegram: req.body.telegram,
    address: req.body.address,
    logo: file ? `${basePath}/public/upload/${file.filename}` : "",
  });
  company = await company.save();

  if (!company) {
    return res.status(500).send("the company cannot be Updated!");
  }
  res.send(company);
});
//update company by id
router.put("/:id", Upload.single("logo"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Company ID");
  }
  const file = req.file;
  const basePath = `${req.protocol}://${req.get("host")}`;
  const logoCP = await Company.findById(req.params.id, {
    logo: { $substr: ["$logo", basePath.length, -1] },
    _id: 0,
  });
  if (file) DeleteImage(logoCP.logo);
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      telephone: req.body.telephone,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      telegram: req.body.telegram,
      address: req.body.address,
      logo: file
        ? `${basePath}/public/upload/${file.filename}`
        : `${basePath}${logoCP.logo}`,
    },
    { new: true }
  );

  if (!company) return res.status(500).send("the company cannot be updated!");

  res.send(company);
});

module.exports = router;
