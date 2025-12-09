// Мокові дані для демонстрації
const books = [
    {
        id: 1,
        title: "Я бачу вас цікавить пітьма",
        author: "Ілларіон Павлюк",
        year: 2023,
        genre: "трилер",
        description: "Трилер про загадкові події в сучасному світі та боротьбу з невідомим.",
        image: "https://upload.wikimedia.org/wikipedia/uk/a/ad/%22%D0%AF_%D0%B1%D0%B0%D1%87%D1%83%2C_%D0%B2%D0%B0%D1%81_%D1%86%D1%96%D0%BA%D0%B0%D0%B2%D0%B8%D1%82%D1%8C_%D0%BF%D1%96%D1%82%D1%8C%D0%BC%D0%B0%22_%D0%86%D0%BB%D0%BB%D0%B0%D1%80%D1%96%D0%BE%D0%BD_%D0%9F%D0%B0%D0%B2%D0%BB%D1%8E%D0%BA%2C_%D0%BE%D0%B1%D0%BA%D0%BB%D0%B0%D0%B4%D0%B8%D0%BD%D0%BA%D0%B0.jpg",
        isbn: "978-617-7654-23-1",
        status: "available"
    },
    {
        id: 2,
        title: "Колонія",
        author: "Макс Кідрук",
        year: 2023,
        genre: "фантастика",
        description: "Фантастичний роман про подорожі, технології та виживання у складних умовах.",
        image: "https://tamarinbooks.com/wp-content/uploads/2023/04/kidruk_new-1.jpg",
        isbn: "978-617-8026-45-2",
        status: "available"
    },
    // Додати більше книг...
];

const users = [
    {
        id: 1,
        firstName: "Іван",
        lastName: "Петренко",
        email: "ivan@example.com",
        phone: "+380991234567",
        role: "читач",
        registrationDate: "2024-01-15",
        status: "активний"
    },
    {
        id: 2,
        firstName: "Марія",
        lastName: "Коваленко",
        email: "maria@example.com",
        phone: "+380992345678",
        role: "адміністратор",
        registrationDate: "2023-12-10",
        status: "активний"
    },
    // Додати більше користувачів...
];

// Функції для роботи з книгами
class BookManager {
    constructor() {
        this.books = this.loadFromStorage('books') || books;
        this.users = this.loadFromStorage('users') || users;
    }

    loadFromStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // CRUD операції для книг
    getAllBooks() {
        return this.books;
    }

    getBookById(id) {
        return this.books.find(book => book.id === parseInt(id));
    }

    addBook(book) {
        const newBook = {
            ...book,
            id: this.generateId(this.books)
        };
        this.books.push(newBook);
        this.saveToStorage('books', this.books);
        return newBook;
    }

    updateBook(id, updatedBook) {
        const index = this.books.findIndex(book => book.id === parseInt(id));
        if (index !== -1) {
            this.books[index] = { ...this.books[index], ...updatedBook };
            this.saveToStorage('books', this.books);
            return this.books[index];
        }
        return null;
    }

    deleteBook(id) {
        const index = this.books.findIndex(book => book.id === parseInt(id));
        if (index !== -1) {
            this.books.splice(index, 1);
            this.saveToStorage('books', this.books);
            return true;
        }
        return false;
    }

    // CRUD операції для користувачів
    getAllUsers() {
        return this.users;
    }

    getUserById(id) {
        return this.users.find(user => user.id === parseInt(id));
    }

    addUser(user) {
        const newUser = {
            ...user,
            id: this.generateId(this.users),
            registrationDate: new Date().toISOString().split('T')[0]
        };
        this.users.push(newUser);
        this.saveToStorage('users', this.users);
        return newUser;
    }

