## StorajeDB
StorajeDB is a simple JSON-based storage system with model validation.

### Installation
To use StorajeDB, you need to have Node.js installed on your machine. Then, you can install the package using npm:
```ts
  npm install storaje-db
```

### Usage

```typescript
import Store from 'storaje-db';
```

Define your data model. Including a data model is optional, but recommended for type checking and validation. Default data structure is an empty array. The model, if populated with any values, will serve as the default data structure.
```typescript
const myModel = {
  id: '',
  name: '',
  age: 0
};
```

Initialize store with file path and model. Creates file if it doesn't exist.
```typescript
const myStore = new Store('./path/to/store_location', 'file.json', myModel);
```

Reads and returns data.
```typescript
const getData = async () => {
  const data = await myStore.read();
  console.log(data);
};
```

Write data. Returns true if successful.
```typescript
const writeData = async () => {
  const newData = {
    id: '1',
    name: 'John',
    age: 25
  };
  await myStore.write(newData);
};
```

Update specific property. Returns true if successful.
```typescript
const updateProperty = async () => {
  await myStore.update('name', 'Jane');
  // For nested properties use dot notation
  await myStore.update('details.address', '123 Main St');
};
```

Delete specific property. Returns true if successful.
```typescript
const deleteProperty = async () => {
  await myStore.delete('age');
  // For nested properties use dot notation
  await myStore.delete('details.address');
};
```

Delete entire file. Returns true if successful.
```typescript
const deleteFile = async () => {
  await myStore.deleteFile();
};
```

The Store class provides the following methods:

1. `read()`: Retrieves the current data from the JSON file as a readonly object
2. `write(newData)`: Updates the JSON file with new data, validating against the model
3. `update(propertyPath, newValue)`: Updates a specific property in the JSON file
4. `delete(propertyPath)`: Deletes a specific property from the JSON file
5. `deleteFile()`: Deletes the entire JSON file

If the JSON file doesn't exist, it will be created automatically with the default data structure provided in the constructor.

The store validates data against the provided model schema. It can handle:
- Objects
- Arrays
- Primitive types (string, number, boolean)

Example with pre-configured stores:

```javascript
import Store from 'storaje-db';
```

Initialize stores
```javascript
const userStore = new Store('./path/to/user.json', {
  id: '',
  username: '',
  email: ''
});
```

Read from agent store
```javascript
const agents = await agentStore.read();
```

Write to user store
```javascript
await userStore.write({
  userId: '123',
  username: 'john_doe',
  email: 'john.doe@example.com'
});
```
