const Book = require('../models/Book');
const User = require('../models/User');

class BookController {
    // Отримати всі книги
    async getAllBooks(req, res) {
        try {
            const { search, genre, year, status } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            let query = {};

            // Пошук
            if (search) {
                query.$text = { $search: search };
            }

            // Фільтри
            if (genre) query.genre = genre;
            if (year) query.year = year;
            if (status) query.status = status;

            const [books, total] = await Promise.all([
                Book.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Book.countDocuments(query)
            ]);

            const totalPages = Math.ceil(total / limit);

            res.render('books', {
                title: 'Книги',
                books,
                currentPage: page,
                totalPages,
                total,
                search: search || '',
                selectedGenre: genre || '',
                selectedYear: year || '',
                selectedStatus: status || '',
                genres: ['трилер', 'фантастика', 'історичний', 'драма', 'класика', 'роман', 'поезія', 'детектив'],
                years: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i),
                statuses: ['available', 'borrowed', 'reserved', 'maintenance']
            });
        } catch (error) {
            console.error('Помилка при отриманні книг:', error);
            res.status(500).render('error', {
                title: 'Помилка сервера',
                message: 'Не вдалося завантажити список книг'
            });
        }
    }

    // Отримати форму для створення книги
    getCreateBookForm(req, res) {
        res.render('book-create', {
            title: 'Додати нову книгу',
            genres: ['трилер', 'фантастика', 'історичний', 'драма', 'класика', 'роман', 'поезія', 'детектив'],
            statuses: ['available', 'borrowed', 'reserved', 'maintenance'],
            languages: ['українська', 'російська', 'англійська', 'польська', 'німецька']
        });
    }

    // Створити нову книгу
    async createBook(req, res) {
        try {
            const bookData = {
                ...req.body,
                year: parseInt(req.body.year),
                copies: parseInt(req.body.copies) || 1,
                pages: parseInt(req.body.pages) || null,
                createdBy: req.session.user.id
            };

            const book = new Book(bookData);
            await book.save();

            req.session.successMessage = 'Книгу успішно додано!';
            res.redirect('/books');
        } catch (error) {
            console.error('Помилка при створенні книги:', error);
            res.render('book-create', {
                title: 'Додати нову книгу',
                error: 'Не вдалося додати книгу',
                formData: req.body,
                genres: ['трилер', 'фантастика', 'історичний', 'драма', 'класика', 'роман', 'поезія', 'детектив'],
                statuses: ['available', 'borrowed', 'reserved', 'maintenance'],
                languages: ['українська', 'російська', 'англійська', 'польська', 'німецька']
            });
        }
    }

    // Отримати форму для редагування книги
    async getEditBookForm(req, res) {
        try {
            const bookId = req.params.id;
            const book = await Book.findById(bookId);
            
            if (!book) {
                req.session.errorMessage = 'Книгу не знайдено';
                return res.redirect('/books');
            }

            res.render('book-edit', {
                title: 'Редагувати книгу',
                book,
                genres: ['трилер', 'фантастика', 'історичний', 'драма', 'класика', 'роман', 'поезія', 'детектив'],
                statuses: ['available', 'borrowed', 'reserved', 'maintenance'],
                languages: ['українська', 'російська', 'англійська', 'польська', 'німецька']
            });
        } catch (error) {
            console.error('Помилка при отриманні книги для редагування:', error);
            req.session.errorMessage = 'Не вдалося завантажити дані книги';
            res.redirect('/books');
        }
    }

    // Оновити книгу
    async updateBook(req, res) {
        try {
            const bookId = req.params.id;
            const bookData = {
                ...req.body,
                year: parseInt(req.body.year),
                copies: parseInt(req.body.copies) || 1,
                pages: parseInt(req.body.pages) || null
            };

            const book = await Book.findByIdAndUpdate(
                bookId,
                bookData,
                { new: true, runValidators: true }
            );

            if (!book) {
                req.session.errorMessage = 'Книгу не знайдено';
                return res.redirect('/books');
            }

            req.session.successMessage = 'Книгу успішно оновлено!';
            res.redirect('/books');
        } catch (error) {
            console.error('Помилка при оновленні книги:', error);
            res.render('book-edit', {
                title: 'Редагувати книгу',
                book: req.body,
                error: 'Не вдалося оновити книгу',
                genres: ['трилер', 'фантастика', 'історичний', 'драма', 'класика', 'роман', 'поезія', 'детектив'],
                statuses: ['available', 'borrowed', 'reserved', 'maintenance'],
                languages: ['українська', 'російська', 'англійська', 'польська', 'німецька']
            });
        }
    }

    // Видалити книгу
    async deleteBook(req, res) {
        try {
            const bookId = req.params.id;
            const book = await Book.findByIdAndDelete(bookId);

            if (!book) {
                req.session.errorMessage = 'Книгу не знайдено';
                return res.redirect('/books');
            }

            req.session.successMessage = 'Книгу успішно видалено!';
            res.redirect('/books');
        } catch (error) {
            console.error('Помилка при видаленні книги:', error);
            req.session.errorMessage = 'Не вдалося видалити книгу';
            res.redirect('/books');
        }
    }

    // Позичити книгу
    async borrowBook(req, res) {
        try {
            const bookId = req.params.id;
            const userId = req.session.user.id;

            const [book, user] = await Promise.all([
                Book.findById(bookId),
                User.findById(userId)
            ]);

            if (!book || !user) {
                req.session.errorMessage = 'Книгу або користувача не знайдено';
                return res.redirect('/books');
            }

            if (!book.isAvailable()) {
                req.session.errorMessage = 'Книга недоступна для позичання';
                return res.redirect('/books');
            }

            // Перевірити, чи користувач уже позичив цю книгу
            const alreadyBorrowed = book.borrowedBy.some(
                loan => loan.user.toString() === userId && !loan.returned
            );

            if (alreadyBorrowed) {
                req.session.errorMessage = 'Ви вже позичили цю книгу';
                return res.redirect('/books');
            }

            // Додати позичання
            const borrowDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); // 14 днів на повернення

            book.borrowedBy.push({
                user: userId,
                borrowDate,
                dueDate,
                returned: false
            });

            user.borrowedBooks.push({
                bookId,
                borrowDate,
                dueDate,
                returned: false
            });

            await Promise.all([book.save(), user.save()]);

            req.session.successMessage = 'Книгу успішно позичено! Термін повернення: ' + dueDate.toLocaleDateString('uk-UA');
            res.redirect('/books');
        } catch (error) {
            console.error('Помилка при позиченні книги:', error);
            req.session.errorMessage = 'Не вдалося позичити книгу';
            res.redirect('/books');
        }
    }

    // Повернути книгу
    async returnBook(req, res) {
        try {
            const bookId = req.params.id;
            const userId = req.session.user.id;

            const [book, user] = await Promise.all([
                Book.findById(bookId),
                User.findById(userId)
            ]);

            if (!book || !user) {
                req.session.errorMessage = 'Книгу або користувача не знайдено';
                return res.redirect('/books');
            }

            // Знайти позичання
            const bookLoanIndex = book.borrowedBy.findIndex(
                loan => loan.user.toString() === userId && !loan.returned
            );

            const userLoanIndex = user.borrowedBooks.findIndex(
                loan => loan.bookId.toString() === bookId && !loan.returned
            );

            if (bookLoanIndex === -1 || userLoanIndex === -1) {
                req.session.errorMessage = 'Позичання не знайдено';
                return res.redirect('/books');
            }

            // Позначити як повернене
            book.borrowedBy[bookLoanIndex].returned = true;
            book.borrowedBy[bookLoanIndex].returnDate = new Date();

            user.borrowedBooks[userLoanIndex].returned = true;
            user.borrowedBooks[userLoanIndex].returnDate = new Date();

            await Promise.all([book.save(), user.save()]);

            req.session.successMessage = 'Книгу успішно повернено!';
            res.redirect('/books');
        } catch (error) {
            console.error('Помилка при поверненні книги:', error);
            req.session.errorMessage = 'Не вдалося повернути книгу';
            res.redirect('/books');
        }
    }
}

module.exports = new BookController();