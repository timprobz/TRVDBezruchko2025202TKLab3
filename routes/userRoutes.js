const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Тільки для адміністраторів/бібліотекарів
router.get('/', requireRole('librarian', 'admin'), userController.getAllUsers);
router.get('/create', requireRole('admin'), userController.getCreateUserForm);
router.post('/create', requireRole('admin'), userController.createUser);

router.get('/edit/:id', requireRole('admin'), userController.getEditUserForm);
router.post('/edit/:id', requireRole('admin'), userController.updateUser);

router.post('/delete/:id', requireRole('admin'), userController.deleteUser);

router.get('/:id', requireRole('librarian', 'admin'), userController.getUserDetails);

module.exports = router;