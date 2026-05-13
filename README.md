# Budget Tracker

A full-stack Personal Finance and Budget Tracking Application built with Spring Boot and React.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Java 17** (or higher)
- **Node.js** (v16 or higher) and **npm**
- **MySQL Server**

## 1. Running Database

The application uses MySQL as its primary database.

1. Ensure your MySQL server is running on the default port (`3306`).
2. The backend is configured to connect with the following credentials by default:
   - **Username:** `root`
   - **Password:** *(empty)*
3. The application will automatically create the database `budget_tracker` if it doesn't exist.
4. *(Optional)* If your MySQL setup uses a different username or password, update the `spring.datasource.username` and `spring.datasource.password` fields in the `backend/src/main/resources/application.properties` file.

## 2. Installing Dependencies

You will need to install dependencies for both the frontend and the backend.

### Backend Dependencies
The backend uses the Maven Wrapper, meaning you do not need to install Maven globally. Dependencies will be automatically downloaded when you run or build the project.
To manually resolve and install dependencies, navigate to the `backend` directory:
```bash
cd backend
./mvnw clean install -DskipTests
```
*(On Windows Command Prompt or PowerShell, use `mvnw.cmd clean install -DskipTests`)*

### Frontend Dependencies
Navigate to the `frontend` directory and install the Node modules using npm:
```bash
cd frontend
npm install
```

## 3. Running Backend

To start the Spring Boot backend server:

1. Open a terminal and navigate to the `backend` directory.
2. Run the application using the Maven wrapper:
   ```bash
   # On Windows
   mvnw.cmd spring-boot:run

   # On macOS/Linux
   ./mvnw spring-boot:run
   ```
3. The backend server will start and expose its REST APIs, typically on `http://localhost:8080`.

## 4. Running Frontend

To start the React frontend development server:

1. Open a new terminal window or tab and navigate to the `frontend` directory.
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your web browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).
