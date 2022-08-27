const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
    productname:{
        type:String,
        required:true
    },
    productdescription:{
        type:String,
        required:true
    },
    productimage:{
        type:Array,
    //    required:true 
    },
    productsizes:{
        type:[String]
    },
    productprice:{
        type:Number,
        required:true
    },
    productcategory:{
        type:String,
        required:true
    }
})

const product=mongoose.model("Product",productSchema)
module.exports =product