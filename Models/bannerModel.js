const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bannerSchema = new Schema({
          banner:String,
          title:String,
          caption:String,
          category:String
    
})

const Banner=mongoose.model("Banner",bannerSchema)
module.exports = Banner