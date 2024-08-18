const asyncHandler = require('express-async-handler') ;
const apiError = require('../utils/apiError');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET);


const factory = require('./handlersFactory');

// @desc    create cash order
// @route   POST     /api/v1/orders/cartId
// access   protected/user
exports.createCashOrder = asyncHandler(async(req, res, next) => {
    const taxPrice = 0;
    const shippingPrice = 0;

    const cart = await Cart.findById(req.params.cartId);
    if(!cart){
        return next(new apiError('There is no cart for this id', 404));
    }
    const cartPrice =
     cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount: cart.totalCartPrice;
    
    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    // create order with payment cash
    const order = await Order.create({
        user: req.user._id,
        cartItems: cart.cartItems,
        shippingAddress: req.body.shippingAddress,
        totalOrderPrice,
    });

    // increase product sold, decrease product quantity 
    if(order){
        const bulkOption = cart.cartItems.map((item) => ({
            updateOne: {
                filter: {_id: item.product},
                update: {$inc: {quantity: -item.quantity, sold: +item.quantity}},
            }
        }));
        await Product.bulkWrite(bulkOption, {});

        // clear cart
        await Cart.findByIdAndDelete(req.params.cartId);
    }

    res.status(201).json({status: 'Success', data: order});
});

exports.filterOrderForLoggedUser = asyncHandler(async(req, res, next) => {
    if(req.user.role == 'user') req.filterObj = {user: req.user._id} ;
    next();
});

// @desc    Get all orders
// @route   GET     /api/v1/orders
// access   protected/user-admin-manager
exports.findAllOrders = factory.getAll(Order);

// @desc    Get specific order
// @route   GET     /api/v1/orders
// access   protected/user-admin-manager
exports.findSpecificOrder = factory.getOne(Order);


// @desc    update order paid status to paid
// @route   PUT     /api/v1/orders/:id/pay
// access   protected/admin-manager
exports.updateOrderToPaid = asyncHandler(async(req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new apiError('There is no order for this id', 404));
    }

    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json({status: 'success', data: updatedOrder});
});


// @desc    update order delivered status 
// @route   PUT     /api/v1/orders/:id/deliver
// access   protected/admin-manager
exports.updateOrderToDelivered = asyncHandler(async(req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new apiError('There is no order for this id', 404));
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json({status: 'success', data: updatedOrder});
});

// @desc    Get checkout session from stripe and send it as response 
// @route   GET     /api/v1/orders/checkout-session/cartId
// access   protected/user
exports.checkoutSession = asyncHandler(async(req, res, next) => {
    const taxPrice = 0;
    const shippingPrice = 0;

    const cart = await Cart.findById(req.params.cartId);
    if(!cart){
        return next(new apiError('There is no cart for this id', 404));
    }
    const cartPrice =
     cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount: cart.totalCartPrice;
    
    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    const session = await stripe.checkout.sessions.create({
        
        line_items: [
            {
                /*name: req.user.name,
                amount: totalOrderPrice * 100,
                currency: 'egp',*/

                price_data: {
                    currency: 'egp',
                    unit_amount: totalOrderPrice * 100,
                    product_data: {
                      name: req.user.name,
                    },
                },
                quantity: 1,
            },
        ],
        
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/orders`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: req.body.shippingAddress,

    });

    res.status(200).json({status: 'success', session});
});




