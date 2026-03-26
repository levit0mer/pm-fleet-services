"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("../src/validators");
describe('validateAddress', () => {
    const validAddress = {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'US',
    };
    it('should accept a valid US address', () => {
        const result = (0, validators_1.validateAddress)(validAddress);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
    it('should reject empty street', () => {
        const result = (0, validators_1.validateAddress)({ ...validAddress, street: '' });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Street address is required');
    });
    it('should reject invalid state code', () => {
        const result = (0, validators_1.validateAddress)({ ...validAddress, state: 'XX' });
        expect(result.valid).toBe(false);
    });
    it('should reject invalid ZIP format', () => {
        const result = (0, validators_1.validateAddress)({ ...validAddress, zipCode: 'ABCDE' });
        expect(result.valid).toBe(false);
    });
    it('should accept ZIP+4 format', () => {
        const result = (0, validators_1.validateAddress)({ ...validAddress, zipCode: '78701-1234' });
        expect(result.valid).toBe(true);
    });
});
describe('validateDimensions', () => {
    it('should accept valid dimensions', () => {
        const result = (0, validators_1.validateDimensions)({
            lengthIn: 12, widthIn: 8, heightIn: 6, weightLbs: 5,
        });
        expect(result.valid).toBe(true);
    });
    it('should reject zero dimensions', () => {
        const result = (0, validators_1.validateDimensions)({
            lengthIn: 0, widthIn: 8, heightIn: 6, weightLbs: 5,
        });
        expect(result.valid).toBe(false);
    });
    it('should reject oversized packages', () => {
        const result = (0, validators_1.validateDimensions)({
            lengthIn: 120, widthIn: 8, heightIn: 6, weightLbs: 5,
        });
        expect(result.valid).toBe(false);
    });
});
describe('validateWeight', () => {
    it('should accept valid weight', () => {
        expect((0, validators_1.validateWeight)(25).valid).toBe(true);
    });
    it('should reject zero weight', () => {
        expect((0, validators_1.validateWeight)(0).valid).toBe(false);
    });
    it('should reject overweight for USPS', () => {
        expect((0, validators_1.validateWeight)(80, 'usps').valid).toBe(false);
    });
    it('should accept weight under carrier limit', () => {
        expect((0, validators_1.validateWeight)(60, 'ups').valid).toBe(true);
    });
});
