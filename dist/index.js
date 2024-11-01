var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Store_filePath, _Store_data;
import { promises as fs } from 'fs';
import path from 'path';
function validateAgainstModel(data, model) {
    if (Array.isArray(data)) {
        return data.every(item => validateAgainstModel(item, model));
    }
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        return Object.values(model).includes(data);
    }
    return Object.keys(data).every(key => {
        const isValidKey = model.hasOwnProperty(key);
        if (typeof data[key] === 'object' && data[key] !== null) {
            return isValidKey && validateAgainstModel(data[key], model[key]);
        }
        return isValidKey && typeof data[key] === typeof model[key];
    });
}
function readJsonFile(filePath, defaultData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            try {
                yield fs.access(filePath);
                const data = yield fs.readFile(filePath, 'utf8');
                // console.log( '1 DATA ', data );
                return JSON.parse(data);
            }
            catch (_a) {
                const jsonString = JSON.stringify(defaultData, null, 2);
                const fPath = path.join('./', filePath);
                const parsePath = path.parse(fPath);
                yield fs.writeFile(`${parsePath.dir}/${parsePath.base}`, jsonString, 'utf8');
                return defaultData;
            }
        }
        catch (error) {
            console.error('Error reading JSON file:', error);
            throw error;
        }
    });
}
function updateJsonFileProperty(filePath, propertyPath, newValue) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentData = yield readJsonFile(filePath, {});
            let dataToUpdate = currentData;
            const pathParts = propertyPath.split('.');
            let currentObj = currentData;
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!currentObj[part]) {
                    currentObj[part] = {};
                }
                currentObj = currentObj[part];
            }
            const finalKey = pathParts[pathParts.length - 1];
            currentObj[finalKey] = newValue;
            const jsonString = JSON.stringify(dataToUpdate, null, 2);
            yield fs.writeFile(filePath, jsonString, 'utf8');
            console.log('JSON file updated successfully');
            return true;
        }
        catch (error) {
            console.error('Error updating JSON file:', error);
            throw error;
        }
    });
}
function writeJsonFile(filePath, newData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jsonString = JSON.stringify(newData, null, 2);
            yield fs.writeFile(filePath, jsonString, 'utf8');
            console.log('JSON file updated successfully');
            return true;
        }
        catch (error) {
            console.error('Error updating JSON file:', error);
            throw error;
        }
    });
}
function deleteJsonProperty(filePath, propertyPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentData = yield readJsonFile(filePath, {});
            let dataToUpdate = currentData;
            const pathParts = propertyPath.split('.');
            let currentObj = currentData;
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!currentObj[part]) {
                    currentObj[part] = {};
                }
                currentObj = currentObj[part];
            }
            const finalKey = pathParts[pathParts.length - 1];
            delete currentObj[finalKey];
            const jsonString = JSON.stringify(dataToUpdate, null, 2);
            yield fs.writeFile(filePath, jsonString, 'utf8');
            console.log('JSON file updated successfully');
            return true;
        }
        catch (error) {
            console.error('Error deleting JSON file:', error);
            throw error;
        }
    });
}
function deleteJsonFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.unlink(filePath);
            console.log('JSON file deleted successfully');
            return true;
        }
        catch (error) {
            console.error('Error deleting JSON file:', error);
            throw error;
        }
    });
}
export class Store {
    constructor(filePath, fileName, defaultData = []) {
        _Store_filePath.set(this, void 0);
        _Store_data.set(this, void 0);
        __classPrivateFieldSet(this, _Store_filePath, filePath + fileName, "f");
        __classPrivateFieldSet(this, _Store_data, readJsonFile(__classPrivateFieldGet(this, _Store_filePath, "f"), defaultData), "f");
    }
    delete(propertyPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield deleteJsonProperty(__classPrivateFieldGet(this, _Store_filePath, "f"), propertyPath);
        });
    }
    deleteFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield deleteJsonFile(__classPrivateFieldGet(this, _Store_filePath, "f"));
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield __classPrivateFieldGet(this, _Store_data, "f");
            // Create a deep copy to prevent mutations
            return JSON.parse(JSON.stringify(data));
            // let dataType;
            // if ( typeof data === 'object' ) {
            //   dataType = {};
            // }
            // if ( Array.isArray( data ) ) {
            //   dataType = [];
            // } else {
            //   dataType = data;
            // }
            // return Object.assign( dataType, data);
        });
    }
    update(propertyPath, newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield updateJsonFileProperty(__classPrivateFieldGet(this, _Store_filePath, "f"), propertyPath, newValue);
            if (result) {
                // Update internal cache
                __classPrivateFieldSet(this, _Store_data, readJsonFile(__classPrivateFieldGet(this, _Store_filePath, "f"), yield __classPrivateFieldGet(this, _Store_data, "f")), "f");
            }
            return result;
        });
    }
    write(newData) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield writeJsonFile(__classPrivateFieldGet(this, _Store_filePath, "f"), newData);
            if (result) {
                // Update internal cache
                __classPrivateFieldSet(this, _Store_data, Promise.resolve(newData), "f");
            }
            return result;
        });
    }
}
_Store_filePath = new WeakMap(), _Store_data = new WeakMap();
//# sourceMappingURL=index.js.map