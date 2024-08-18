const asyncHandler = require('express-async-handler') ;
const apiError = require('../utils/apiError');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');



const calcTotalCartPrice = (cart) => {
    let totalPrice = 0;
    cart.cartItems.forEach((item) => {
        totalPrice += item.price * item.quantity;
    });
    cart.totalCartPrice = totalPrice;
    cart.totalPriceAfterDiscount = undefined;
};

// @desc    Add products to cart
// @route   Post     /api/v1/cart
// access   Private/Protected/User
exports.addProductToCart = asyncHandler(async(req, res, next) => {
    const {productId, color} = req.body;
    const product = await Product.findById(productId);

    let cart = await Cart.findOne({user: req.user._id});
    if(!cart){
        // create a new cart for logged user
        cart = await Cart.create({
            user: req.user._id,
            cartItems: [{product: productId, color, price: product.price}],
        });
    }else{
        // product is already existingin cart, update product quantity
        const productIndex = cart.cartItems.findIndex(
            (item) => item.product.toString() == productId && item.color == color
        );
        
        if(productIndex > -1){
            const cartItem = cart.cartItems[productIndex];
            cartItem.quantity += 1;
            cart.cartItems[productIndex] = cartItem;
        }
        else{
            // product is not existing in cart, push product to cart items array
            cart.cartItems.push({product: productId, color, price: product.price});
        }

    }
    
    // Calculate total cart price
    calcTotalCartPrice(cart);
    await cart.save();

    res
    .status(200)
    .json({
        status: 'success',
        message: 'Product added successfully',
        numberOfItems: cart.cartItems.length,
        data: cart
    });

});

// @desc    Get logged user cart
// @route   GET     /api/v1/cart
// access   Private/Protected/User
exports.getLoggedUserCart = asyncHandler(async(req, res, next) => {
    const cart = await Cart.findOne({user: req.user._id});
    if(!cart){
        return next(new apiError('There is no cart for this user', 404));
    }

    res
    .status(200)
    .json({status: 'success', numberOfItems: cart.cartItems.length, data: cart});
});

// @desc    Remove cart item
// @route   DELETE     /api/v1/cart/:itemId
// access   Private/Protected/User
exports.removeSpecificCartItem = asyncHandler(async(req, res, next) => {
    const cart = await Cart.findOneAndUpdate(
        {user: req.user._id},
        {$pull: {cartItems: {_id: req.params.itemId}}},
        {new: true}
    );

    calcTotalCartPrice(cart);
    cart.save();

    res
    .status(200)
    .json({status: 'success', numberOfItems: cart.cartItems.length, data: cart});
});

// @desc    Clear logged user cart
// @route   DELETE     /api/v1/cart/
// access   Private/Protected/User
exports.clearCart = asyncHandler(async(req, res, next) =>{
    await Cart.findOneAndDelete({user: req.user._id});
    res.status(204).send();
});

// @desc    Update specific cart item quantity
// @route   PUT     /api/v1/cart/:itemId
// access   Private/Protected/User
exports.updateCartItemQuantity = asyncHandler(async(req, res, next) => {
    const {quantity} = req.body;
    const cart  = await Cart.findOne({user: req.user._id});
    if(!cart){
        return next(new apiError('There is no cart for this user', 404));
    }

    const itemIndex = cart.cartItems.findIndex(
        (item) => item._id.toString() == req.params.itemId
    );
    
    if(itemIndex > -1){
        const cartItem = cart.cartItems[itemIndex];
        cartItem.quantity = quantity;
        cart.cartItems[itemIndex] = cartItem;
    }
    else{
        return next(new apiError('There is no cart for this id', 404));
    }
    
    calcTotalCartPrice(cart);
    await cart.save();

    res
    .status(200)
    .json({status: 'success', numberOfItems: cart.cartItems.length, data: cart});
});


// @desc    Apply coupon on logged user cart
// @route   PUT     /api/v1/cart/applyCoupon
// access   Private/Protected/User
exports.applyCoupon = asyncHandler(async(req, res, next) => {
    const coupon = await Coupon.findOne({name: req.body.coupon, expire: {$gt: Date.now()}});
    if(!coupon){
        return next(new apiError('coupon is invalid or expired'));
    }

    const cart = await Cart.findOne({user: req.user._id});
    const totalPrice = cart.totalCartPrice;

    const totalPriceAfterDiscount = 
    (totalPrice - (totalPrice * coupon.discount)/100).toFixed(2);

    cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
    await cart.save();

    res
    .status(200)
    .json({status: 'success', numberOfItems: cart.cartItems.length, data: cart});

});