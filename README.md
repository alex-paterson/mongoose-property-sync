# mongoose-property-sync

Work in progress

Performant MongoDB schema design often encourages redundant data. This package adds hooks to your model that keep attributes from two collections in sync.

## Caveats

- A pre-save and post-save hook are added. I suggest running `sync` last in your schema definition after all of your other custom hooks are added.

- There's probably unexpected behaviour targeting sub-collections.

## Usage

```javascript
const mongoose = require('mongoose'),
      sync = require('mongoose-property-sync');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;


// define User schema

const userSchema = new Schema({
  name: { type: String },
  email: { type: String },
});


// define Post schema

const postSchema = new Schema({
  user: {
    id: { type: ObjectId, required: true },
    name: { type: String },
    email: { type: String },
  },
});

const Post = mongoose.model('post', postSchema);


// add mongoose-property-sync

sync(
  userSchema, // model to add hooks to (updates occur when users are saved)
  'post', // model to update (post properties get updated with values from a user)
  { _id: 'user.id' }, // foreign key mapping (update posts where post['user.id'] == user['_id'])
  {
    name: 'user.name', // property mapping (post['user.name'] is set to user['name'])
    email: 'user.email', // property mapping (post['user.email'] is set to user['email'])
  }
)

const User = mongoose.model('user', userSchema);
```

## API

### Sync

```
sync(
  schema: Schema,
  modelToUpdate: string,
  keyMap: { [key: string]: [foreignKey: string] },
  propertyMap: { [property: string]: [foreignProperty: string] },
  [ errorHandler: (err: Error) => void ]
)
```

**schema**: Mongoose schema to add hooks to.

**modelToUpdate**: String which is passed to `mongoose.model` to get model to update.

**keyMap**: Object for which key/value pair is used to find objects in the target collection to update.

**propertyMap**: Object for which key/value pair is used to update properties in the target collection.

**errorHandler**: Function called if update fails.
