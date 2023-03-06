const { default: mongoose } = require("mongoose");
const express = require("express");
const router = express.Router();

const { Category } = require("../models/category");
const { Upload } = require("../helpers/SaveUpload");
const { DeleteImage } = require("../helpers/DeleteUpload");

//get category data
router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});
//get category data by id
router.get(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res
      .status(500)
      .json({ message: "The Category with given ID was not found!!!" });
  }
  res.status(200).send(category);
});
// get category by product and limit 3
router.get(`/get/product_category`, async (req, res) => {
  const categories = await Category.find().limit(3);

  if (!categories) {
    res.status(500).json({ success: false });
  }
  res.send(categories);
});
router.get(`/get/count`, async (req, res) => {
  const categories = await Category.countDocuments();

  if (!categories) res.status(500).json({ success: false });
  res.send({
    categories: categories,
  });
});
//add category 
router.post(`/`, Upload.single("icon"), async (req, res) => {
  const file = req.file;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  let category = new Category({
    name: req.body.name,
    icon: file ? `${basePath}${file.filename}` : "",
    alias: req.body.alias,
  });
  category = await category.save();

  if (!category) {
    return res.status(404).send("the category cannot be created!");
  }

  res.send(category);
});
//update category by id
router.put("/:id", Upload.single("icon"), async (req, res) => {
  const basePath = `${req.protocol}://${req.get("host")}`;
  const icon = await Category.findById(req.params.id, {
    icon: { $substr: ["$icon", basePath.length, -1] },
    _id: 0,
  });
  const file = req.file;
  if (file) DeleteImage(icon.icon);
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: file
        ? `${basePath}/public/upload/${file.filename}`
        : `${basePath}${icon.icon}`,
      alias: req.body.alias,
    },
    { new: true }
  );

  if (!category) {
    return res.status(404).send("the category cannot be created!");
  }

  res.send(category);
});
//delete category data
router.delete("/:id", async (req, res) => {
  const icon = await Category.findById(req.params.id, {
    icon: { $substr: ["$icon", 21, -1] },
    _id: 0,
  });
  DeleteImage(icon.icon);
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "The Category is Deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Category not found!!!" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
