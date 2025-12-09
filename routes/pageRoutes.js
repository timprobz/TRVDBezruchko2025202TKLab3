const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Головна сторінка
router.get('/', pageController.getHomePage);

// Сторінка "Про сайт"
router.get('/about', pageController.getAboutPage);

module.exports = router;