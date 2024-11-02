var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Store } from '../index';
import { promises as fs } from 'fs';
import path from 'path';
describe('Store', () => {
    const testFilePath = path.join(__dirname, 'test.json');
    const initialData = {
        name: 'John',
        age: 30,
        address: {
            street: 'Main St',
            city: 'Boston'
        }
    };
    let store;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        store = new Store(__dirname, 'test.json', initialData);
        yield store.write(initialData);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fs.unlink(testFilePath);
        }
        catch (_a) {
            // Ignore if file doesn't exist
        }
    }));
    test('should read initial data correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield store.read();
        expect(data).toEqual(initialData);
    }));
    test('should update simple property', () => __awaiter(void 0, void 0, void 0, function* () {
        const newName = 'Jane';
        yield store.update('name', newName);
        const data = yield store.read();
        yield expect(data.name).toBe(newName);
    }));
    test('should update nested property', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const newCity = 'New York';
        yield store.update('address.city', newCity);
        const data = yield store.read();
        expect((_a = data.address) === null || _a === void 0 ? void 0 : _a.city).toBe(newCity);
    }));
    test('should write complete new data', () => __awaiter(void 0, void 0, void 0, function* () {
        const newData = {
            name: 'Alice',
            age: 25,
            address: {
                street: 'Broadway',
                city: 'Manhattan'
            }
        };
        yield store.write(newData);
        const data = yield store.read();
        expect(data).toEqual(newData);
    }));
    test('should delete property', () => __awaiter(void 0, void 0, void 0, function* () {
        yield store.delete('age');
        const data = yield store.read();
        expect(data.age).toBeUndefined();
    }));
    test('should delete nested property', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        yield store.delete('address.city');
        const data = yield store.read();
        expect((_a = data.address) === null || _a === void 0 ? void 0 : _a.city).toBeUndefined();
    }));
    test('should delete file', () => __awaiter(void 0, void 0, void 0, function* () {
        yield store.deleteFile();
        yield expect(fs.access(testFilePath)).rejects.toThrow();
    }));
    test('should handle invalid data gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidData = {
            name: 123, // Should be string
            age: '30' // Should be number
        };
        yield expect(store.write(invalidData)).rejects.toThrow();
    }));
});
//# sourceMappingURL=store.test.js.map