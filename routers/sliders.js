//modules
const { default: mongoose } = require("mongoose");
const express = require("express");
const { Upload } = require("../helpers/SaveUpload");
const { DeleteImage } = require("../helpers/DeleteUpload");
//models
const { Slider } = require("../models/slider");
//router
const router = express.Router();
//get sliders data
router.get(`/`, async (req, res) => {
  const sliderList = await Slider.find().sort({ order: 1 });
  if (!sliderList) {
    res.status(500).json({ success: false });
  }
  res.send(sliderList);
});
//search slider by id
router.get(`/:id`, async (req, res) => {
  const slider = await Slider.findById(req.params.id);
  if (!slider) {
    res.status(500).json({
      success: false,
      message: "The Slider with given ID was not found!!!",
    });
  }
  res.send(slider);
});
//count all sliders
router.get(`/get/count`, async (req, res) => {
  const sliderCount = await Slider.countDocuments();

  if (!sliderCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    sliderCount: sliderCount,
  });
});
//show the limit of count number on enable if it true
router.get(`/get/enable/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const sliders = await Slider.find({ enable: true }).limit(+count);

  if (!sliders) {
    res.status(500).json({ success: false });
  }
  res.send(sliders);
});
//show the enable of the slider if it true
router.get(`/get/enable`, async (req, res) => {
  const sliders = await Slider.find({ enable: true }).sort({ order: 1 });

  if (!sliders) {
    res.status(500).json({ success: false });
  }
  res.send(sliders);
});
//get the hightest order number of data
router.get(`/get/maxOrder`, async (req, res) => {
  const MaxOrder = await Slider.find().sort({ order: -1 }).limit(1);
  if (!MaxOrder) {
    res.status(500).json({ success: false });
  }
  res.send(MaxOrder);
});
//import slider
router.post(`/`, Upload.single("image"), async (req, res) => {
  const file = req.file;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

  let slider = new Slider({
    title: req.body.title,
    miniTitle: req.body.miniTitle,
    description: req.body.description,
    image: file ? `${basePath}${file.filename}` : "",
    order: req.body.order,
    url: req.body.url,
  });
  slider = await slider.save();

  if (!slider) {
    return res.status(500).send("the slider cannot be created!");
  }
  res.send(slider);
});
//update slider by id
router.put("/:id", Upload.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Slider ID");
  }
  const file = req.file;
  const basePath = `${req.protocol}://${req.get("host")}`;
  const image = await Slider.findById(req.params.id, {
    image: { $substr: ["$image", basePath.length, -1] },
    _id: 0,
  });
  if (file) DeleteImage(image.image);
  const slider = await Slider.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      miniTitle: req.body.miniTitle,
      description: req.body.description,
      url: req.body.url,
      image: file
        ? `${basePath}/public/upload/${file.filename}`
        : `${basePath}${image.image}`,
    },
    { new: true }
  );

  if (!slider) return res.status(500).send("the slider cannot be updated!");

  res.send(slider);
});
//update enable to view slide or not
router.put(`/enable/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Slider ID");
  }
  const slider = await Slider.findByIdAndUpdate(
    req.params.id,
    //$set ===> replaces the value of a field with the specified value
    //$eq  ===> matches documents where the value of a field equals the specified value

    // [{ $set: { enable: { $eq: if(!$enable) } } }]
    [{ $set: { enable: { $eq: [false, "$enable"] } } }],
    { new: true }
  );

  if (!slider) {
    return res.status(500).send("the slider cannot be updated!");
  }
  res.send(slider);
});
//update the LowerOrder
router.put(`/update/Order/:currID/:nextID`, async (req, res) => {
  const getCurr = await Slider.findById(req.params.currID).select("order");
  const getNext = await Slider.findById(req.params.nextID).select("order");
  const updateLower = await Slider.findByIdAndUpdate(
    getNext.id,
    [{ $set: { order: getCurr.order } }],
    { new: true }
  );
  const updateCurr = await Slider.findByIdAndUpdate(
    getCurr.id,
    [{ $set: { order: getNext.order } }],
    { new: true }
  );
  res.send(updateLower, updateCurr);
});
//delete product by id
router.delete("/:id", async (req, res) => {
  // delete old image
  {
    const image = await Slider.findById(req.params.id, {
      image: { $substr: ["$image", 21, -1] },
      _id: 0,
    });
    DeleteImage(image.image);
  }
  // delete data in mongose
  {
    Slider.findByIdAndRemove(req.params.id)
      .then((slider) => {
        if (slider) {
          return res
            .status(200)
            .json({ success: true, message: "The Slider is Deleted!" });
        } else {
          return res
            .status(500)
            .json({ success: false, message: "Slider not found!!!" });
        }
      })
      .catch((err) => {
        return res.status(500).json({ success: false, error: err });
      });
  }
});

module.exports = router;
