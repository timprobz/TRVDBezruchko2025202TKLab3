const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest, requireAuth } = require('../middleware/authMiddleware');

// Реєстрація
router.get('/register', requireGuest, authController.showRegisterForm);
router.post('/register', requireGuest, authController.register);

// Вхід
router.get('/login', requireGuest, authController.showLoginForm);
router.post('/login', requireGuest, authController.login);

// Вихід
router.post('/logout', requireAuth, authController.logout);

// Профіль
router.get('/profile', requireAuth, authController.showProfile);
router.post('/profile/update', requireAuth, authController.updateProfile);
router.post('/profile/change-password', requireAuth, authController.changePassword);

module.exports = router;