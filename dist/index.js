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
var _Store_filePath, _Store_data, _Store_model, _Store_validateData;
import { promises as fs } from 'fs';
import path from 'path';
function validateAgainstModel(data, model) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    return Object.keys(model).every(key => {
        if (!model[key] ||
            (typeof model[key] === 'object' && Object.keys(model[key]).length === 0) ||
            (Array.isArray(model[key]) && model[key].length === 0)) {
            return true;
        }
        return data.hasOwnProperty(key);
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
            if (propertyPath.includes('.')) {
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
            }
            else {
                dataToUpdate = Object.assign(Object.assign({}, currentData), { [propertyPath]: newValue });
            }
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
    constructor(filePath, fileName, defaultData = [], options = {}) {
        var _a;
        _Store_filePath.set(this, void 0);
        _Store_data.set(this, void 0);
        _Store_model.set(this, void 0);
        _Store_validateData.set(this, void 0);
        __classPrivateFieldSet(this, _Store_filePath, filePath + fileName, "f");
        __classPrivateFieldSet(this, _Store_data, readJsonFile(__classPrivateFieldGet(this, _Store_filePath, "f"), defaultData), "f");
        __classPrivateFieldSet(this, _Store_model, options.model, "f");
        __classPrivateFieldSet(this, _Store_validateData, (_a = options.validateData) !== null && _a !== void 0 ? _a : false, "f");
    }
    validate(data) {
        if (!__classPrivateFieldGet(this, _Store_validateData, "f") || !__classPrivateFieldGet(this, _Store_model, "f")) {
            return true;
        }
        return validateAgainstModel(data, __classPrivateFieldGet(this, _Store_model, "f"));
    }
    delete(propertyPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentData = yield __classPrivateFieldGet(this, _Store_data, "f");
            let tempData = JSON.parse(JSON.stringify(currentData));
            const pathParts = propertyPath.split('.');
            let current = tempData;
            for (let i = 0; i < pathParts.length - 1; i++) {
                current = current[pathParts[i]];
            }
            delete current[pathParts[pathParts.length - 1]];
            if (!this.validate(tempData)) {
                throw new Error('Data validation failed: Resulting data after deletion does not match the specified model');
            }
            const result = yield deleteJsonProperty(__classPrivateFieldGet(this, _Store_filePath, "f"), propertyPath);
            if (result) {
                __classPrivateFieldSet(this, _Store_data, readJsonFile(__classPrivateFieldGet(this, _Store_filePath, "f"), yield __classPrivateFieldGet(this, _Store_data, "f")), "f");
            }
            return result;
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
            return JSON.parse(JSON.stringify(data));
        });
    }
    write(newData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.validate(newData)) {
                throw new Error('Data validation failed: Data does not match the specified model');
            }
            const result = yield writeJsonFile(__classPrivateFieldGet(this, _Store_filePath, "f"), newData);
            if (result) {
                __classPrivateFieldSet(this, _Store_data, Promise.resolve(newData), "f");
            }
            return result;
        });
    }
    update(propertyPath, newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentData = yield __classPrivateFieldGet(this, _Store_data, "f");
            let tempData = JSON.parse(JSON.stringify(currentData));
            const pathParts = propertyPath.split('.');
            let current = tempData;
            for (let i = 0; i < pathParts.length - 1; i++) {
                current = current[pathParts[i]];
            }
            current[pathParts[pathParts.length - 1]] = newValue;
            if (!this.validate(tempData)) {
                throw new Error('Data validation failed: Updated data does not match the specified model');
            }
            const result = yield updateJsonFileProperty(__classPrivateFieldGet(this, _Store_filePath, "f"), propertyPath, newValue);
            if (result) {
                __classPrivateFieldSet(this, _Store_data, readJsonFile(__classPrivateFieldGet(this, _Store_filePath, "f"), yield __classPrivateFieldGet(this, _Store_data, "f")), "f");
            }
            return result;
        });
    }
}
_Store_filePath = new WeakMap(), _Store_data = new WeakMap(), _Store_model = new WeakMap(), _Store_validateData = new WeakMap();
//# sourceMappingURL=index.js.map