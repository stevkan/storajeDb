// import Store from '../index';
// import { promises as fs } from 'fs';
// import path from 'path';

// interface TestModel {
//   name: string;
//   age: number;
//   address?: {
//     street: string;
//     city: string;
//   };
// }

// describe('Store', () => {
//   const testFilePath = path.join(__dirname, 'test.json');
  
//   const initialData: TestModel = {
//     name: 'John',
//     age: 30,
//     address: {
//       street: 'Main St',
//       city: 'Boston'
//     }
//   };

//   let store: Store<TestModel>;

//   beforeEach(async () => {
//     store = new Store<TestModel>(testFilePath, initialData);
//     await store.write(initialData);
//   });

//   afterEach(async () => {
//     try {
//       await fs.unlink(testFilePath);
//     } catch {
//       // Ignore if file doesn't exist
//     }
//   });

//   test('should read initial data correctly', async () => {
//     const data = await store.read();
//     expect(data).toEqual(initialData);
//   });

//   test('should update simple property', async () => {
//     const newName = 'Jane';
//     await store.update('name', newName);
//     const data = await store.read();
//     await expect(data.name).toBe(newName);
//   });

//   test('should update nested property', async () => {
//     const newCity = 'New York';
//     await store.update('address.city', newCity);
//     const data = await store.read();
//     expect(data.address?.city).toBe(newCity);
//   });

//   test('should write complete new data', async () => {
//     const newData: TestModel = {
//       name: 'Alice',
//       age: 25,
//       address: {
//         street: 'Broadway',
//         city: 'Manhattan'
//       }
//     };
//     await store.write(newData);
//     const data = await store.read();
//     expect(data).toEqual(newData);
//   });

//   test('should delete property', async () => {
//     await store.delete('age');
//     const data = await store.read();
//     expect(data.age).toBeUndefined();
//   });

//   test('should delete nested property', async () => {
//     await store.delete('address.city');
//     const data = await store.read();
//     expect(data.address?.city).toBeUndefined();
//   });

//   test('should delete file', async () => {
//     await store.deleteFile();
//     await expect(fs.access(testFilePath)).rejects.toThrow();
//   });

//   test('should handle invalid data gracefully', async () => {
//     const invalidData = {
//       name: 123, // Should be string
//       age: '30'  // Should be number
//     };
//     await expect(store.write(invalidData as any)).rejects.toThrow();
//   });
// });