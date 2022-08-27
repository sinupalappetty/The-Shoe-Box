const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    
    cartItems: [{
        product:{
        type: Schema.Types.ObjectId,
        ref: 'Product'},
        quantity:{
        type: Number
        },
        size:{
            type: String,
            default:'Medium'
            },
        price:{
            type:Number
        },
        sub_total:{
            type:Number,
            default:0

        },
    
    }],
},

{
    timestamps: true,
}
)

module.exports = mongoose.model('Cart', cartSchema);