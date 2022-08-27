const mongoose = require( 'mongoose')
const mongourl='mongodb+srv://Sinuadil:PFtpfVn5zyYwbc2B@cluster0.l4or8nn.mongodb.net/shoebox?retryWrites=true&w=majority'
const mongoconnection=mongoose.connect(mongourl,()=>
console.log("database connected"))
module.exports={mongoconnection}