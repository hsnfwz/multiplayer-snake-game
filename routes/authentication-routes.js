// libraries
const express = require('express');

// utils
const authentication = require('../utils/authentication');

// controllers
const authenticationController = require('../controllers/authentication-controller');

const router = express.Router();

router.post('/create-account', authenticationController.authenticationCreateAccount);
router.post('/sign-in', authenticationController.authenticationSignIn);
router.put('/reset-password', authenticationController.authenticationResetPassword);
router.delete('/sign-out', authenticationController.authenticationSignOut);
router.all('*', authenticationController.authentication404NotFound);

module.exports = router;