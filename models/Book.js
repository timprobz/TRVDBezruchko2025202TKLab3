const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Назва книги є обов\'язковою'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Автор є обов\'язковим'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Рік видання є обов\'язковим'],
        min: [1000, 'Рік повинен бути більше 1000'],
        max: [new Date().getFullYear(), 'Рік не може бути більшим за поточний']
    },
    genre: {
        type: String,
        required: [true, 'Жанр є обов\'язковим'],
        enum: [
            'трилер',
            'фантастика',
            'історичний',
            'драма',
            'класика',
            'роман',
            'поезія',
            'детектив',
            'біографія',
            'наукова'
        ]
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    isbn: {
        type: String,
        unique: true,
        trim: true,
        match: [/^(?:\d{10}|\d{13})$/, 'ISBN повинен містити 10 або 13 цифр']
    },
    status: {
        type: String,
        enum: ['available', 'borrowed', 'reserved', 'maintenance'],
        default: 'available'
    },
    copies: {
        type: Number,
        default: 1,
        min: [0, 'Кількість копій не може бути від\'ємною']
    },
    availableCopies: {
        type: Number,
        default: 1,
        min: [0, 'Доступні копії не можуть бути від\'ємними']
    },
    publisher: {
        type: String,
        trim: true
    },
    pages: {
        type: Number,
        min: [1, 'Кількість сторінок повинна бути більше 0']
    },
    language: {
        type: String,
        default: 'українська'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    borrowedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
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

// Віртуальне поле для відображення статусу
bookSchema.virtual('statusDisplay').get(function() {
    const statusMap = {
        'available': 'Доступна',
        'borrowed': 'На руках',
        'reserved': 'Зарезервована',
        'maintenance': 'На ремонті'
    };
    return statusMap[this.status] || this.status;
});

// Метод для перевірки доступності
bookSchema.methods.isAvailable = function() {
    return this.availableCopies > 0 && this.status === 'available';
};

// Middleware для оновлення availableCopies
bookSchema.pre('save', function(next) {
    if (this.isModified('copies') || this.isModified('borrowedBy')) {
        const borrowedCount = this.borrowedBy.filter(loan => !loan.returned).length;
        this.availableCopies = Math.max(0, this.copies - borrowedCount);
        
        if (this.availableCopies === 0) {
            this.status = 'borrowed';
        } else if (this.status === 'borrowed' && this.availableCopies > 0) {
            this.status = 'available';
        }
    }
    next();
});

// Індекс для пошуку
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

module.exports = mongoose.model('Book', userSchema);