var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
class Store {
    constructor(filePath, fileName, defaultData = []) {
        this.filePath = filePath + fileName;
        // this.model = defaultData;
        this.db = readJsonFile(filePath + fileName, defaultData);
    }
    delete(propertyPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield deleteJsonProperty(this.filePath, propertyPath);
        });
    }
    deleteFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield deleteJsonFile(this.filePath);
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db;
            let dataType;
            if (typeof data === 'object') {
                dataType = {};
            }
            if (Array.isArray(data)) {
                dataType = [];
            }
            else {
                dataType = data;
            }
            return Object.assign(dataType, data);
        });
    }
    update(propertyPath, newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield updateJsonFileProperty(this.filePath, propertyPath, newValue); //, this.model );
        });
    }
    write(newData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield writeJsonFile(this.filePath, newData); //, this.model );
        });
    }
}
export default Store;
//# sourceMappingURL=index.js.map