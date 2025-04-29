# Form Builder App

## Overview
The Form Builder App is a web application that allows administrators to create and manage forms, while users can log in to fill out those forms. The application is built using Node.js, Express.js, and MongoDB, providing a robust backend for handling data and user interactions.

## Features
- Admin login to create and manage forms.
- User login to fill out forms created by admins.
- Dynamic form generation based on admin input.
- User-friendly dashboards for both admins and users.

## Technologies Used
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

## Project Structure
```
form-builder-app
├── src
│   ├── app.js
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   ├── adminController.js
│   │   └── userController.js
│   ├── models
│   │   ├── formModel.js
│   │   └── userModel.js
│   ├── routes
│   │   ├── adminRoutes.js
│   │   └── userRoutes.js
│   ├── views
│   │   ├── admin
│   │   │   ├── createForm.html
│   │   │   └── dashboard.html
│   │   ├── user
│   │   │   ├── fillForm.html
│   │   │   └── dashboard.html
│   │   └── partials
│   │       ├── header.html
│   │       └── footer.html
│   ├── public
│       ├── css
│       │   └── styles.css
│       ├── js
│       │   └── scripts.js
│       └── images
├── package.json
├── .env
└── README.md
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd form-builder-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Set up your MongoDB database and update the connection string in the `.env` file.
5. Start the application:
   ```
   npm start
   ```
6. Access the application in your web browser at `http://localhost:3000`.

## Usage
- Admins can log in to create and manage forms through the admin dashboard.
- Users can log in to view and fill out available forms.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.