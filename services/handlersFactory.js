const asyncHandler = require('express-async-handler') ;
const apiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) => asyncHandler(async(req, res, next) => {
    
    const document = await Model.findByIdAndDelete(req.params.id)
    if(!document){
        return next(new apiError(`No document for this id ${id}`, 404));
    }
    // Trigger "remove" event when update
    await document.deleteOne();
    res.status(204).send();
});

exports.updateOne = (Model) => asyncHandler(async(req, res, next) => {
    const document = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true});

    if(!document){
        return next(new apiError(`No document for this id ${id}`, 404));
    }
    // Trigger "save" event when update
    await document.save();
    res.status(200).json({data: document});
});

exports.createOne = (Model) => asyncHandler(async (req , res) => {
    const document = await Model.create(req.body);
    res.status(201).json({data: document});
})

exports.getOne = (Model, populationOpt) => asyncHandler(async(req, res, next) => {
    // build query
    let query = Model.findById(req.params.id);
    if(populationOpt){
        query = query.populate(populationOpt);
    }

    // execute query
    const document = await query;
    if(!document){
        return next(new apiError(`No document for this id`, 404));
    }
    res.status(200).json({data: document});
});

exports.getAll = (Model, modelName = '') => asyncHandler(async(req , res) => {
    let filter = {};
    if(req.filterObject){
        filter = req.filterObject ;
    }
    // Build Query
    const documentscount = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
    .paginate(documentscount)
    .filter()
    .search(modelName)
    .limitFields()
    .sort();
    

    // Execute query
    const {mongooseQuery, paginationResult} = apiFeatures;
    const documents = await mongooseQuery;

    res.status(200).json({results: documents.length, paginationResult, data: documents}) ;
})