    updateUser(id, updatedUser) {
        const index = this.users.findIndex(user => user.id === parseInt(id));
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUser };
            this.saveToStorage('users', this.users);
            return this.users[index];
        }
        return null;
    }

    deleteUser(id) {
        const index = this.users.findIndex(user => user.id === parseInt(id));
        if (index !== -1) {
            this.users.splice(index, 1);
            this.saveToStorage('users', this.users);
            return true;
        }
        return false;
    }

    generateId(array) {
        return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
    }

    // Фільтрація та пошук
    filterBooks(searchTerm = '', genre = '', year = '') {
        return this.books.filter(book => {
            const matchesSearch = !searchTerm || 
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesGenre = !genre || book.genre === genre;
            
            const matchesYear = !year || (
                year === '2020' ? book.year <= 2020 : book.year == year
            );
            
            return matchesSearch && matchesGenre && matchesYear;
        });
    }
}

// Ініціалізація менеджера
const bookManager = new BookManager();

// DOM-функції
document.addEventListener('DOMContentLoaded', function() {
    // Завантаження головної сторінки
    if (document.getElementById('recent-books')) {
        loadRecentBooks();
    }

    // Завантаження сторінки книг
    if (document.getElementById('booksTable')) {
        loadBooksTable();
        setupFilters();
    }

    // Завантаження сторінки користувачів
    if (document.getElementById('usersTable')) {
        loadUsersTable();
    }

    // Обробка форми створення книги
    const bookCreateForm = document.getElementById('bookCreateForm');
    if (bookCreateForm) {
        bookCreateForm.addEventListener('submit', handleBookCreate);
    }

    // Обробка форми редагування книги
    const bookEditForm = document.getElementById('bookEditForm');
    if (bookEditForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('id');
        if (bookId) {
            loadBookForEdit(bookId);
            bookEditForm.addEventListener('submit', (e) => handleBookEdit(e, bookId));
        }
    }

    // Обробка форми створення користувача
    const userCreateForm = document.getElementById('userCreateForm');
    if (userCreateForm) {
        userCreateForm.addEventListener('submit', handleUserCreate);
    }

    // Обробка форми редагування користувача
    const userEditForm = document.getElementById('userEditForm');
    if (userEditForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        if (userId) {
            loadUserForEdit(userId);
            userEditForm.addEventListener('submit', (e) => handleUserEdit(e, userId));
        }
    }
});

