const mongoose = require('mongoose');

const shoppingcartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    instance: {
        type: String,
        enum: ['cart','wishlist']
    },
    quantity: {
        type: Number
    }
});

shoppingcartSchema.virtual("id").get(function () {
    return this._id.toHexString();
});
  
shoppingcartSchema.set("toJSON", {
    virtuals: true,
});

exports.ShoppingCart = mongoose.model("ShoppingCart", shoppingcartSchema);