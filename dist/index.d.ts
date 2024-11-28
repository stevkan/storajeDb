/**
 * Represents a generic model interface that allows any string key with any value type.
 * This interface is used for flexible object type definitions where the structure
 * is not strictly defined at compile time.
 */
interface Model {
    [key: string]: any;
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
export declare class Store<T extends Model> {
    #private;
    constructor(filePath: string, fileName: string, defaultData?: T, options?: StoreOptions);
    private validate;
    delete(propertyPath: string | number): Promise<boolean>;
    deleteFile(): Promise<boolean>;
    read(): Promise<Readonly<T>>;
    write(newData: T): Promise<boolean>;
    update(propertyPath: string | number, newValue: any): Promise<boolean>;
}
export {};
