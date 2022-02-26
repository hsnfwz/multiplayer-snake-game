// libraries
const express = require('express');

// utils
const authentication = require('../utils/authentication');

// controllers
const userController = require('../controllers/user-controller');

const router = express.Router();

router.all('*', userController.user404NotFound);

module.exports = router;