# PawPal

## Project Setup

This document describes step by step how to get the PawPal project running on a new computer.

### 1. Prerequisites

Before you begin, make sure that the following software is installed on your computer:  

- Node.js: Version 18 or newer (Recommended: v20 LTS). Download  
- Docker & Docker Compose: Required for the database. Docker Desktop Download  
- Git: For cloning the repository. Download  
- IDE: A code editor of your choice, WebStorm or VS Code is recommended.  

### 2. Clone & prepare the project

Open a terminal and clone the repository into a folder of your choice:  

``git clone https://github.com/KaMa-0/PawPal``  
``cd PawPal``  

Note: The project consists of two main folders: backend (server & database) and frontend (user interface). We will set up the backend first.  

### 3. Backend Setup (Server & Database)

Open a terminal in the PawPal folder or use the terminal of your IDE.  

#### Step 3.1: Switch to the backend folder and install dependencies  

``cd backend``  
``npm install``  

#### Step 3.2: Create environment variables (.env)  

Create a file named .env in the backend folder and insert the following content:  
````
PORT=3000
JWT_SECRET=dev-secret-key-change-me
DATABASE_URL=postgresql://user:password@localhost:5432/pawpal
````

**Database configuration for Docker**  

````
DB_USER=user
DB_PASSWORD=password
DB_NAME=pawpal
````

**Email configuration (optional for dev)**  

````
EMAIL_USER=
EMAIL_PASSWORD=
FRONTEND_URL=http://localhost:8080
````

#### Step 3.3: Start the database (Docker)  

Make sure Docker Desktop is running. Then start the database container:  

``docker-compose up -d ``  

Tip: The command ``docker ps`` shows you whether the container ``pawpal_db`` 
is running.  

#### Step 3.4: Initialize database schema (Prisma)  

To ensure the database has the correct tables, we need to run the migrations:  

``npx prisma migrate dev``  

This command creates the tables in the PostgreSQL database based on the schema file.  

#### Step 3.5: Start the backend  

Start the server in development mode:  

``npm run dev``  

If everything works, you should see output like: Server is running on port 3000  

### Frontend Setup (React App)  

Open a new terminal window (the backend must keep running) and switch to the PawPal project folder.  

#### Step 4.1: Switch to the frontend folder and install dependencies  

``cd frontend``  
``npm install``  

#### Step 4.2: Create environment variables (.env)   

Create a file named .env in the frontend folder and insert the following content:  

````
VITE_API_BASE_URL=http://localhost:3000
````

#### Step 4.3: Start the frontend

Start the React application:  

``npm run dev``  

The console should indicate that the app is running, usually at: http://localhost:8080  

**Verification**: Is everything running?  

- Open your browser and go to http://localhost:8080  

- You should see the start page or login page of PawPal.  

- Try to register or log in.  

- If that works, the database and backend are correctly connected.  

- Check the backend console: You should see logs for the requests there (e.g. 
``POST /auth/register``).  

**Success**: Congratulations! You have successfully set up the PawPal project.  

### Summary of commands for daily startup  

When you work on the project next time:  
- Ensure Docker: Must be running.  
- Start backend:  
  ``cd backend && npm run dev``  
- Start frontend:  
  ``cd frontend && npm run dev``  
