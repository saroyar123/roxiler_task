const { Router } = require("express");
const { listAllTransactions, statistics, bar_chat, pie_chart, combine_api } = require("../components/transactionMethods");

const transactionsRouter=Router();

transactionsRouter.route("/getTransactions").get(listAllTransactions);
transactionsRouter.route("/statistics").get(statistics);
transactionsRouter.route("/bar-chart").get(bar_chat)
transactionsRouter.route("/pie-chart").get(pie_chart)
transactionsRouter.route("/combine_api").get(combine_api)

module.exports=transactionsRouter