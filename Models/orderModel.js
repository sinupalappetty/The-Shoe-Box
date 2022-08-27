const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const orderSchema = new mongoose.Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    orderItems:[
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity: {
                type: Number,

            },
            size: {
                type: String,
                
            }
        }
    ],
    totalPrice: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    shipping: {
        type: Number,
    },
    Total: {
        type: Number,
    },


    deliveryDetails:{
        type: Schema.Types.ObjectId,
        ref: 'Address',
    },
    paymentDetails:{
        type: String,
    },
    // Status:{
    //     type: String,
    // },
    orderStatus:{
        type: String,
    },
    date:{
        type: String,
    },
    time:{
        type: String,
    }
    




},
{
    timestamps: true,
})

module.exports = mongoose.model('Order',orderSchema);