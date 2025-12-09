const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Публічні маршрути
router.get('/', bookController.getAllBooks);

// Захищені маршрути
router.get('/create', requireRole('librarian', 'admin'), bookController.getCreateBookForm);
router.post('/create', requireRole('librarian', 'admin'), bookController.createBook);

router.get('/edit/:id', requireRole('librarian', 'admin'), bookController.getEditBookForm);
router.post('/edit/:id', requireRole('librarian', 'admin'), bookController.updateBook);

router.post('/delete/:id', requireRole('admin'), bookController.deleteBook);

// Позичення/повернення книг
router.post('/borrow/:id', requireAuth, bookController.borrowBook);
router.post('/return/:id', requireAuth, bookController.returnBook);

module.exports = router;