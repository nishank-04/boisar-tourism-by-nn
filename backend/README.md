# Boisar Tourism Backend API

A comprehensive Node.js/Express backend API for the Boisar Eco & Cultural Tourism Platform.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with role-based access
- **Destination Management** - CRUD operations for tourist destinations
- **Booking System** - Complete booking and reservation management
- **Trip Planning** - AI-powered itinerary generation and trip management
- **Admin Dashboard** - Comprehensive admin panel with analytics
- **Contact Management** - Customer inquiry and support system
- **Email Services** - Automated email notifications and confirmations

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user
- `PUT /profile` - Update user profile
- `PUT /password` - Update password
- `POST /forgot-password` - Forgot password
- `PUT /reset-password` - Reset password
- `GET /verify-email/:token` - Verify email
- `POST /resend-verification` - Resend verification email

#### Destinations (`/api/destinations`)
- `GET /` - Get all destinations
- `GET /search` - Search destinations
- `GET /featured` - Get featured destinations
- `GET /region/:region` - Get destinations by region
- `GET /:id` - Get single destination
- `POST /:id/reviews` - Add review
- `GET /:id/reviews` - Get reviews
- `POST /` - Create destination (Admin)
- `PUT /:id` - Update destination (Admin)
- `DELETE /:id` - Delete destination (Admin)

#### Bookings (`/api/bookings`)
- `GET /` - Get user bookings
- `GET /statistics` - Get booking statistics (Admin)
- `GET /confirmation/:code` - Get booking by confirmation code
- `GET /:id` - Get single booking
- `POST /` - Create booking
- `PUT /:id` - Update booking
- `PUT /:id/cancel` - Cancel booking

#### Trips (`/api/trips`)
- `GET /` - Get user trips
- `GET /recommendations` - Get trip recommendations
- `POST /generate-itinerary` - Generate itinerary
- `GET /:id` - Get single trip
- `POST /` - Create trip
- `PUT /:id` - Update trip
- `DELETE /:id` - Delete trip
- `POST /:id/share` - Share trip

#### Users (`/api/users`)
- `GET /` - Get all users (Admin)
- `GET /stats` - Get user statistics
- `GET /bookings` - Get user bookings
- `GET /trips` - Get user trips
- `GET /:id` - Get single user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (Admin)

#### Admin (`/api/admin`)
- `GET /dashboard` - Get dashboard statistics
- `GET /health` - Get system health
- `GET /users` - Get all users
- `GET /destinations` - Get all destinations
- `GET /bookings` - Get all bookings
- `GET /trips` - Get all trips
- `GET /revenue` - Get revenue statistics
- `GET /popular-destinations` - Get popular destinations
- `GET /recent-bookings` - Get recent bookings
- `PUT /users/:id/status` - Update user status
- `PUT /destinations/:id/status` - Update destination status

#### Contact (`/api/contact`)
- `POST /` - Send contact message
- `GET /` - Get all messages (Admin)
- `PUT /:id` - Update message (Admin)
- `DELETE /:id` - Delete message (Admin)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd jharkhand-tourism/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp config.env.example config.env
   ```
   Edit `config.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/jharkhand_tourism
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   # ... other environment variables
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Seed the database** (Optional)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📊 Database Models

### User
- Personal information and preferences
- Authentication and authorization
- Profile management

### Destination
- Tourist destinations and attractions
- Activities and facilities
- Reviews and ratings
- Pricing and timings

### Booking
- Reservation management
- Payment processing
- Cancellation handling
- Confirmation system

### Trip
- Trip planning and itineraries
- User preferences
- Cost estimation
- Sharing capabilities

### Contact
- Customer inquiries
- Support ticket management
- Admin response system

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to get a token
2. **Include token** in Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## 📝 API Documentation

### Request/Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### Pagination
Most list endpoints support pagination:
```
GET /api/destinations?page=1&limit=10&sortBy=name&sortOrder=asc
```

### Filtering
Many endpoints support filtering:
```
GET /api/destinations?type=eco-tourism&region=south&minRating=4.0
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:

- `NODE_ENV=production`
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong secret key for JWT
- `EMAIL_*` - Email service configuration
- `CLOUDINARY_*` - Image storage configuration
- `STRIPE_*` - Payment processing configuration

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB
- [ ] Set up email service
- [ ] Configure image storage
- [ ] Set up payment processing
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backup strategy

## 📈 Performance

### Optimization Features
- **Database Indexing** - Optimized queries with proper indexes
- **Caching** - Redis caching for frequently accessed data
- **Rate Limiting** - API rate limiting to prevent abuse
- **Compression** - Gzip compression for responses
- **Pagination** - Efficient pagination for large datasets

### Monitoring
- Health check endpoint: `GET /api/health`
- System metrics and performance monitoring
- Error tracking and logging

## 🔧 Development

### Code Structure
```
backend/
├── controllers/     # Route controllers
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── utils/          # Utility functions
├── scripts/        # Database scripts
└── server.js       # Main server file
```

### Adding New Features
1. Create model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Add middleware if needed
5. Update documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: support@jharkhandtourism.com
- Documentation: [API Docs](https://api.jharkhandtourism.com/docs)
- Issues: [GitHub Issues](https://github.com/jharkhand-tourism/backend/issues)