function loadRecentBooks() {
    const container = document.getElementById('recent-books');
    const recentBooks = bookManager.getAllBooks().slice(0, 4);
    
    container.innerHTML = recentBooks.map(book => `
        <div class="col-md-3 mb-4">
            <div class="card book-card h-100">
                <img src="${book.image}" class="card-img-top book-cover" alt="${book.title}">
                <div class="card-body">
                    <h5 class="card-title book-title">${book.title}</h5>
                    <p class="card-text book-author">${book.author}</p>
                    <p class="card-text book-year">${book.year} • ${book.genre}</p>
                    <span class="book-status ${book.status === 'available' ? 'status-available' : 'status-unavailable'}">
                        ${book.status === 'available' ? 'Доступна' : 'На руках'}
                    </span>
                </div>
                <div class="card-footer bg-white">
                    <a href="book-edit.html?id=${book.id}" class="btn btn-sm btn-primary">Редагувати</a>
                    <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})">Видалити</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadBooksTable() {
    const tableBody = document.getElementById('booksTable');
    const booksGrid = document.getElementById('booksGrid');
    const books = bookManager.getAllBooks();
    
    // Оновлення таблиці
    tableBody.innerHTML = books.map(book => `
        <tr class="fade-in">
            <td>${book.id}</td>
            <td>
                <img src="${book.image}" alt="${book.title}" style="width: 50px; height: 75px; object-fit: cover;">
            </td>
            <td><strong>${book.title}</strong></td>
            <td>${book.author}</td>
            <td>${book.year}</td>
            <td><span class="badge bg-secondary">${book.genre}</span></td>
            <td>
                <span class="book-status ${book.status === 'available' ? 'status-available' : 'status-unavailable'}">
                    ${book.status === 'available' ? 'Доступна' : 'На руках'}
                </span>
            </td>
            <td class="table-actions">
                <a href="book-edit.html?id=${book.id}" class="btn btn-sm btn-primary btn-action">
                    <i class="bi bi-pencil"></i>
                </a>
                <button class="btn btn-sm btn-danger btn-action" onclick="showDeleteModal(${book.id}, '${book.title}')">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-sm btn-info btn-action" onclick="toggleBookStatus(${book.id})">
                    <i class="bi bi-arrow-left-right"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Оновлення сітки
    if (booksGrid) {
        booksGrid.innerHTML = books.map(book => `
            <div class="col">
                <div class="card book-card h-100">
                    <img src="${book.image}" class="card-img-top book-cover" alt="${book.title}">
                    <div class="card-body">
                        <h5 class="card-title book-title">${book.title}</h5>
                        <p class="card-text book-author">${book.author}</p>
                        <p class="card-text book-year">${book.year} • ${book.genre}</p>
                        <p class="card-text small">${book.description.substring(0, 100)}...</p>
                    </div>
                    <div class="card-footer bg-white">
                        <div class="d-flex justify-content-between">
                            <span class="book-status ${book.status === 'available' ? 'status-available' : 'status-unavailable'}">
                                ${book.status === 'available' ? 'Доступна' : 'На руках'}
                            </span>
                            <div>
                                <a href="book-edit.html?id=${book.id}" class="btn btn-sm btn-primary">
                                    <i class="bi bi-pencil"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function setupFilters() {
    const searchInput = document.getElementById('searchBooks');
    const genreFilter = document.getElementById('filterGenre');
    const yearFilter = document.getElementById('filterYear');
    
    if (searchInput) {
        searchInput.addEventListener('input', updateBooksDisplay);
    }
    
    if (genreFilter) {
        genreFilter.addEventListener('change', updateBooksDisplay);
    }
    
    if (yearFilter) {
        yearFilter.addEventListener('change', updateBooksDisplay);
    }
}

function updateBooksDisplay() {
    const searchTerm = document.getElementById('searchBooks')?.value || '';
    const genre = document.getElementById('filterGenre')?.value || '';
    const year = document.getElementById('filterYear')?.value || '';
    
    const filteredBooks = bookManager.filterBooks(searchTerm, genre, year);
    updateBooksTable(filteredBooks);
}

function updateBooksTable(books) {
    const tableBody = document.getElementById('booksTable');
    
    tableBody.innerHTML = books.map(book => `
        <tr class="fade-in">
            <td>${book.id}</td>
            <td>
                <img src="${book.image}" alt="${book.title}" style="width: 50px; height: 75px; object-fit: cover;">
            </td>
            <td><strong>${book.title}</strong></td>
            <td>${book.author}</td>
            <td>${book.year}</td>
            <td><span class="badge bg-secondary">${book.genre}</span></td>
            <td>
                <span class="book-status ${book.status === 'available' ? 'status-available' : 'status-unavailable'}">
                    ${book.status === 'available' ? 'Доступна' : 'На руках'}
                </span>
            </td>
            <td class="table-actions">
                <a href="book-edit.html?id=${book.id}" class="btn btn-sm btn-primary btn-action">
                    <i class="bi bi-pencil"></i>
                </a>
                <button class="btn btn-sm btn-danger btn-action" onclick="showDeleteModal(${book.id}, '${book.title}')">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-sm btn-info btn-action" onclick="toggleBookStatus(${book.id})">
                    <i class="bi bi-arrow-left-right"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Глобальні функції для кнопок
let bookToDelete = null;

function showDeleteModal(id, title) {
    bookToDelete = id;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
    
    document.getElementById('confirmDelete').onclick = function() {
        deleteBook(id);
        modal.hide();
    };
}

function deleteBook(id) {
    if (bookManager.deleteBook(id)) {
        loadBooksTable();
        if (document.getElementById('recent-books')) {
            loadRecentBooks();
        }
        showAlert('Книгу успішно видалено!', 'success');
    } else {
        showAlert('Не вдалося видалити книгу', 'error');
    }
}

function toggleBookStatus(id) {
    const book = bookManager.getBookById(id);
    if (book) {
        const newStatus = book.status === 'available' ? 'unavailable' : 'available';
        bookManager.updateBook(id, { status: newStatus });
        loadBooksTable();
        showAlert('Статус книги змінено!', 'success');
    }
}

function handleBookCreate(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        year: parseInt(document.getElementById('year').value),
        genre: document.getElementById('genre').value,
        description: document.getElementById('description').value,
        image: document.getElementById('image').value,
        isbn: document.getElementById('isbn').value,
        status: document.getElementById('status').value
    };
    
    const newBook = bookManager.addBook(formData);
    
    if (newBook) {
        showAlert('Книгу успішно додано!', 'success');
        setTimeout(() => {
            window.location.href = 'books.html';
        }, 1500);
    } else {
        showAlert('Не вдалося додати книгу', 'error');
    }
}

function loadBookForEdit(id) {
    const book = bookManager.getBookById(id);
    if (book) {
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('year').value = book.year;
        document.getElementById('genre').value = book.genre;
        document.getElementById('description').value = book.description;
        document.getElementById('image').value = book.image;
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('status').value = book.status;
    }
}

function handleBookEdit(e, id) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        year: parseInt(document.getElementById('year').value),
        genre: document.getElementById('genre').value,
        description: document.getElementById('description').value,
        image: document.getElementById('image').value,
        isbn: document.getElementById('isbn').value,
        status: document.getElementById('status').value
    };
    
    const updatedBook = bookManager.updateBook(id, formData);
    
    if (updatedBook) {
        showAlert('Книгу успішно оновлено!', 'success');
        setTimeout(() => {
            window.location.href = 'books.html';
        }, 1500);
    } else {
        showAlert('Не вдалося оновити книгу', 'error');
    }
}

// Функції для користувачів
function loadUsersTable() {
    const tableBody = document.getElementById('usersTable');
    const users = bookManager.getAllUsers();
    
    tableBody.innerHTML = users.map(user => `
        <tr class="fade-in">
            <td>${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td><span class="badge ${user.role === 'адміністратор' ? 'bg-danger' : 'bg-primary'}">${user.role}</span></td>
            <td>${user.registrationDate}</td>
            <td><span class="badge ${user.status === 'активний' ? 'bg-success' : 'bg-secondary'}">${user.status}</span></td>
            <td class="table-actions">
                <a href="user-edit.html?id=${user.id}" class="btn btn-sm btn-primary btn-action">
                    <i class="bi bi-pencil"></i>
                </a>
                <button class="btn btn-sm btn-danger btn-action" onclick="deleteUser(${user.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function deleteUser(id) {
    if (confirm('Ви впевнені, що хочете видалити цього користувача?')) {
        if (bookManager.deleteUser(id)) {
            loadUsersTable();
            showAlert('Користувача успішно видалено!', 'success');
        } else {
            showAlert('Не вдалося видалити користувача', 'error');
        }
    }
}

function handleUserCreate(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        role: document.getElementById('role').value,
        status: document.getElementById('status').value
    };
    
    const newUser = bookManager.addUser(formData);
    
    if (newUser) {
        showAlert('Користувача успішно додано!', 'success');
        setTimeout(() => {
            window.location.href = 'users.html';
        }, 1500);
    } else {
        showAlert('Не вдалося додати користувача', 'error');
    }
}

function loadUserForEdit(id) {
    const user = bookManager.getUserById(id);
    if (user) {
        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone;
        document.getElementById('role').value = user.role;
        document.getElementById('status').value = user.status;
    }
}

function handleUserEdit(e, id) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        role: document.getElementById('role').value,
        status: document.getElementById('status').value
    };
    
    const updatedUser = bookManager.updateUser(id, formData);
    
    if (updatedUser) {
        showAlert('Користувача успішно оновлено!', 'success');
        setTimeout(() => {
            window.location.href = 'users.html';
        }, 1500);
    } else {
        showAlert('Не вдалося оновити користувача', 'error');
    }
}

// Допоміжні функції
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}