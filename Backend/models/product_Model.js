const { Schema, default: mongoose } = require("mongoose");

const productSchema=new Schema({
    id:Number,
    title:String,
    price:Number,
    description:String,
    category:String,
    image:String,
    sold:Boolean,
    dateOfSale:Date
})

module.exports=mongoose.model("products",productSchema)