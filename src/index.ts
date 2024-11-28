import { promises as fs } from 'fs';
import path from 'path';

/**
 * Represents a generic model interface that allows any string key with any value type.
 * This interface is used for flexible object type definitions where the structure
 * is not strictly defined at compile time.
 */
interface Model {
  [ key: string ]: any;
}

function validateAgainstModel ( data: any, model: Model ): boolean {
  // Check required fields
  if ( model.required && Array.isArray( model.required ) ) {
    const missingRequired = model.required.some( field => !data.hasOwnProperty( field ) );
    if ( missingRequired ) {
      return false;
    }
  }

  // For primitive values, check exact type match
  if ( typeof data !== typeof model ) {
    return false;
  }

  // For objects (excluding null)
  if ( typeof data === 'object' && data !== null ) {
    return Object.keys( model ).every( key => {
      // Skip validation if model property is an empty array or object
      if ( data[ key ] &&
        typeof data[ key ] === 'object' &&
        Object.keys( data[ key ] ).length === 0 ) {
        return true;
      }

      if ( !data.hasOwnProperty( key ) ) {
        return false;
      }

      if ( typeof model[ key ] === 'object' && model[ key ] !== null ) {
        return validateAgainstModel( model[ key ], data[ key ] );
      }

      return typeof model[ key ] === typeof data[ key ];
    } );
  }

  return true;
}

async function readJsonFile<T> ( filePath: string, fileName: string, defaultData: T ): Promise<any> {
  try {
    const file = filePath + fileName;
    const fPath = path.join( './', file );
    const parsePath = path.parse( fPath );
    
    // Create directory if it doesn't exist
    await fs.mkdir( parsePath.dir, { recursive: true } );

    try {
      await fs.access( file, fs.constants.F_OK );
      const data = await fs.readFile( file, 'utf8' );
      return JSON.parse( data );
    } catch {
      const jsonString = JSON.stringify( defaultData, null, 2 );
      await fs.writeFile( `${parsePath.dir}/${parsePath.base}`, jsonString, 'utf8' );
      return defaultData;
    }
  } catch ( error ) {
    console.error( 'Error reading JSON file:', error );
    throw error;
  }
}

async function updateJsonFileProperty<T extends Model> ( filePath: string, fileName: string, propertyPath: string, newValue: any ): Promise<boolean> {
  try {
    const fullPath = path.join( filePath, fileName );
    const parsePath = path.parse( fullPath );

    // Create directory if it doesn't exist
    await fs.mkdir( parsePath.dir, { recursive: true } );

    const currentData = await readJsonFile<T>( filePath, fileName, {} as T );
    let dataToUpdate = currentData;

    if ( propertyPath.includes( '.' ) ) {
      const pathParts = propertyPath.split( '.' );
      let currentObj: any = currentData;
      for ( let i = 0; i < pathParts.length - 1; i++ ) {
        const part = pathParts[ i ];
        if ( !currentObj[ part ] ) {
          currentObj[ part ] = {};
        }
        currentObj = currentObj[ part ];
      }
      const finalKey = pathParts[ pathParts.length - 1 ];
      currentObj[ finalKey ] = newValue;
    } else {
      dataToUpdate = { ...currentData, [ propertyPath ]: newValue };
    }

    const jsonString = JSON.stringify( dataToUpdate, null, 2 );
    await fs.writeFile( fullPath, jsonString, 'utf8' );
    console.log( 'JSON file updated successfully' );
    return true;
  } catch ( error ) {
    console.error( 'Error updating JSON file:', error );
    throw error;
  }
}

async function writeJsonFile<T extends Model> ( filePath: string, fileName: string, newData: T ): Promise<boolean> {
  try {
    const fullPath = path.join( filePath, fileName );
    const parsePath = path.parse( fullPath );

    // Create directory if it doesn't exist
    await fs.mkdir( parsePath.dir, { recursive: true } );

    const jsonString = JSON.stringify( newData, null, 2 );
    await fs.writeFile( fullPath, jsonString, 'utf8' );
    console.log( 'JSON file updated successfully' );
    return true;
  } catch ( error ) {
    console.error( 'Error updating JSON file:', error );
    throw error;
  }
}

