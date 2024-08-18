const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'name required'],
    },
    slug: {
        type: String,
        lowecase: true,
    },
    email: {
        type: String,
        required: [true, 'email required'],
        unique: true,
        lowecase: true,
    },
    phone: String,
    profileImg: String,
    password:{
        type: String,
        required: [true, 'password required'],
        minlenght: [6, 'Too short password'],
    },

    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date, 
    passwordResetVerified: Boolean,
    role: {
        type: String,
        enum: ['user', 'manager', 'admin'],
        default: 'user',
    },
    active: {
        type: Boolean,
        default: true,
    },
    // child reference (one to many)
    wishlist: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
    }],
    addresses: [{
        id: {type: mongoose.Schema.Types.ObjectId},
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
    }],

},
{timestamps: true});


userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next(); 
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
