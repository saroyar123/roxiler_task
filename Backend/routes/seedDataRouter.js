const { Router } = require("express");
const { getSeedData } = require("../components/seedData");


const seedDataRouter=Router();

seedDataRouter.route("/seedData").get(getSeedData);

module.exports=seedDataRouter