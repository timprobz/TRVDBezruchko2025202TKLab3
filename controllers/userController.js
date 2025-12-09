const User = require('../models/User');
const Book = require('../models/Book');

class UserController {
    // Отримати всіх користувачів (тільки для адміністраторів/бібліотекарів)
    async getAllUsers(req, res) {
        try {
            const { search, role, status } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            let query = {};

            // Пошук
            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            // Фільтри
            if (role) query.role = role;
            if (status) query.status = status;

            // Не показувати паролі
            const select = '-password';

            const [users, total] = await Promise.all([
                User.find(query, select)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                User.countDocuments(query)
            ]);

            const totalPages = Math.ceil(total / limit);

            res.render('users', {
                title: 'Користувачі',
                users,
                currentPage: page,
                totalPages,
                total,
                search: search || '',
                selectedRole: role || '',
                selectedStatus: status || '',
                roles: ['reader', 'librarian', 'admin'],
                statuses: ['active', 'inactive', 'suspended']
            });
        } catch (error) {
            console.error('Помилка при отриманні користувачів:', error);
            res.status(500).render('error', {
                title: 'Помилка сервера',
                message: 'Не вдалося завантажити список користувачів'
            });
        }
    }

    // Отримати форму для створення користувача
    getCreateUserForm(req, res) {
        res.render('user-create', {
            title: 'Додати нового користувача',
            roles: ['reader', 'librarian', 'admin'],
            statuses: ['active', 'inactive', 'suspended']
        });
    }

    // Створити нового користувача
    async createUser(req, res) {
        try {
            const userData = {
                ...req.body,
                registrationDate: new Date()
            };

            const user = new User(userData);
            await user.save();

            req.session.successMessage = 'Користувача успішно додано!';
            res.redirect('/users');
        } catch (error) {
            console.error('Помилка при створенні користувача:', error);
            res.render('user-create', {
                title: 'Додати нового користувача',
                error: 'Не вдалося додати користувача',
                formData: req.body,
                roles: ['reader', 'librarian', 'admin'],
                statuses: ['active', 'inactive', 'suspended']
            });
        }
    }

    // Отримати форму для редагування користувача
    async getEditUserForm(req, res) {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId, '-password');
            
            if (!user) {
                req.session.errorMessage = 'Користувача не знайдено';
                return res.redirect('/users');
            }

            // Не дозволяти редагувати себе (для зміни ролі)
            if (user._id.toString() === req.session.user.id) {
                req.session.errorMessage = 'Ви не можете редагувати свій власний профіль тут';
                return res.redirect('/users');
            }

            res.render('user-edit', {
                title: 'Редагувати користувача',
                user,
                roles: ['reader', 'librarian', 'admin'],
                statuses: ['active', 'inactive', 'suspended']
            });
        } catch (error) {
            console.error('Помилка при отриманні користувача для редагування:', error);
            req.session.errorMessage = 'Не вдалося завантажити дані користувача';
            res.redirect('/users');
        }
    }

    // Оновити користувача
    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            
            // Не дозволяти редагувати себе
            if (userId === req.session.user.id) {
                req.session.errorMessage = 'Ви не можете редагувати свій власний профіль тут';
                return res.redirect('/users');
            }

            const user = await User.findByIdAndUpdate(
                userId,
                req.body,
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                req.session.errorMessage = 'Користувача не знайдено';
                return res.redirect('/users');
            }

            req.session.successMessage = 'Користувача успішно оновлено!';
            res.redirect('/users');
        } catch (error) {
            console.error('Помилка при оновленні користувача:', error);
            res.render('user-edit', {
                title: 'Редагувати користувача',
                user: req.body,
                error: 'Не вдалося оновити користувача',
                roles: ['reader', 'librarian', 'admin'],
                statuses: ['active', 'inactive', 'suspended']
            });
        }
    }

    // Видалити користувача
    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            
            // Не дозволяти видаляти себе
            if (userId === req.session.user.id) {
                req.session.errorMessage = 'Ви не можете видалити свій власний акаунт';
                return res.redirect('/users');
            }

            const user = await User.findByIdAndDelete(userId);

            if (!user) {
                req.session.errorMessage = 'Користувача не знайдено';
                return res.redirect('/users');
            }

            req.session.successMessage = 'Користувача успішно видалено!';
            res.redirect('/users');
        } catch (error) {
            console.error('Помилка при видаленні користувача:', error);
            req.session.errorMessage = 'Не вдалося видалити користувача';
            res.redirect('/users');
        }
    }

    // Показати деталі користувача
    async getUserDetails(req, res) {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId, '-password')
                .populate('borrowedBooks.bookId', 'title author image');

            if (!user) {
                req.session.errorMessage = 'Користувача не знайдено';
                return res.redirect('/users');
            }

            res.render('user-details', {
                title: `Користувач: ${user.getFullName()}`,
                user
            });
        } catch (error) {
            console.error('Помилка при отриманні деталей користувача:', error);
            req.session.errorMessage = 'Не вдалося завантажити дані користувача';
            res.redirect('/users');
        }
    }
}

module.exports = new UserController();