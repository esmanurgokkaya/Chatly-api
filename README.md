# Chatly API

Real-time chat application backend built with Node.js, Express, and Socket.IO.

## Features

-  User authentication
-  Real-time messaging
-  Image sharing support (up to 5MB)
-  Contact list management
-  Online status tracking
-  WebSocket support for instant updates

## Tech Stack

- Node.js & Express
- MongoDB & Mongoose
- Socket.IO
- Cloudinary (image storage)
- JWT Authentication
- Arcjet (rate limiting)
- Resend (email services)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Cloudinary account
- Resend account

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RESEND_API_KEY=your_resend_api_key
ARCJET_API_KEY=your_arcjet_api_key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/esmanurgokkaya/Chatly-api.git
```

2. Install dependencies:
```bash
cd Chatly-api
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Messages
- `GET /api/messages/contacts` - Get all contacts
- `GET /api/messages/chats` - Get users you've chatted with
- `GET /api/messages/:id` - Get messages with specific user
- `POST /api/messages/send/:id` - Send message to user

## WebSocket Events

### Server -> Client
- `connected` - Connection successful
- `onlineUsers` - List of online users
- `newMessage` - New message received

### Client -> Server
- `connection` - Initial connection
- `disconnect` - User disconnection

## Security Features

- JWT authentication
- Rate limiting with Arcjet
- Image size validation
- Secure WebSocket connections
- Input validation and sanitization

## License

MIT

## Author

Esma - [GitHub](https://github.com/esmanurgokkaya)