interface Model {
    [key: string]: any;
}
export declare class Store<T extends Model> {
    #private;
    constructor(filePath: string, fileName: string, defaultData?: T);
    delete(propertyPath: string): Promise<boolean>;
    deleteFile(): Promise<boolean>;
    read(): Promise<Readonly<T>>;
    update(propertyPath: string, newValue: any): Promise<boolean>;
    write(newData: T): Promise<boolean>;
}
export {};
