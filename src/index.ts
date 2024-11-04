import { promises as fs } from 'fs';
import path from 'path';

interface Model {
  [ key: string ]: any;
}

function validateAgainstModel ( data: any, model: Model ): boolean {
  if ( Array.isArray( data ) ) {
    return data.every( item => validateAgainstModel( item, model ) );
  }

  if ( typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' ) {
    return Object.values( model ).includes( data );
  }

  return Object.keys( data ).every( key => {
    const isValidKey = model.hasOwnProperty( key );
    if ( typeof data[ key ] === 'object' && data[ key ] !== null ) {
      return isValidKey && validateAgainstModel( data[ key ], model[ key ] );
    }
    return isValidKey && typeof data[ key ] === typeof model[ key ];
  } );
}

async function readJsonFile<T> ( filePath: string, defaultData: T ): Promise<any> {
  try {
    try {
      await fs.access( filePath );
      const data = await fs.readFile( filePath, 'utf8' );
      // console.log( '1 DATA ', data );
      return JSON.parse( data );
    } catch {
      const jsonString = JSON.stringify( defaultData, null, 2 );
      const fPath = path.join( './', filePath );
      const parsePath = path.parse( fPath );
      await fs.writeFile( `${parsePath.dir}/${parsePath.base}`, jsonString, 'utf8' );
      return defaultData;
    }
  } catch ( error ) {
    console.error( 'Error reading JSON file:', error );
    throw error;
  }
}

async function updateJsonFileProperty<T extends Model> ( filePath: string, propertyPath: string, newValue: any ): Promise<boolean> {
  try {
    const currentData = await readJsonFile<T>( filePath, {} as T );
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
    currentObj[ finalKey ] = newValue;

    const jsonString = JSON.stringify( dataToUpdate, null, 2 );
    await fs.writeFile( filePath, jsonString, 'utf8' );
    console.log( 'JSON file updated successfully' );
    return true;
  } catch ( error ) {
    console.error( 'Error updating JSON file:', error );
    throw error;
  }
}

async function writeJsonFile<T extends Model> ( filePath: string, newData: T ): Promise<boolean> {
  try {
    const jsonString = JSON.stringify( newData, null, 2 );
    await fs.writeFile( filePath, jsonString, 'utf8' );
    console.log( 'JSON file updated successfully' );
    return true;
  } catch ( error ) {
    console.error( 'Error updating JSON file:', error );
    throw error;
  }
}

async function deleteJsonProperty<T extends Model> ( filePath: string, propertyPath: string ): Promise<boolean> {
  try {
    const currentData = await readJsonFile<T>( filePath, {} as T );
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

async function deleteJsonFile<T extends Model> ( filePath: string ): Promise<boolean> {
  try {
    await fs.unlink( filePath );
    console.log( 'JSON file deleted successfully' );
    return true;
  } catch ( error ) {
    console.error( 'Error deleting JSON file:', error );
    throw error;
  }
}
export class Store<T extends Model> {
  #filePath: string;
  #data: Promise<T>;
  #model?: Model;
  #validateData: boolean;

  constructor(
    filePath: string,
    fileName: string,
    defaultData: T = [] as unknown as T,
    options: { model?: Model; validateData?: boolean; } = {}
  ) {
    this.#filePath = filePath + fileName;
    this.#data = readJsonFile<T>( this.#filePath, defaultData );
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

    const result = await deleteJsonProperty<T>( this.#filePath, propertyPath );
    if ( result ) {
      this.#data = readJsonFile<T>( this.#filePath, await this.#data );
    }
    return result;
  }

  async deleteFile (): Promise<boolean> {
    return await deleteJsonFile<T>( this.#filePath );
  }

  async read (): Promise<Readonly<T>> {
    const data = await this.#data;
    return JSON.parse( JSON.stringify( data ) );
  }

  async write ( newData: T ): Promise<boolean> {
    if ( !this.validate( newData ) ) {
      throw new Error( 'Data validation failed: Data does not match the specified model' );
    }
    const result = await writeJsonFile<T>( this.#filePath, newData );
    if ( result ) {
      this.#data = Promise.resolve( newData );
    }
    return result;
  }

  async update ( propertyPath: string, newValue: any ): Promise<boolean> {
    const currentData = await this.#data;
    let tempData = JSON.parse( JSON.stringify( currentData ) );

    const pathParts = propertyPath.split( '.' );
    let current = tempData;
    for ( let i = 0; i < pathParts.length - 1; i++ ) {
      current = current[ pathParts[ i ] ];
    }
    current[ pathParts[ pathParts.length - 1 ] ] = newValue;

    if ( !this.validate( tempData ) ) {
      throw new Error( 'Data validation failed: Updated data does not match the specified model' );
    }

    const result = await updateJsonFileProperty<T>( this.#filePath, propertyPath, newValue );
    if ( result ) {
      this.#data = readJsonFile<T>( this.#filePath, await this.#data );
    }
    return result;
  }
}
