// Middleware для перевірки автентифікації
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.session.errorMessage = 'Будь ласка, увійдіть для доступу до цієї сторінки';
        return res.redirect('/auth/login');
    }
    next();
};

// Middleware для перевірки відсутності автентифікації
const requireGuest = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};

// Middleware для перевірки ролі
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            req.session.errorMessage = 'Будь ласка, увійдіть для доступу до цієї сторінки';
            return res.redirect('/auth/login');
        }

        if (!roles.includes(req.session.user.role)) {
            req.session.errorMessage = 'У вас немає дозволу для доступу до цієї сторінки';
            return res.redirect('/');
        }

        next();
    };
};

// Middleware для встановлення локальних змінних
const setLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.user;
    res.locals.isAdmin = req.session.user?.role === 'admin';
    res.locals.isLibrarian = req.session.user?.role === 'librarian' || req.session.user?.role === 'admin';
    next();
};

module.exports = {
    requireAuth,
    requireGuest,
    requireRole,
    setLocals
};