require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Book = require('../models/Book');
const User = require('../models/User');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Підключено до MongoDB для seed');

        // Очистити базу даних
        await Book.deleteMany({});
        await User.deleteMany({});

        // Створити адміністратора
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            firstName: 'Адміністратор',
            lastName: 'Системи',
            email: 'admin@library.com',
            password: adminPassword,
            role: 'admin',
            status: 'active'
        });
        await admin.save();

        // Створити бібліотекаря
        const librarianPassword = await bcrypt.hash('librarian123', 10);
        const librarian = new User({
            firstName: 'Бібліотекар',
            lastName: 'Головний',
            email: 'librarian@library.com',
            password: librarianPassword,
            role: 'librarian',
            status: 'active'
        });
        await librarian.save();

        // Створити звичайного користувача
        const userPassword = await bcrypt.hash('user123', 10);
        const user = new User({
            firstName: 'Іван',
            lastName: 'Петренко',
            email: 'user@library.com',
            password: userPassword,
            role: 'reader',
            status: 'active'
        });
        await user.save();

        // Створити книги
        const books = [
            {
                title: "Я бачу вас цікавить пітьма",
                author: "Ілларіон Павлюк",
                year: 2023,
                genre: "трилер",
                description: "Трилер про загадкові події в сучасному світі та боротьбу з невідомим.",
                image: "https://upload.wikimedia.org/wikipedia/uk/a/ad/%22%D0%AF_%D0%B1%D0%B0%D1%87%D1%83%2C_%D0%B2%D0%B0%D1%81_%D1%86%D1%96%D0%BA%D0%B0%D0%B2%D0%B8%D1%82%D1%8C_%D0%BF%D1%96%D1%82%D1%8C%D0%BC%D0%B0%22_%D0%86%D0%BB%D0%BB%D0%B0%D1%80%D1%96%D0%BE%D0%BD_%D0%9F%D0%B0%D0%B2%D0%BB%D1%8E%D0%BA%2C_%D0%BE%D0%B1%D0%BA%D0%BB%D0%B0%D0%B4%D0%B8%D0%BD%D0%BA%D0%B0.jpg",
                isbn: "9786177654231",
                copies: 5,
                status: "available",
                language: "українська",
                createdBy: admin._id
            },
            {
                title: "Колонія",
                author: "Макс Кідрук",
                year: 2023,
                genre: "фантастика",
                description: "Фантастичний роман про подорожі, технології та виживання у складних умовах.",
                image: "https://tamarinbooks.com/wp-content/uploads/2023/04/kidruk_new-1.jpg",
                isbn: "9786178026452",
                copies: 3,
                status: "available",
                language: "українська",
                createdBy: admin._id
            }
        ];

        for (const bookData of books) {
            const book = new Book(bookData);
            await book.save();
        }

        console.log('Базу даних успішно заповнено!');
        console.log('Адміністратор: admin@library.com / admin123');
        console.log('Бібліотекар: librarian@library.com / librarian123');
        console.log('Користувач: user@library.com / user123');

        process.exit(0);
    } catch (error) {
        console.error('Помилка при заповненні бази даних:', error);
        process.exit(1);
    }
};

seedDatabase();