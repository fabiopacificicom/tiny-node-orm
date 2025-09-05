# Tiny Node ORM

A simple and lightweight Object-Relational Mapping (ORM) library for Node.js applications. Designed to work seamlessly with Express.js and MySQL databases, providing basic CRUD operations and relationship management with minimal setup.

## Features

- **Lightweight**: Minimal dependencies and simple architecture
- **CRUD Operations**: Create, Read, Update, Delete operations for database entities
- **Relationships**: Support for model relationships with pivot tables
- **Express.js Integration**: Designed to work directly with Express.js request/response objects
- **MySQL Support**: Built specifically for MySQL databases using mysql2 driver

## Prerequisites

- Node.js (version 12 or higher)
- MySQL database server
- Express.js application (for web integration)

## Installation

1. Clone the repository inside your project folder:

```bash
git clone git@github.com:fabiopacificicom/tiny-node-orm.git
```

2. Install the necessary dependencies:

```bash
npm install express mysql2 dotenv
```

3. Set up your environment variables by copying the example file:

```bash
cp .env.example .env
```

4. Configure your database connection in the `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_DATABASE=blog
DB_PORT=3306
```

## Database Setup

Before using the ORM, ensure your MySQL database is set up with the appropriate tables. Each model corresponds to a database table following these naming conventions:

- **Models**: Named singularly (e.g., `Post`, `Category`, `User`)
- **Tables**: Named plurally (e.g., `posts`, `categories`, `users`)

Example database schema:

```sql
-- Create your database
CREATE DATABASE blog;
USE blog;

-- Example table for Post model
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Example table for Category model
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example pivot table for relationships
CREATE TABLE post_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    primary_id INT,
    secondary_id INT,
    FOREIGN KEY (primary_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (secondary_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

## Usage

The cloned repository includes a `Models` folder where you will put all your models. Inside this folder you will find the `Model.js` file, which is the base class that your custom models will extend. It handles database connections and provides methods to interact with database tables.

Each model is mapped to a corresponding database table. Models should be named singularly while tables should be named plurally (e.g., `Post` model maps to `posts` table).

### Creating Your First Model

1. Create a new model file in the `Models` directory
2. Extend the base `Model` class
3. Export your model class

Example model (`Models/Post.js`):

```js
const Model = require('./Model');

class Post extends Model {
    // Your custom methods can be added here
    // The base CRUD methods are inherited from Model
}

module.exports = Post;
```

### Model Methods

The base `Model` class provides the following methods that work with Express.js request/response objects:

#### `all(req, res)`
Retrieves all records from the model's table.

- **Parameters**: 
  - `req`: Express request object
  - `res`: Express response object
- **Returns**: JSON response with data array and counter
- **Example Response**:
```json
{
    "data": [
        {"id": 1, "title": "First Post", "content": "Hello World"},
        {"id": 2, "title": "Second Post", "content": "Another post"}
    ],
    "counter": 2
}
```

#### `show(req, res)`
Retrieves a single record by ID from route parameters.

- **Parameters**: 
  - `req`: Express request object (expects `req.params.id`)
  - `res`: Express response object
- **Returns**: JSON response with single data object
- **Example Response**:
```json
{
    "data": {"id": 1, "title": "First Post", "content": "Hello World"},
    "counter": 1
}
```

#### `store(payload, req, res, relationshipModel)`
Creates a new record in the database.

- **Parameters**: 
  - `payload`: Object containing the data to store
  - `req`: Express request object
  - `res`: Express response object
  - `relationshipModel`: (Optional) String name of related model for relationships
- **Returns**: JSON response confirming creation
- **Example**:
```js
const payload = {
    title: "New Post",
    content: "This is a new post"
};
Post.store(payload, req, res);
```

#### `update(payload, req, res, relationshipModel)`
Updates an existing record by ID from route parameters.

- **Parameters**: 
  - `payload`: Object containing the data to update
  - `req`: Express request object (expects `req.params.id`)
  - `res`: Express response object
  - `relationshipModel`: (Optional) String name of related model for relationships
- **Returns**: JSON response confirming update

#### `destroy(req, res)`
Deletes a record by ID from route parameters.

- **Parameters**: 
  - `req`: Express request object (expects `req.params.id`)
  - `res`: Express response object
- **Returns**: JSON response confirming deletion

## Express.js Integration Example

Here's a complete example of how to use Tiny Node ORM with Express.js:

```js
// app.js
require('dotenv').config();
const express = require('express');
const Post = require('./Models/Post');
const Category = require('./Models/Category');

const app = express();
app.use(express.json());

// Get all posts
app.get('/posts', (req, res) => {
    Post.all(req, res);
});

// Get single post
app.get('/posts/:id', (req, res) => {
    Post.show(req, res);
});

// Create new post
app.post('/posts', (req, res) => {
    const payload = {
        title: req.body.title,
        content: req.body.content
    };
    Post.store(payload, req, res);
});

