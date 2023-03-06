//modules
const { default: mongoose } = require("mongoose");
const express = require("express");
//models
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const { Upload } = require("../helpers/SaveUpload");
const { DeleteImage } = require("../helpers/DeleteUpload");
//router
const router = express.Router();
//get products data
router.get(`/`, async (req, res) => {
  // const productList = await Product.find().select('name image -_id price countInStock dateCreated').populate('category');
  let filter = {};
  if (req.query.categories)
    filter = { category: req.query.categories.split(",") };
  const productList = await Product.find(filter)
    .populate("category")
    .sort({ dateCreated: -1 });
  if (!productList) res.status(500).json({ success: false });
  res.send(productList);
});
//get short by products data
router.get(`/get/:sort/:FC/:direction`, async (req, res) => {
  //get all category
  let filter = {};
  if (req.query.categories)
    filter = { category: req.query.categories.split(",") };
  //get all products and sort asc and select type of category
  const productList = await Product.find(
    //select only category type if params.FC != All
    req.params.FC == "All" ? filter : { category: req.params.FC }
  )
    .populate("category")
    .sort({ [req.params.sort]: req.params.direction });

  if (!productList) res.status(500).json({ success: false });

  res.send(productList);
});
//search product by id
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});
//count all products
router.get(`/getcount/count`, async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) res.status(500).json({ success: false });
  res.send({
    productCount: productCount,
  });
});
//count featured if it true
router.get(`/get/featured/:count`, async (req, res) => {
  console.log("products");
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);
  if (!products) res.status(500).json({ success: false });
  res.send(products);
});
// get hot sales product data by 8 items
router.get(`/get/hot_sale_product`, async (req, res) => {
  const hot_sale_product = await Product.find(req.query.salePrice)
    .sort({ salePrice: -1 })
    .limit(8);

  if (!hot_sale_product) {
    res.sendStatus(500);
  }
  res.send(hot_sale_product);
});
// get featured product data by 8 items
router.get(`/get/featured_product`, async (req, res) => {
  const featured_product = await Product.find({ isFeatured: true }).limit(8);

  if (!featured_product) res.sendStatus(500);
  res.status(200).send(featured_product);
});
// get new arrival product data by 4 items
router.get(`/get/new_arrival_product`, async (req, res) => {
  const new_arrival_product = await Product.find()
    .sort({ dateCreated: -1 })
    .limit(4);
  if (!new_arrival_product) res.sendStatus(500);
  res.status(200).send(new_arrival_product);
});
// get related product by cartegory in product detail page
router.get("/get/related-product", async (req, res) => {
  const category = mongoose.Types.ObjectId(req.params.category);

  // check the category
  if (!category) {
    return res.status(400).send("Category is required");
  }

  const filterProducts = await Product.find({ category: category });
  res.status(200).send(filterProducts);
});
// count all the product by category (Name and Number counted)
router.get("/get/product_category", async (req, res) => {
  const productByCategory = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        products: { $push: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        _id: "$category._id",
        name: "$category.name",
        count: 1,
        products: 1,
      },
    },
  ]);

  if (!productByCategory) {
    res.sendStatus(500);
  }
  res.send(productByCategory);
});
// get a single product by the category
router.get(`/get/product_category/:id`, async (req, res) => {
  const categoryID = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(categoryID)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  const productCategory = await Product.aggregate([
    {
      $match: {
        category: mongoose.Types.ObjectId(categoryID),
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        _id: "$product._id",
        name: "$product.name",
        image: "$product.image",
        regularPrice: "$product.regularPrice",
        salePrice: "$product.salePrice",
        description: "$product.description",
        sku: "$product.sku",
        rating: "$product.rating",
        isFeatured: "$product.isFeatured",
        count: 1,
        products: 1,
      },
    },
  ]);

  if (!productCategory) {
    res.sendStatus(500);
  }

  res.send(productCategory);
});
//import product into specific category id
router.post(`/`, Upload.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");
  const file = req.file;
  if (!file) return res.status(400).send("Image Required");
  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    image: `${basePath}${fileName}`,
    regularPrice: req.body.regularPrice,
    salePrice: req.body.salePrice,
    sku: req.body.sku,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    isFeatured: req.body.isFeatured,
  });
  product = await product.save();
  if (!product) {
    return res.status(500).send("the product cannot be created!");
  }
  res.send(product);
});
//update product by id
router.put("/:id", Upload.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product ID");
  }
  const file = req.file;
  const basePath = `${req.protocol}://${req.get("host")}`;
  const image = await Product.findById(req.params.id, {
    image: { $substr: ["$image", basePath.length, -1] },
    _id: 0,
  });
  if (file) DeleteImage(image.image);
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      regularPrice: req.body.regularPrice,
      salePrice: req.body.salePrice,
      rating: req.body.rating,
      sku: req.body.sku,
      category: req.body.category,
      countInStock: req.body.countInStock,
      isFeatured: req.body.isFeatured,
      image: file
        ? `${basePath}/public/upload/${file.filename}`
        : `${basePath}${image.image}`,
    },
    { new: true }
  );

  if (!product) return res.status(500).send("the product cannot be updated!");

  res.send(product);
});
router.put("/gallery-images/:id",Upload.array("images", 5),async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send("Invalid Product Id");

    const basePath = `${req.protocol}://${req.get("host")}`;
    const image = await Product.findById(req.params.id, {
      images: 1,
      _id: 0,
    });
    // console.log(image.images);
    image.images.map((img) => {
      DeleteImage(img.substring(basePath.length, img.length));
    });

    const files = req.files;
    if (files.length != 0) {
      let imagesPaths = [];

      files.map((file) => {
        imagesPaths.push(`${basePath}/public/upload/${file.filename}`);
      });
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPaths,
        },
        { new: true }
      );

      if (!product)
        return res.status(500).send("the gallery cannot be updated!");

      res.send(product);
    }
  }
);
// update product count in stock after clicked add to cart
router.put(`/update_count_in_stock/:productid`, async (req, res) => {
  const productId = req.params.productid;
  const body = req.body;

  const subStractStock = await Product.findByIdAndUpdate(
    productId,
    {
      countInStock: body.countInStock,
    },
    { new: true }
  );

  if (!subStractStock) {
    res.status(401).send("Failed to SubStract the Product Stock");
  }

  res.send(subStractStock);
});
//delete product by id
router.delete("/:id", async (req, res) => {
  // delete old image
  const image = await Product.findById(req.params.id, {
    image: { $substr: ["$image", 21, -1] },
    _id: 0,
  });
  DeleteImage(image.image);

  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The Product is Deleted!" });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "Product not found!!!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
module.exports = router;
