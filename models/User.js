const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Ім\'я є обов\'язковим'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Прізвище є обов\'язковим'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email є обов\'язковим'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Будь ласка, введіть дійсний email']
    },
    password: {
        type: String,
        required: [true, 'Пароль є обов\'язковим'],
        minlength: [6, 'Пароль повинен містити принаймні 6 символів']
    },
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s\-\(\)]+$/, 'Будь ласка, введіть дійсний номер телефону']
    },
    role: {
        type: String,
        enum: ['reader', 'librarian', 'admin'],
        default: 'reader'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    borrowedBooks: [{
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        borrowDate: Date,
        dueDate: Date,
        returned: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

// Хешування пароля перед збереженням
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Метод для перевірки пароля
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Метод для отримання повного імені
userSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

// Віртуальне поле для відображення ролі
userSchema.virtual('roleDisplay').get(function() {
    const roleMap = {
        'reader': 'Читач',
        'librarian': 'Бібліотекар',
        'admin': 'Адміністратор'
    };
    return roleMap[this.role] || this.role;
});

// Віртуальне поле для відображення статусу
userSchema.virtual('statusDisplay').get(function() {
    const statusMap = {
        'active': 'Активний',
        'inactive': 'Неактивний',
        'suspended': 'Заблокований'
    };
    return statusMap[this.status] || this.status;
});

module.exports = mongoose.model('User', userSchema);