// Update post
app.put('/posts/:id', (req, res) => {
    const payload = {
        title: req.body.title,
        content: req.body.content
    };
    Post.update(payload, req, res);
});

// Delete post
app.delete('/posts/:id', (req, res) => {
    Post.destroy(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Relationships

The library supports relationships between models through pivot tables. This is useful for many-to-many relationships like posts and categories, or products and ingredients.

### Setting Up Relationships

To use relationships, pass the name of the related model as the fourth parameter to `store()` or `update()` methods:

```js
// Creating a post with categories
app.post('/posts', (req, res) => {
    const payload = {
        title: req.body.title,
        content: req.body.content
    };
    
    // The request body should include an array named after the relationship
    // For 'category' relationship, include 'categorys' array
    // req.body.categorys = ['Technology', 'Programming', 'Web Development'];
    
    Post.store(payload, req, res, 'category');
});

// Updating a post with new categories
app.put('/posts/:id', (req, res) => {
    const payload = {
        title: req.body.title,
        content: req.body.content
    };
    
    Post.update(payload, req, res, 'category');
});
```

### Relationship Data Format

When using relationships, include the related entities as an array in the request body. The array should be named as the plural form of the relationship model:

```json
{
    "title": "My New Post",
    "content": "This is the post content",
    "categorys": ["Technology", "Programming", "Tutorial"]
}
```

### Methods Supporting Relationships

Currently, only the following methods accept relationships:

- `store(payload, req, res, relationshipModel)`
- `update(payload, req, res, relationshipModel)`

### Known Issues with Relationships

⚠️ **Pluralization Bug**: The current pluralization system simply adds an 's' to the end of the model name. This means:
- `category` becomes `categorys` instead of `categories`
- `company` becomes `companys` instead of `companies`

We plan to switch to singular names in a future version to resolve this issue.

## Best Practices

### 1. Environment Variables
Always use environment variables for database configuration and never commit sensitive information to your repository:

```bash
# .env file
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_secure_password
DB_DATABASE=your_database_name
DB_PORT=3306
```

### 2. Error Handling
The ORM automatically handles basic database errors, but you should implement additional error handling in your Express.js routes:

```js
app.get('/posts/:id', async (req, res) => {
    try {
        // Validate the ID parameter
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: true, message: 'Invalid ID parameter' });
        }
        
        Post.show(req, res);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
});
```

### 3. Database Connection Management
The ORM creates a new connection for each query. For production applications, consider implementing connection pooling:

```js
// In Models/Model.js, you might want to modify the connection method
static connection() {
    if (!this.pool) {
        this.pool = mysql.createPool({
            connectionLimit: 10,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT
        });
    }
    return this.pool;
}
```

### 4. Model Organization
Keep your models organized and follow consistent naming conventions:

```
Models/
├── Model.js          (Base class)
├── User.js           (User model)
├── Post.js           (Post model)
├── Category.js       (Category model)
└── Comment.js        (Comment model)
```

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
- Ensure MySQL server is running
- Verify database credentials in your `.env` file
- Check that the database exists

**2. Table Not Found Errors**
```
Error: Table 'database.posts' doesn't exist
```
- Ensure your database tables exist
- Verify table names follow the plural naming convention
- Check that your model class name matches the expected table name

**3. Environment Variables Not Loaded**
```
Error: connect ECONNREFUSED undefined:undefined
```
- Make sure you have `require('dotenv').config()` at the top of your main file
- Verify your `.env` file is in the project root
- Check that your `.env` file contains all required variables

**4. Relationship Issues**
- Remember that relationship arrays should use the pluralized form (with 's')
- Ensure pivot tables exist with the correct structure
- Verify foreign key relationships are properly set up

### Debugging Tips

1. **Enable MySQL Query Logging**: Add logging to see executed queries
2. **Check Console Output**: The ORM logs various information to the console
3. **Verify Request Data**: Use `console.log(req.body)` to inspect incoming data
4. **Test Database Connection**: Create a simple test script to verify connectivity

## Limitations

- **Simple Pluralization**: Only adds 's' to model names for table names
- **Basic Relationships**: Only supports simple many-to-many through pivot tables
- **No Query Builder**: Limited to basic CRUD operations
- **MySQL Only**: Currently only supports MySQL databases
- **Express.js Dependent**: Designed specifically for Express.js applications

## Roadmap

Future improvements planned:
- [ ] Better pluralization system
- [ ] Support for other database types (PostgreSQL, SQLite)
- [ ] Query builder functionality
- [ ] Advanced relationship types (one-to-many, one-to-one)
- [ ] Migration system
- [ ] Validation system
- [ ] Connection pooling by default

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/fabiopacificicom/tiny-node-orm/issues) page
2. Create a new issue with detailed information about your problem
3. Include your environment details (Node.js version, MySQL version, etc.)

---

**Note**: This is a lightweight ORM designed for simple use cases. For more complex applications, consider using more robust ORMs like Sequelize, TypeORM, or Prisma.
