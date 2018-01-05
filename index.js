const mongoose = require('mongoose');

module.exports = function(schema, modelToUpdate, keyMap, propertyMap, errorHandler) {
  const updateObjectKey = `${modelToUpdate}UpdateObjectForMongoosePropertySync`;

  // Pre-save hook checks for modification and constructs update object
  schema.pre('save', function(next) {
    // Context is instance of model
    this[updateObjectKey] = {};

    // For each property in options,
    // if modified, add target-property/value pair to update object
    Object.keys(propertyMap).forEach(property => {
      const targetProperty = propertyMap[property];
      if (this.isModified(property)) this[updateObjectKey][targetProperty] = this[property];
    });

    next();
  });

  schema.post('save', function() {
    if (Object.keys(this[updateObjectKey]).length == 0) return;

    const findObject = {};

    Object.keys(keyMap).forEach(key => {
      const foreignKey = keyMap[key];

      findObject[foreignKey] = this[key];
    });

    mongoose.model(modelToUpdate).update(
      findObject,
      {$set: this[updateObjectKey]},
      {multi: true}
    ).catch(err => errorHandler && errorHandler(err));
  });

}
