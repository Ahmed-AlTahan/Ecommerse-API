const mongoose = require('mongoose');
const Product = require('../models/productModel');

const reviewSchema = new mongoose.Schema({
        title: String,
        ratings: {
            type : Number,
            min : [1 , 'Min rating value is 1']  ,
            max : [5 , 'Max rating value is 5'] ,
            required : [true , 'Review ratings required'] ,
        } ,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required : [true , 'User required'] ,
        },
        // Parent reference (one to many)
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required : [true , 'Product required'] ,
        }, 
    }, 
    {timestamps: true}
);

reviewSchema.pre(/^find/, function(next){
    this.populate({path: 'user', select: 'name'});
    next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function(productId){
    const result = await this.aggregate([
        // Stage 1 : get all reviews on specific product
        {
            $match: {product: productId},
        },
        // Stage 2 : group all reviews based on product id and calculate avgRatings, ratingsQuantity 
        {
            $group: {
                _id: "product",
                avgRatings: {$avg: "$ratings"},
                ratingsQuantity: {$sum: 1},
            }
        },
    ]);

    if(result.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: result[0].avgRatings,
            ratingQuantity: result[0].ratingsQuantity,
        });
    }
    else{
        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: 0,
            ratingQuantity: 0,
        });
    }
};

reviewSchema.post("save", async function(){
    await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post('deleteOne', {document:true, query: false}, async function(){
    await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

module.exports = mongoose.model('Review' , reviewSchema);
