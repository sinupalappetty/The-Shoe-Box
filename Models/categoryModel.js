const mongoose = require('mongoose')
const Schema = mongoose.Schema
const categorySchema = new Schema(
    {
    
    categoryname:{
        type : String,
        required:true
    },
    categoryimage:{
        type : String,
        required:true
    },
    
    description:{
        type: String
    },
    alias:{
        type : String,
        required:true
    }
    
})

const category = mongoose.model("Category", categorySchema)
module.exports = category
