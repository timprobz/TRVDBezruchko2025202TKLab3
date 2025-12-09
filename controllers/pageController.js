const Book = require('../models/Book');

const bookModel = new Book();

class PageController {
    // Головна сторінка
    async getHomePage(req, res) {
        try {
            const books = await bookModel.getAll();
            const recentBooks = books.slice(0, 4);
            const stats = {
                totalBooks: books.length,
                availableBooks: books.filter(b => b.status === 'available').length,
                newBooks: books.filter(b => b.year === 2023).length
            };
            
            res.render('index', {
                title: 'Головна',
                recentBooks,
                stats,
                successMessage: req.session.successMessage
            });
            
            // Очистити повідомлення про успіх
            delete req.session.successMessage;
        } catch (error) {
            console.error('Помилка при завантаженні головної сторінки:', error);
            res.status(500).render('error', {
                title: 'Помилка сервера',
                message: 'Не вдалося завантажити головну сторінку'
            });
        }
    }

    // Сторінка "Про сайт"
    getAboutPage(req, res) {
        res.render('about', {
            title: 'Про сайт',
            features: [
                'Управління каталогом книг',
                'Керування користувачами',
                'Пошук та фільтрація',
                'Додавання нових книг',
                'Редагування інформації',
                'Видалення записів'
            ],
            technologies: [
                { name: 'Node.js', description: 'Серверна платформа' },
                { name: 'Express', description: 'Веб-фреймворк' },
                { name: 'Mustache', description: 'Шаблонізатор' },
                { name: 'HTML5/CSS3', description: 'Фронтенд технології' },
                { name: 'JavaScript', description: 'Клієнтські скрипти' }
            ]
        });
    }
}

module.exports = new PageController();