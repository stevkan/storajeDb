## StorajeDB
StorajeDB is a simple JSON-based storage system with model validation.

### Installation
To use StorajeDB, you need to have Node.js installed on your machine. Then, you can install the package using npm:

```powershell
  npm install storaje-db
```

### Usage

```javascript
import Store from 'storaje-db';
```


StorajeDB supports optional model validation. You can define a data model to ensure type checking and data validation. Only properties with defined values are checked during validation. Properties with empty arrays or objects are skipped as no child properties exist within the model to validate against.

If no model is provided, the default data structure is an empty array.

Define an optional data model (recommended):

```javascript
const myModel = {
  id: '',           // string type
  name: '',         // string type
  age: 0,          // number type
  active: false,    // boolean type
  tags: [],        // array type
  details: {       // nested object
    address: '',
    phone: ''
  }
};
```

Initialize store with or without a model:

// With model validation
```javascript
const myStore = new Store('./path/to/directory', 'file.json', myModel);
```

// Without model validation (uses empty array as default)
```javascript
const basicStore = new Store('./path/to/directory', 'file.json');
```


Read data:

```javascript
const getData = async () => {
  const data = await myStore.read();
  console.log(data);
};
```


Write data (validates against model if provided):

```javascript
const writeData = async () => {
  const newData = {
    id: '1',
    name: 'John',
    age: 25,
    active: true,
    tags: ['user', 'admin'],
    details: {
      address: '123 Main St',
      phone: '555-0123'
    }
  };
  await myStore.write(newData);
};
```

Update specific properties:

```javascript
const updateProperties = async () => {
  // Update single property
  await myStore.update('name', 'Jane');
  
  // Update nested property
  await myStore.update('details.address', '456 Oak St');
  
  // Update multiple properties at once
  await myStore.update({
    age: 26,
    'details.phone': '555-4567'
  });
};
```

Delete properties:

```javascript
const deleteProperties = async () => {
  // Delete single property
  await myStore.delete('tags');
  
  // Delete nested property
  await myStore.delete('details.phone');
  
  // Delete multiple properties at once
  await myStore.delete(['age', 'details.address']);
};
```

Delete the store file:

```javascript
const deleteStore = async () => {
  await myStore.deleteFile();
};
```

The Store class provides the following methods:

1. `read()`: Retrieves the current data from the JSON file
2. `write(newData)`: Updates the JSON file with new data, validating against the model if provided
3. `update(propertyPath | object, value?)`: Updates one or multiple properties in the JSON file
4. `delete(propertyPath | string[])`: Deletes one or multiple properties from the JSON file
5. `deleteFile()`: Deletes the entire JSON file

Model Validation Examples:

// Simple model
```javascript
const userModel = {
  id: '',
  username: '',
  email: '',
  age: 0,
  isActive: false
};

const userStore = new Store('./', 'users.json', userModel);
```

// Valid data - passes validation
```javascript
await userStore.write({
  id: '1',
  username: 'john_doe',
  email: 'john@example.com',
  age: 30,
  isActive: true
});
```

// Invalid data - fails validation (wrong types)
```javascript
await userStore.write({
  id: 1,           // Error: expected string
  username: true,  // Error: expected string
  email: '',
  age: '25',      // Error: expected number
  isActive: 'yes' // Error: expected boolean
});
```

// Complex model with nested objects and arrays
```javascript
const productModel = {
  id: '',
  name: '',
  price: 0,
  categories: [],
  metadata: {
    created: '',
    updated: '',
    stock: 0
  }
};

const productStore = new Store('./', 'products.json', productModel);
```

// Data will be validated against the model structure and types
```javascript
await productStore.write({
  id: 'prod_1',
  name: 'Widget',
  price: 99.99,
  categories: ['electronics', 'gadgets'],
  metadata: {
    created: '2023-01-01',
    updated: '2023-06-15',
    stock: 100
  }
});
```