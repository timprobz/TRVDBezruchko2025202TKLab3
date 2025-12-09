const User = require('../models/User');
const { validationResult } = require('express-validator');

class AuthController {
    // Показати форму реєстрації
    showRegisterForm(req, res) {
        res.render('register', {
            title: 'Реєстрація'
        });
    }

    // Обробити реєстрацію
    async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('register', {
                    title: 'Реєстрація',
                    errors: errors.array(),
                    formData: req.body
                });
            }

            const { firstName, lastName, email, password, phone } = req.body;

            // Перевірити, чи існує користувач з таким email
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.render('register', {
                    title: 'Реєстрація',
                    error: 'Користувач з таким email вже існує',
                    formData: req.body
                });
            }

            // Створити нового користувача
            const user = new User({
                firstName,
                lastName,
                email,
                password,
                phone
            });

            await user.save();

            req.session.successMessage = 'Реєстрація успішна! Будь ласка, увійдіть.';
            res.redirect('/auth/login');
        } catch (error) {
            console.error('Помилка при реєстрації:', error);
            res.render('register', {
                title: 'Реєстрація',
                error: 'Сталася помилка при реєстрації',
                formData: req.body
            });
        }
    }

    // Показати форму входу
    showLoginForm(req, res) {
        res.render('login', {
            title: 'Вхід'
        });
    }

    // Обробити вхід
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Знайти користувача
            const user = await User.findOne({ email });
            if (!user) {
                return res.render('login', {
                    title: 'Вхід',
                    error: 'Невірний email або пароль',
                    formData: req.body
                });
            }

            // Перевірити пароль
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.render('login', {
                    title: 'Вхід',
                    error: 'Невірний email або пароль',
                    formData: req.body
                });
            }

            // Перевірити статус користувача
            if (user.status !== 'active') {
                return res.render('login', {
                    title: 'Вхід',
                    error: 'Ваш акаунт неактивний або заблокований',
                    formData: req.body
                });
            }

            // Оновити останній вхід
            user.lastLogin = new Date();
            await user.save();

            // Зберегти користувача в сесії
            req.session.user = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                status: user.status,
                phone: user.phone
            };

            req.session.successMessage = `Ласкаво просимо, ${user.firstName}!`;
            res.redirect('/');
        } catch (error) {
            console.error('Помилка при вході:', error);
            res.render('login', {
                title: 'Вхід',
                error: 'Сталася помилка при вході',
                formData: req.body
            });
        }
    }

    // Вийти
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Помилка при виході:', err);
                return res.redirect('/');
            }
            res.clearCookie('connect.sid');
            res.redirect('/auth/login');
        });
    }

    // Показати профіль
    async showProfile(req, res) {
        try {
            const user = await User.findById(req.session.user.id)
                .populate('borrowedBooks.bookId', 'title author');
            
            res.render('profile', {
                title: 'Мій профіль',
                user
            });
        } catch (error) {
            console.error('Помилка при завантаженні профілю:', error);
            req.session.errorMessage = 'Не вдалося завантажити профіль';
            res.redirect('/');
        }
    }

    // Оновити профіль
    async updateProfile(req, res) {
        try {
            const { firstName, lastName, phone } = req.body;
            const userId = req.session.user.id;

            const user = await User.findById(userId);
            if (!user) {
                req.session.errorMessage = 'Користувача не знайдено';
                return res.redirect('/auth/profile');
            }

            user.firstName = firstName;
            user.lastName = lastName;
            user.phone = phone;

            await user.save();

            // Оновити сесію
            req.session.user.firstName = user.firstName;
            req.session.user.lastName = user.lastName;
            req.session.user.phone = user.phone;

            req.session.successMessage = 'Профіль успішно оновлено!';
            res.redirect('/auth/profile');
        } catch (error) {
            console.error('Помилка при оновленні профілю:', error);
            req.session.errorMessage = 'Не вдалося оновити профіль';
            res.redirect('/auth/profile');
        }
    }

    // Змінити пароль
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const userId = req.session.user.id;

            if (newPassword !== confirmPassword) {
                req.session.errorMessage = 'Нові паролі не співпадають';
                return res.redirect('/auth/profile');
            }

            const user = await User.findById(userId);
            if (!user) {
                req.session.errorMessage = 'Користувача не знайдено';
                return res.redirect('/auth/profile');
            }

            // Перевірити поточний пароль
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                req.session.errorMessage = 'Поточний пароль невірний';
                return res.redirect('/auth/profile');
            }

            // Оновити пароль
            user.password = newPassword;
            await user.save();

            req.session.successMessage = 'Пароль успішно змінено!';
            res.redirect('/auth/profile');
        } catch (error) {
            console.error('Помилка при зміні пароля:', error);
            req.session.errorMessage = 'Не вдалося змінити пароль';
            res.redirect('/auth/profile');
        }
    }
}

module.exports = new AuthController();