const express = require('express');
const router = express.Router();
const expense = require("./expense");

router.route("/expenses").post(expense);

module.exports = router;