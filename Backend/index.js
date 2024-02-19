const express=require("express")
const dotenv=require("dotenv")
const cors=require("cors");
const dbConnect = require("./utils/dbconnect");
const seedDataRouter = require("./routes/seedDataRouter");
const transactionsRouter = require("./routes/transactionRoutes");

dotenv.config();


const app=express();
dbConnect();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.get("/",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"server is runing"
    })
})

app.use("/api/v1",seedDataRouter)
app.use("/api/v1",transactionsRouter)

app.listen(process.env.PORT,()=>{
    console.log("serrver is runing")
})


