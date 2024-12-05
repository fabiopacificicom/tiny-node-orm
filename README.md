# Tiny Node ORM

This is a small and lightweight ORM for node.js. It is designed to be used with Express.js.

## Installation

Clone the repository inside your project folder:

```bash
git clone https://github.com/pacificdev/tiny-node-orm.git
```

## Usage

The cloned repository includes one folder called `models`. This is where you will put all your models. Inside this folder you will find one file called `Model`, this is the default models that your Models will extend.
it is responsible to connect to the database and provide methods to interact with a given table.

Each model is mapped to a corresponding db folder. Models should be named singularly while tables plurally.

To connect to the database use the provided variable names that you can find inside the .env.example file and add them to your .env file.

You need to define the following:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_DATABASE=blog
DB_PORT=3306
```

### Model

A model is a class that extends the default Model class. It has the following methods

- all() - returns an array of all the objects in the database
- show() - returns one object from the database
- store() - stores an object into the database
- update() - updates an existing object in the database
- destroy() - destroys a single object from the database

### Define your models

Each model should be defined in its own file. And extend the default Model class.

```js
const Model = require('./Model');

class Post extends Model {

}

module.exports = Post;
```

Since it hinerites from the Model class, you can use all the methods that are available to it.

### Relationships

The library also supports relationships between models.
To inform about a relationship between two models when you call your model's store method pass a string with the name of the related model like so:

```js

const store = (req, res) => {
  const pizza = {

    name: req.body.name,
    description: req.body.description,
    is_available: req.body.is_available,
    price: req.body.price,
    image: req.body.image,
  }

  Pizza.store(pizza, req, res, 'ingredient')

}
```

At the time of writing only the following methods accepts relationships:

- store()
- update()

```js
const update = (req, res) => {

  const payload = {
    title: req.body.name,
    body: req.body.image,
   
  }

  Post.update(payload, req, res, 'category') 
}
```

> Know bugs:
rightnow the pluralization doesn't work well, it just add an 's' at the end of the passed model name, so for the category model it will look for a table called `categoryz` instead of `categories`. We will switch to singular names in the near future.
