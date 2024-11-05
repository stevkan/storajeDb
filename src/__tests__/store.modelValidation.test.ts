import { Store } from '../index';
import { promises as fs } from 'fs';
import path from 'path';

interface TestModel {
  name: string;
  age: number;
  address?: {
    street: string;
    city: string;
  };
}

// Add model definition
const testModel = {
  name: '',  // example string
  age: 0,    // example number
  address: {
    street: '',
    city: ''
  }
};

describe( 'Store with Model Validation', () => {
  const testFilePath = path.join( __dirname, 'test-validated.json' );

  const validData: TestModel = {
    name: 'John',
    age: 30,
    address: {
      street: 'Main St',
      city: 'Boston'
    }
  };

  let validatedStore: Store<TestModel>;

  beforeEach( async () => {
    validatedStore = new Store<TestModel>( __dirname, 'test-validated.json', validData, {
      model: testModel,
      validateData: true
    } );
    await validatedStore.write( validData );
  } );

  afterEach( async () => {
    try {
      await fs.unlink( testFilePath );
    } catch {
      // Ignore if file doesn't exist
    }
  } );

  test( 'should accept valid data', async () => {
    const newValidData: TestModel = {
      name: 'Jane',
      age: 25,
      address: {
        street: 'Broadway',
        city: 'Manhattan'
      }
    };
    await expect( validatedStore.write( newValidData ) ).resolves.toBe( true );
  } );

  test( 'should reject data with wrong types', async () => {
    const invalidData = {
      name: 123, // Should be string
      age: '25', // Should be number
      address: {
        street: 'Broadway',
        city: 'Manhattan'
      }
    };
    await expect( validatedStore.write( invalidData as any ) ).rejects.toThrow( 'Data validation failed' );
  } );

  test( 'should reject data missing required fields', async () => {
    const invalidData = {
      name: 'Jane',
      // age is missing but required
      address: {
        street: 'Broadway',
        city: 'Manhattan'
      }
    };
    await expect( validatedStore.write( invalidData as any ) ).rejects.toThrow( 'Data validation failed' );
  } );

  test( 'should validate after delete operation', async () => {
    // Attempting to delete required field should fail
    await expect( validatedStore.delete( 'age' ) ).rejects.toThrow( 'Data validation failed' );

    // Deleting optional field should succeed
    await expect( validatedStore.delete( 'address.city' ) ).resolves.toBe( true );
  } );

  test( 'should allow partial updates that maintain valid state', async () => {
    await expect( validatedStore.update( 'name', 'Jane' ) ).resolves.toBe( true );
    await expect( validatedStore.update( 'age', 26 ) ).resolves.toBe( true );

    // Verify the updates maintained valid state
    const updatedData = await validatedStore.read();
    expect( updatedData.name ).toBe( 'Jane' );
    expect( updatedData.age ).toBe( 26 );
  } );

  test( 'should reject invalid partial updates', async () => {
    await expect( validatedStore.update( 'name', 123 as any ) ).rejects.toThrow( 'Data validation failed' );
    await expect( validatedStore.update( 'age', '26' as any ) ).rejects.toThrow( 'Data validation failed' );
  } );
} );
