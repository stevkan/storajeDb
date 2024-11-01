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
  private filePath: string;
  // private model: T;
  private db: Promise<T>;

  constructor( filePath: string, fileName: string, defaultData: T = [] as unknown as T ) {
    this.filePath = filePath + fileName;
    // this.model = defaultData;
    this.db = readJsonFile<T>( filePath + fileName, defaultData );
  }

  async delete ( propertyPath: string ): Promise<boolean> {
    return await deleteJsonProperty<T>( this.filePath, propertyPath );
  }

  async deleteFile (): Promise<boolean> {
    return await deleteJsonFile<T>( this.filePath );
  }

  async read (): Promise<Readonly<T>> {
    const data = await this.db;
    let dataType;
    if ( typeof data === 'object' ) {
      dataType = {};
    }
    if ( Array.isArray( data ) ) {
      dataType = [];
    } else {
      dataType = data;
    }
    return Object.assign( dataType, data);
  }

  async update ( propertyPath: string, newValue: any ): Promise<boolean> {
    return await updateJsonFileProperty<T>( this.filePath, propertyPath, newValue ); //, this.model );
  }

  async write ( newData: T ): Promise<boolean> {
    return await writeJsonFile<T>( this.filePath, newData ); //, this.model );
  }
}