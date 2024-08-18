const mongoose = require('mongoose');

// 1- Create Schema
const subCategorySchema = new mongoose.Schema({
        name: {
            type : String,
            required : [true , 'SubCategory required'] ,
            trim: true,
            unique : [true , 'SubCategory must be unique'] ,
            minlength : [2 , 'Too short subcategory name'] ,
            maxlength : [32 , 'Too long subcategory name'] ,
        } ,
        // A and B => shopping.com/a-and-b
        slug :{
            type : String,
            lowercase: true,
        },
        category:{
            type: mongoose.Schema.ObjectId,
            ref: 'Category',
            required: [true, 'Subcategory must belong to parent category'],
        },
    }, 
    {timestamps: true}
);

// 2- Create model
const subCategoryModel = mongoose.model('SubCategory' , subCategorySchema);

module.exports = subCategoryModel ;