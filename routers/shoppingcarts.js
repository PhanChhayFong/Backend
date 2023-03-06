const mongoose = require("mongoose");
const express = require('express');
const router = express.Router();
const { ShoppingCart } = require('../models/shoppingcart')
// const { Product } = require('../models/product')
// display all cart items
router.get(`/`, async (req, res) => {

    const shoppingCart = await ShoppingCart.find().populate(["product", "user"]).select("-passwordHash");
    if(!shoppingCart){
        return res.status(400).json({success: false});
    }

    return res.send(shoppingCart);
});

// get all the cart item by each user
router.get(`/cart-item/:userid`, async (req, res) => {

    const userId = req.params.userid;

    if(!mongoose.isValidObjectId(userId)){
        return res.status(400).json({success: false});
    }

    const cartItem = await ShoppingCart.find({user: userId, instance: 'cart'}).populate(["product", "user"]);
    if(!cartItem){
        return res.status(400).send({cart: "Cart is empty..."});
    }
    return res.send(cartItem);
    
});

// get all the wishlist item by each user
router.get(`/wishlist-item/:userid`, async (req, res) => {

    const userId = req.params.userid;

    if(!mongoose.isValidObjectId(userId)){
        return res.status(400).json({success: false});
    }

    const cartItem = await ShoppingCart.find({user: userId, instance: 'wishlist'}).populate(["product", "user"]);
    if(!cartItem){
        return res.status(400).send({cart: "Cart is empty..."});
    }
    return res.send(cartItem);
    
});

// count all the cart item number
router.get(`/get/cart_item_count`, async (req, res) => {
    const countCartItem = await ShoppingCart.countDocuments();

    if(!countCartItem){
        return res.status(400).json({success: false});
    }

    return res.send({countCartItem: countCartItem});
});

// count the number of cart item by user id
router.get(`/get/cart_item_count/:userId`, async (req, res) => {
    const userID = req.params.userId;
    
    const countCartItem = await ShoppingCart.find({user: userID, instance: 'cart'}).countDocuments();
    if(!countCartItem){
        return res.status(200).send({countCartItem: 0});
    }

    return res.status(200).send({countCartItem: countCartItem});
});

// count the number of wishlist item by user id
router.get(`/get/wishlist_item_count/:userId`, async (req, res) => {
    const userID = req.params.userId;
    
    const countWishlistItem = await ShoppingCart.find({user: userID, instance: 'wishlist'}).countDocuments();
    if(!countWishlistItem){
        return res.status(200).send({countWishlistItem: 0});
    }

    return res.status(200).send({countWishlistItem: countWishlistItem});
});
// add item to cart
router.post(`/add-cart-item`, async (req, res) => {
    const body = req.body;

    let shoppingCartItem = new ShoppingCart({
        user: body.user,
        product: body.product,
        instance: body.instance,
        quantity: body.quantity
    });


    shoppingCartItem = await shoppingCartItem.save();

    if(!shoppingCartItem){
        return res.status(400).json({success: false});
    }

    return res.send(shoppingCartItem);
});

// update the cart item quantity, if it already exists
router.put(`/update-cart/:cartid`, async (req, res) => {

    const body = req.body;
    const cartID = req.params.cartid;

    if(!mongoose.isValidObjectId(cartID)){
        return res.status(500).send("ID is not valid");
    }

    const existCartItem = await ShoppingCart.findByIdAndUpdate(
        cartID, 
        {
            quantity: body.quantity
        },
        {new: true}
    );

    if(!existCartItem){
        return res.status(401).json({success: false, message: "Update is not available"});
    }

    res.status(200).send(existCartItem);

});

// move wishlist item to cart item 
router.put(`/move-to-cart/:wishlistid`, async (req, res) => {

    const body = req.body;
    const wishlistID = req.params.wishlistid;

    if(!mongoose.isValidObjectId(wishlistID)){
        return res.status(500).send("ID is not valid");
    }

    const wishlistItem = await ShoppingCart.findByIdAndUpdate(
        wishlistID,
        {
            instance: body.instance,
            quantity: body.quantity
        },
        { new: true }
    );

    if(!wishlistItem){
        return res.status(401).json({success: false, message: "Update is not avialabel"});
    }

    res.status(200).send(wishlistItem);
});

// remove a single cart tiem
router.delete(`/remove/cart_item/:cartid`, async (req, res) => {

    const cartID = req.params.cartid;

    if(!mongoose.isValidObjectId(cartID)){
        return res.status(400).json({success: false}).send("Invalid Product ID");
    }

    const deleteCartItem = await ShoppingCart.findByIdAndRemove(cartID);

    if(!deleteCartItem){
        return res.status(400).json({success: false});
    }

    res.status(200).json({success: true, messaage: "Delete Successfully"});
});

// clear all the cart item by each user
router.delete(`/clear/cart_items/:userid`, (req, res) => {
    const userID = req.params.userid;
    
    if(!mongoose.isValidObjectId(userID)){
        return res.status(500).send("The id is invalid");
    }

    ShoppingCart.deleteMany({user: userID, instance: "cart"}).then(cartItem => {
        if(!cartItem){
            return res.status(404).json({success: false, message: "Cart is not found..."})
        }
        else{
            return res.status(200).json({success: true, message: "All Cart items are successfully cleared"})
        }
    })
    .catch(err => {
        return res.status(500).json({success: false, messaage: err});
    })
});

// remove wishlist item 
router.delete(`/remove/wishlist-item/:wishlistid`, async (req, res) => {
    const wishlistId = req.params.wishlistid;

    if(!mongoose.isValidObjectId(wishlistId)){
        return res.status(500).send("The id is invalid");
    }

    const removeWishlistItem = await ShoppingCart.findByIdAndRemove(wishlistId);
    if(!removeWishlistItem){
        return res.status(400).json({success: false});
    }

    res.status(200).json({success: true, messaage: "Delete Successfully"});
});
module.exports = router;