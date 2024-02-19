const mongoose=require("mongoose");

const dbConnect=()=>{
    mongoose.connect(process.env.dbUrl)
    .then((con)=>console.log(`database connected at ${con.connection.host}`))
    .catch((err)=>console.log(err));
    
}

module.exports=dbConnect