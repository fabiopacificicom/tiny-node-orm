const mysql = require('mysql2');
class Model {

  /**
   * Retrieves all pizzas from the database.
   *
   * @param {object} req - The HTTP request object
   * @param {object} res - The HTTP response object
   */
  static all(req, res) {

    // get the class name from the Class declaration
    this.connection().query(`SELECT * FROM ${this.getTableName()}`, (err, results) => {
      if (err) return res.json({ error: true, message: err });
      //console.log(results);

      const responseData = {
        data: results,
        counter: results.length
      }
      res.status(200).json(responseData)
    })
  }

  /**
     * Retrieves a single pizza from the database by its ID.
     *
     * @param {object} req - The HTTP request object
     * @param {object} res - The HTTP response object
     */
  static show(req, res) {

    this.connection().query(`SELECT * FROM ${this.getTableName()} WHERE id =?`, [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: true, message: err });

      if (results.length == 0) return res.status(404).json({ error: true, message: 'Not found' });


      const responseData = {
        data: results[0],
        counter: results.length
      }

      res.status(200).json(responseData);
    })
  }


  static store(payload, req, res, relationshipModel) {

    // insert the pizza object into the database
    this.connection().query(`INSERT INTO ${this.getTableName()} SET?`, [payload], (err, response) => {
      if (err) return res.status(500).json({ error: true, message: err });


      console.log(response.insertId);
      const related_id = response.insertId

      // get the list of ingredients from the payload
      const relatedEntities = req.body[relationshipModel + 's'];

      console.log(relatedEntities);

      // insert each ingredient into the database if it doesn't exist
      relatedEntities.forEach((entity) => {

        // check if the ingredient does not exist in the db
        this.connection().query(`SELECT * FROM ${relationshipModel} WHERE name =?`, [entity], (err, results) => {
          if (err) return res.status(500).json({ error: true, message: err });
          console.log(results);
          if (results.length == 0) {
            // insert the ingredient into the database
            this.connection().query(`INSERT INTO ${relationshipModel}s SET?`, { name: entity, quantity: 1 }, (err, response) => {
              if (err) return res.status(500).json({ error: true, message: err });

              console.log(response);

              // get the id of the ingredient that was just inserted
              const entity_id = response.insertId;

              // insert the pivot table entry
              updatePivot(table, related_id, entity_id, res)
            })
          } else {

            // insert ingredient into the database
            updatePivot(table, related_id, results[0].id, res)
          }
        })

      })

      // associate each ingredient with the pizza id in the response for the pivot table
      return res.status(201).json({ status: 201, message: 'pizza added successfully' });
    })

  }


  static update(payload, req, res, relationshipModel) {
    // update the pizza object in the database using the given id to find it
    this.connection().query(`UPDATE ${this.getTableName()} SET? WHERE id =?`, [payload, req.params.id], (err, response) => {
      if (err) return res.status(500).json({ error: true, message: err });
      console.log(response);
      if (response.affectedRows == 0) {
        return res.status(404).json({ error: true, message: 'Not found' });
      }

      // now that the pizza was updated we need to verify if its necessary to update also its ingredients list. 
      // - first check if in the request there is the ingredients key 
      const relatedEntities = req.body[relationshipModel];
      if (relatedEntities && relatedEntities.length > 0) {
        // - if the ingredients list is not empty loop over it and for each ingredient: 
        relatedEntities.forEach(entity => {
          // - check if the ingredient exists in the db
          this.connection().query('SELECT * FROM ingredients WHERE name =?', [entity], (err, results) => {
            if (err) return res.status(500).json({ error: true, message: err });
            console.log(results);
            // - if it does not exist insert the ingredient into the database
            if (results.length == 0) {
              this.connection().query(`INSERT INTO ${relationshipModel}s SET?`, { name: entity }, (err, response) => {
                if (err) return res.status(500).json({ error: true, message: err });

                console.log(response);
                // - get the id of the ingredient that was just inserted
                const related_id = response.insertId;
                updatePivot(table, req.params.id, related_id)
              })
            } else {
              // - if it already exists set its key in the pivot table
              updatePivot(table, req.params.id, results[0].id);
            }

          });

        })
      }

      return res.status(200).json({ status: 200, message: 'successfully updated' });
    })
  }


  static destroy(req, res) {

    //res.json(`pizza deleted ${req.params.id}`)
    this.connection().query(`DELETE FROM ${this.getTableName()} WHERE id =?`, [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: true, message: err });
      // return the correct status code after deletion
      return res.json({ status: 204, message: 'record deleted successfully' });

    })
  }


  static getTableName() {
    const className = this.name;

    // get the pluralized version of the class name
    const pluralizedClassName = `${className.toLowerCase()}s`;

    console.log(`Retrieving all ${pluralizedClassName}`);
    // return the pluralized version of the class name
    return pluralizedClassName;
  }


  static connection() {

    return mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT
    });
  }

}

// utilities x pizza_ingredients pivot table
function updatePivot(table, primary_table_id, secondary_table_id, res) {
  this.connection().query(`INSERT INTO ${table} SET?`, {
    primary_id: primary_table_id,
    secondary_id: secondary_table_id
  }, (err, response) => {
    if (err) return res.status(500).json({ error: true, message: err });

    console.log(response);
  })
}

module.exports = Model;