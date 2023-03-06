const mongoose = require("mongoose");
slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: "" },
  alias: { type: String, slug: "name" },
});

exports.Category = mongoose.model("Category", categorySchema);

// Identifier (UserID)	
// Product ID	
// Instance (Cart, Wishlist)	
// Total Price	
