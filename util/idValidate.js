const ObjectID = require('mongodb').ObjectID


module.exports = function validateID (id){

    console.log(ObjectID.isValid(id))
    if(!ObjectID.isValid(id))
    {
      console.log("firax")
      const errors = new Error("invalid id");
      errors.code = 400;
      throw errors;
    }
  
  };