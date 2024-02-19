const { default: axios } = require("axios");
const product_Model = require("../models/product_Model");

exports.getSeedData=async(req,res)=>{
    try {
        const response=await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json");
        if(response.data===null||response.data===undefined)
        throw new Error("Data is not found")

        await product_Model.insertMany(response.data);
        res.status(200).json({
            success:true,
            message:"Seed data is inserted"
        })
    } catch (error) {
        res.status(400).json(
            {
                success:false,
                message:error.message
            }
        )
    }
}