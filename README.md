# req2query Package
* * *
Lightweight Express.js middleware that can convert query parameters into sequlize query


## Installation
This is a Express.js middleware available through [**Cognitev**](https://github.com/cognitev) .

Installation is done using the **npm install command :**

```
$ npm install github:cognitev/req2query#production
```

## Usage
* * *
* define your models attributes, put all models attributes in one object like the object below. 
```javascript
module.exports = {
 salary: {
  type: Number,
  model: employees
 },
 hiring_date: {
  type: Number,
  model: employees
 },
 location: {
  type: String,
  model: locations
 }
 ...
}
```

* req2query package work with different types of query parameter: 
  * Number
  * String
  * Date
  * Boolean  
  * Array of any type
  
*  req2query package support some of operators that you will need to enhance your filtration such as `gt` , `gte` , `lt` , `lte` <br/><br/>
To use `gte` operator just add '__gte' to query parameter like `hiring_date__gte`. 

**For example** 
```
/employees?salary__gte=500&salary__lte=1000&hiring_date__gte='2020-01-01'&location='canada'&location='london'
```
Sequelize object will be something like this : 
```javascript
{
 employees: {
  where: {
   salary: {
    [Op.gte]: 500,
    [Op.lte]: 1000
   },
   hiring_date: {
    [Op.gte]: '2020-01-01'
   }
  }
  locations: {
   where: {
    location: {
     [Op.in]: ['canada','london']
    }
   }
  }
 }
}
``` 
**So you can destruct employees.where, locations.where object and use them with sequelize**. 

## API
require generator middleware from req2query
```javascript
// generator middleware generate sequelize query object from query parameters and models attributes.
const { generator } = require('req2query');
```

require model attributes you defnied, and use it as shown blew.

```javascript
// get model
const modelAttr = require('/model-attributes')

app.use('/foo', generator(modelAttr),(req, res) => {
 //generator middleware will add sequelizeQuery object to req object
 console.log('sequelize query', req.sequelizeQuery);
});
```

