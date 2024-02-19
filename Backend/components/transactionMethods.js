const { default: axios } = require("axios");
const product_Model = require("../models/product_Model");

// Map month name to its numerical representation
const monthNameToNumber = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

// Create an API to list the all transactions
exports.listAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default page number is 1
    const perPage = 10;
    const skip = (page - 1) * perPage;

    console.log(req.query);

    const search = req.query.search
      ? {
          $or: [
            { title: { $regex: req.query.search, $options: "i" } }, // Case-insensitive search on title
            { description: { $regex: req.query.search, $options: "i" } }, // Case-insensitive search on description
            { price: { $gte: parseFloat(req.query.price) } }, // product have greater price
          ],
        }
      : {};

    // Fetch transactions based on search and pagination criteria
    let transactions = await product_Model
      .find(search)
      .skip(skip)
      .limit(perPage)
      .exec();

    if (transactions == null)
      transactions = await product_Model
        .find()
        .skip(skip)
        .limit(perPage)
        .exec();

    res.status(200).json({
      success: true,
      data: transactions,
      message: "Data fetch successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// Create an API for statistics

exports.statistics = async (req, res) => {
  try {

    const month = monthNameToNumber[req.query.month];

    if (!month) {
      throw new Error("Invalid month");
    }

    // Calculate total sale amount of selected month
    const totalSaleAmount = await product_Model.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, month],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$price" },
        },
      },
    ]);

    // Calculate total number of sold items of selected month
    const totalSoldItems = await product_Model.countDocuments({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, month],
      },
      sold: true,
    });

    // Calculate total number of unsold items of selected month
    const totalUnsoldItems = await product_Model.countDocuments({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, month],
      },
      sold: false,
    });

    res.status(200).json({
      success: true,
      message: "Data fetch successfully",
      data: {
        totalSaleAmount,
        totalSoldItems,
        totalUnsoldItems,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// Create an API for bar chart ( the response should contain price range and the number
// of items in that range for the selected month regardless of the year )

exports.bar_chat = async (req, res) => {
  try {
    const month = monthNameToNumber[req.query.month];
    if (!month) {
      throw new Error("Invalid month");
    }

    const priceRanges = [
      { range: "0 - 100", min: 0, max: 100 },
      { range: "101 - 200", min: 101, max: 200 },
      { range: "201 - 300", min: 201, max: 300 },
      { range: "301 - 400", min: 301, max: 400 },
      { range: "401 - 500", min: 401, max: 500 },
      { range: "501 - 600", min: 501, max: 600 },
      { range: "601 - 700", min: 601, max: 700 },
      { range: "701 - 800", min: 701, max: 800 },
      { range: "801 - 900", min: 801, max: 900 },
      { range: "901 - above", min: 901, max: Infinity },
    ];

    // Initialize an object to store counts for each price range
    const priceRangeCounts = {};
    let total_Product = 0;
    // Query the database to count the number of items falling within each price range
    for (const range of priceRanges) {
      const count = await product_Model.countDocuments({
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, month],
        },
        price: { $gte: range.min, $lte: range.max },
      });
      priceRangeCounts[range.range] = count;
      total_Product += count;
    }

    res.status(200).json({
      success: true,
      message: "Data fetch successfully",
      data: { priceRangeCounts, total_Product },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};



// Create an API for pie chart Find unique categories and number of items from that
// category for the selected month regardless of the year.

exports.pie_chart = async (req, res) => {
  try {
    const month = monthNameToNumber[req.query.month];
    if (!month) {
      throw new Error("Invalid month");
    }

    const categoryCounts = await product_Model.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, month],
          },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Construct the response object
    const pieChartData = {};
    categoryCounts.forEach((category) => {
      pieChartData[category._id] = category.count;
    });

    res.status(200).json({
      success: true,
      message: "Data fetch successfully",
      data:pieChartData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};


// Create an API which fetches the data from all the 3 APIs mentioned above, combines
// the response and sends a final response of the combined JSON

exports.combine_api=async(req,res)=>{
  try {

    const apiPromises = [];

    // Fetch data from each API and store the promises in the array
    apiPromises.push(axios.get(`http://localhost:4000/api/v1/statistics?month=${req.query.month}`));
    apiPromises.push(axios.get(`http://localhost:4000/api/v1/bar-chart?month=${req.query.month}`));
    apiPromises.push(axios.get(`http://localhost:4000/api/v1/pie-chart?month=${req.query.month}`));


    // Wait for all promises to resolve
    const responses = await Promise.all(apiPromises);

    // Extract data from each response
    const [statisticsResponse, barChartResponse, pieChartResponse] = responses.map(response => response.data);

    // Combine the responses
    const combinedData = {
        transactions: statisticsResponse,
        barChart: barChartResponse,
        pieChart: pieChartResponse
    };

    res.status(200).json({
      success:true,
      message:"Data fetch successfully",
      data:combinedData
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
}
