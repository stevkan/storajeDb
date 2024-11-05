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
// Add model definition
const testModel = {
    name: '', // example string
    age: 0, // example number
    address: {
        street: '',
        city: ''
    }
};
describe('Store with Model Validation', () => {
    const testFilePath = path.join(__dirname, 'test-validated.json');
    const validData = {
        name: 'John',
        age: 30,
        address: {
            street: 'Main St',
            city: 'Boston'
        }
    };
    let validatedStore;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        validatedStore = new Store(__dirname, 'test-validated.json', validData, {
            model: testModel,
            validateData: true
        });
        yield validatedStore.write(validData);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fs.unlink(testFilePath);
        }
        catch (_a) {
            // Ignore if file doesn't exist
        }
    }));
    test('should accept valid data', () => __awaiter(void 0, void 0, void 0, function* () {
        const newValidData = {
            name: 'Jane',
            age: 25,
            address: {
                street: 'Broadway',
                city: 'Manhattan'
            }
        };
        yield expect(validatedStore.write(newValidData)).resolves.toBe(true);
    }));
    test('should reject data with wrong types', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidData = {
            name: 123, // Should be string
            age: '25', // Should be number
            address: {
                street: 'Broadway',
                city: 'Manhattan'
            }
        };
        yield expect(validatedStore.write(invalidData)).rejects.toThrow('Data validation failed');
    }));
    test('should reject data missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidData = {
            name: 'Jane',
            // age is missing but required
            address: {
                street: 'Broadway',
                city: 'Manhattan'
            }
        };
        yield expect(validatedStore.write(invalidData)).rejects.toThrow('Data validation failed');
    }));
    test('should validate after delete operation', () => __awaiter(void 0, void 0, void 0, function* () {
        // Attempting to delete required field should fail
        yield expect(validatedStore.delete('age')).rejects.toThrow('Data validation failed');
        // Deleting optional field should succeed
        yield expect(validatedStore.delete('address.city')).resolves.toBe(true);
    }));
    test('should allow partial updates that maintain valid state', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(validatedStore.update('name', 'Jane')).resolves.toBe(true);
        yield expect(validatedStore.update('age', 26)).resolves.toBe(true);
        // Verify the updates maintained valid state
        const updatedData = yield validatedStore.read();
        expect(updatedData.name).toBe('Jane');
        expect(updatedData.age).toBe(26);
    }));
    test('should reject invalid partial updates', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(validatedStore.update('name', 123)).rejects.toThrow('Data validation failed');
        yield expect(validatedStore.update('age', '26')).rejects.toThrow('Data validation failed');
    }));
});
//# sourceMappingURL=store.modelValidation.test.js.map