async function deleteJsonProperty<T extends Model> ( filePath: string, fileName: string, propertyPath: string ): Promise<boolean> {
  try {
    const currentData = await readJsonFile<T>( filePath, fileName, {} as T );
    let dataToUpdate = currentData;
    const pathParts = propertyPath.split( '.' );
    let currentObj: any = currentData;
    for ( let i = 0; i < pathParts.length - 1; i++ ) {
      const part = pathParts[ i ];
      if ( !currentObj[ part ] ) {
        currentObj[ part ] = {};
      }
      currentObj = currentObj[ part ];
    }
    const finalKey = pathParts[ pathParts.length - 1 ];
    delete currentObj[ finalKey ];
    const jsonString = JSON.stringify( dataToUpdate, null, 2 );
    await fs.writeFile( filePath, jsonString, 'utf8' );
    console.log( 'JSON file updated successfully' );
    return true;
  } catch ( error ) {
    console.error( 'Error deleting JSON file:', error );
    throw error;
  }
}

async function deleteJsonFile<T extends Model> ( filePath: string, fileName: string ): Promise<boolean> {
  try {
    const file = filePath + fileName;
    await fs.unlink( file );
    console.log( 'JSON file deleted successfully' );
    return true;
  } catch ( error ) {
    console.error( 'Error deleting JSON file:', error );
    throw error;
  }
}

/**
 * Interface defining options for configuring a Store instance.
 * @interface
 */
interface StoreOptions {
  /**
   * Optional model definition for data validation.
   * @type {Model | undefined}
   */
  model?: Model;

  /**
   * Flag to enable/disable data validation against the model.
   * @type {boolean | undefined}
   * @default false
   */
  validateData?: boolean;
}

export class Store<T extends Model> {
  #filePath: string;
  #fileName: string;
  #data: Promise<T>;
  #model?: Model;
  #validateData: boolean;

  constructor(
    filePath: string,
    fileName: string,
    defaultData: T = [] as unknown as T,
    options: StoreOptions = {}
  ) {
    this.#filePath = filePath;
    this.#fileName = fileName;
    this.#data = readJsonFile<T>( this.#filePath, this.#fileName, defaultData );
    this.#model = options.model;
    this.#validateData = options.validateData ?? false;
  }

  private validate ( data: any ): boolean {
    if ( !this.#validateData || !this.#model ) {
      return true;
    }
    return validateAgainstModel( data, this.#model );
  }

  async delete ( propertyPath: string ): Promise<boolean> {
    const currentData = await this.#data;
    let tempData = JSON.parse( JSON.stringify( currentData ) );

    const pathParts = propertyPath.split( '.' );
    let current = tempData;
    for ( let i = 0; i < pathParts.length - 1; i++ ) {
      current = current[ pathParts[ i ] ];
    }
    delete current[ pathParts[ pathParts.length - 1 ] ];

    if ( !this.validate( tempData ) ) {
      throw new Error( 'Data validation failed: Resulting data after deletion does not match the specified model' );
    }

    const result = await deleteJsonProperty<T>( this.#filePath, this.#fileName, propertyPath );
    if ( result ) {
      this.#data = readJsonFile<T>( this.#filePath, this.#fileName, await this.#data );
    }
    return result;
  }

  async deleteFile (): Promise<boolean> {
    return await deleteJsonFile<T>( this.#filePath, this.#fileName );
  }

  async read (): Promise<Readonly<T>> {
    const data = await this.#data;
    return JSON.parse( JSON.stringify( data ) );
  }

  async write ( newData: T ): Promise<boolean> {
    if ( !this.validate( newData ) ) {
      throw new Error( 'Data validation failed: Data does not match the specified model' );
    }
    const result = await writeJsonFile<T>( this.#filePath, this.#fileName, newData );
    if ( result ) {
      this.#data = Promise.resolve( newData );
    }
    return result;
  }

  async update(propertyPath: string | number, newValue: any): Promise<boolean> {
    const currentData = await this.#data;
    let tempData = JSON.parse(JSON.stringify(currentData));

    if (Array.isArray(tempData)) {
      if (typeof propertyPath === 'number') {
        tempData[propertyPath] = newValue;
      } else {
        const pathParts = propertyPath.split('.');
        let current: any = tempData;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        current[pathParts[pathParts.length - 1]] = newValue;
      }
    } else {
      const pathParts = propertyPath.toString().split('.');
      let current: any = tempData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = newValue;
    }

    if (!this.validate(tempData)) {
      throw new Error('Data validation failed: Updated data does not match the specified model');
    }

    const result = await writeJsonFile<T>(this.#filePath, this.#fileName, tempData);
    if (result) {
      this.#data = Promise.resolve(tempData);
    }
    return result;
  }

}
