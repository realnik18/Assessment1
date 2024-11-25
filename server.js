const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

// Add CORS middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
}));

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://admin:MDX2025@twitterclonecluster.b826976.mongodb.net/webstore';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Lesson Schema
const lessonSchema = new mongoose.Schema({
    topic: String,
    location: String,
    price: Number,
    space: Number
});

// Order Schema
const orderSchema = new mongoose.Schema({
    name: String,
    phone: String,
    lessons: [{
        topic: String,
        location: String,
        price: Number
    }]
});

// Models
const Lesson = mongoose.model('Lesson', lessonSchema);
const Order = mongoose.model('Order', orderSchema);

// Routes
app.get('/lessons', async (req, res) => {
    try {
        const lessons = await Lesson.find();
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/orders', async (req, res) => {
    console.log('Received order request:', req.body);
    
    try {
        // Create and save the order
        const order = new Order({
            name: req.body.name,
            phone: req.body.phone,
            lessons: req.body.lessons
        });

        const savedOrder = await order.save();
        console.log('Order Added Successfully!');

        // Update spaces for each lesson
        for (let lesson of req.body.lessons) {
            await Lesson.findOneAndUpdate(
                { subject: lesson.subject },
                { $inc: { space: -1 } }
            );
            console.log('Space Updated Successfully!');
        }

        res.status(201).json({
            success: true,
            message: 'Order saved successfully',
            order: savedOrder
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
