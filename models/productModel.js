const { request } = require('express');
const mongoose = require('mongoose');

// 1- Create Schema
const productSchema = new mongoose.Schema({
        title: {
            type : String,
            required : [true , 'product required'] ,
            unique : [true , 'product must be unique'] ,
            trim: true,
            minlength : [3 , 'Too short product title'] ,
            maxlength : [100 , 'Too long product title'] ,
        },
        slug :{
            type : String,
            request: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true , 'product description is required'],
            minlength : [5 , 'Too short product description'] ,

        },
        quantity: {
            type: Number,
            required: [true , 'product quantity is required'],
        },
        sold: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true , 'product price is required'],
            max : [20000000 , 'Too long product price'] ,
            trim: true,
        },
        priceAfterDiscount: {
            type: Number,
        },
        colors: [String],
        imageCover: {
            type: String,
            required: [true , 'product image cover is required'],
        },
        images: [String],
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'Category',
            required: [true, 'product must belong to category'],
        },
        subcategories: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'SubCategory',
            }
        ],
        brand: {
            type: mongoose.Schema.ObjectId,
            ref: 'Brand',
        },
        ratingsAverage: {
            type: Number,
            min : [1 , 'Rating must be more than or equal to 1'] ,
            max : [5 , 'Rating must be less than or equal to 5'] ,
        },
        ratingQuantity: {
            type: Number,
            default: 0,
        }
    }, 
    {
        timestamps: true,
        // to enable virtual population
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
);

productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id',
});

// mongoose query middleware
productSchema.pre(/^find/, function(next){
    this.populate({
        path: 'category',
        select: "name -_id"
    });
    next();
});

const setImageURL = (doc) => {
    if(doc.imageCover){
        const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
        doc.imageCover = imageUrl; 
    }
    if(doc.images){
        const imagesList = [];
        doc.images.forEach((image) => {
            const imageURL = `${process.env.BASE_URL}/products/${image}`;
            imagesList.push(imageURL);
        });
        doc.images = imagesList;
    }
}
// findOne, findAll, update
productSchema.post('init', (doc) => {
    setImageURL(doc);
});
// create
productSchema.post('save', (doc) => {
    setImageURL(doc);
});

const ProductModel = mongoose.model('Product' , productSchema);

module.exports = ProductModel ;