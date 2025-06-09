# 🏥 Health Monitoring System

A full-stack Health Monitoring System built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. This system enables tracking and managing user health metrics such as heart rate, blood pressure, glucose levels, and more in a secure and scalable environment.

## 🚀 Features

- 🔐 User authentication and authorization (JWT-based)
- 📈 Real-time health data monitoring
- 📊 Dashboards for visualizing health trends
- 🧾 Patient and record management
- 📡 RESTful API for health data submission and retrieval
- 🌐 Responsive front-end with React.js
- 🧪 Unit testing and code coverage ready

## 📁 Project Structure

```
Health-System/
├── client/                # React frontend
├── server/                # Express backend
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   └── controllers/       # Route logic
├── .env                   # Environment variables
├── package.json           # Project metadata
└── README.md              # Project documentation
```

## 🛠️ Tech Stack

- **Frontend**: React, Axios, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (NoSQL), Mongoose ORM
- **Security**: JWT, bcryptjs, CORS
- **Testing**: Jest, Supertest
- **DevOps Ready**: Docker, SonarQube integration possible

## 📦 Installation

### Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)
- (Optional) Docker

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/sp417/Health-System.git
cd Health-System
```

2. **Backend Setup**
```bash
cd server
npm install
cp .env.example .env   # Update environment variables
npm start
```

3. **Frontend Setup**
```bash
cd ../client
npm install
npm start
```

## ⚙️ Environment Variables

In the `server` directory, create a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/healthdb
JWT_SECRET=your_jwt_secret
```

## 📬 API Endpoints

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | /api/users           | Get all users                |
| POST   | /api/auth/register   | Register new user            |
| POST   | /api/auth/login      | Authenticate user            |
| POST   | /api/records         | Add health record (auth)     |
| GET    | /api/records/:id     | Get record by ID (auth)      |

More detailed documentation available via Swagger/Postman (TBD).

## 🧪 Running Tests

```bash
npm test -- --coverage
```

## 🐳 Docker

To run using Docker:
```bash
docker-compose up --build
```

## 🛡️ Security

- Passwords are hashed using `bcryptjs`
- JWT-based secure routes
- CORS enabled for cross-origin requests

## 📌 Future Improvements

- Add role-based access control (admin, doctor, patient)
- Add mobile responsiveness
- Integrate external APIs (e.g., wearable device data)
- Add unit and integration test coverage
- CI/CD pipeline with SonarQube quality gate

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
