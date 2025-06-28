require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./src/config/database');
const initDatabase = require('./src/config/init-db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now, restrict in production
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const dataRoutes = require('./src/api/routes/data.routes');
const authRoutes = require('./src/api/routes/auth.routes');

// Use routes
app.use('/api/dashboard', dataRoutes);
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('ECO-CORE Backend is running!');
});

const initializeSocket = require('./src/sockets');

// ... (existing code) ...

// Socket.IO connection handling
initializeSocket(io);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database tables
    await initDatabase();
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Test database connection
    db.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Database connection test failed:', err.stack);
      } else {
        console.log('Database connected successfully at:', res.rows[0].now);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
