# Express Mongoose API Project

This project is an example of an Express.js API using Mongoose for MongoDB interactions. It provides endpoints for user authentication and managing containers.

## Project Structure

The project has the following structure:

- **middleware/fetchUser.ts**: Middleware for fetching user information from the JWT token.
- **model/Container.ts**: Defines the schema for the Container model.
- **model/User.ts**: Defines the schema for the User model.
- **routes/auth.ts**: Contains routes for user authentication (signup, login, and authentication).
- **routes/container.ts**: Contains routes for managing containers (creating, reading, updating, and deleting).
- **db.ts**: Module for connecting to the MongoDB database.
- **index.ts**: Main entry point of the application, sets up Express server and routes.

## Components

### Middleware

#### fetchUser.ts

This middleware is responsible for extracting user information from the JWT token in the request header. It verifies the token and sets the user ID in the request header for further processing.

### Models

#### Container.ts

Defines the schema for the Container model. Each container is associated with a user ID and a creation date.

#### User.ts

Defines the schema for the User model. Each user is identified by an email and a hashed password.

### Routes

#### auth.ts

Contains routes for user authentication:

- **POST /api/auth/signup**: Creates a new user account.
- **POST /api/auth/login**: Logs in an existing user.
- **POST /api/auth/**: Authenticates a user based on the JWT token.

#### container.ts

Contains routes for managing containers:

- **POST /api/container/new**: Creates a new container.
- **GET /api/container/id/:id**: Retrieves details of a specific container.
- **DELETE /api/container/id/:id**: Deletes a container.
- **GET /api/container/list**: Retrieves a list of all containers associated with the authenticated user.

### Database

#### db.ts

Module for connecting to the MongoDB database. It reads connection details from the `.env` file and establishes a connection.

## Environment Variables
1. **Environment Variables:**
   ```bash
   MONGO_DB_URI: mongodb://localhost:27017
   JWT_SECRET: Secret key for JWT token encryption.
   ssh_username: SSH username of local server.
   ssh_password: SSH password of local server.
   ssh_hostname: Hostname of the local SSH server.

## Setup

1. Create a `.env` file in the root directory with the required environment variables.
2. Run `npm install` to install dependencies.
3. Run `tsc` to compile TypeScript files to JavaScript.
4. Run `docker run -d -p 27017:27017 mongo` to start a MongoDB container.
5. Run `npm dist/` to start the Express server.

