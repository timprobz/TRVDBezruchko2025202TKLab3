require('dotenv').config();
const express = require('express');
const mustacheExpress = require('mustache-express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Налаштування шаблонізатора Mustache
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Налаштування сесій
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 день
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 день
    }
}));

// Підключення до MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Підключено до MongoDB'))
.catch(err => console.error('Помилка підключення до MongoDB:', err));

// Глобальні змінні для шаблонів
app.use((req, res, next) => {
    res.locals.siteTitle = 'Бібліотека українських книг';
    res.locals.currentYear = new Date().getFullYear();
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.user;
    res.locals.isAdmin = req.session.user?.role === 'admin';
    res.locals.isLibrarian = req.session.user?.role === 'librarian' || req.session.user?.role === 'admin';
    next();
});

// Middleware для збереження повідомлень
app.use((req, res, next) => {
    res.locals.successMessage = req.session.successMessage;
    res.locals.errorMessage = req.session.errorMessage;
    delete req.session.successMessage;
    delete req.session.errorMessage;
    next();
});

// Підключення маршрутів
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/', pageRoutes);
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/users', userRoutes);

// Обробка 404
app.use((req, res) => {
    res.status(404).render('404', { title: 'Сторінку не знайдено' });
});

// Обробка помилок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Помилка сервера',
        message: 'Щось пішло не так. Будь ласка, спробуйте пізніше.'
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});