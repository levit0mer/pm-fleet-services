"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calculator_1 = require("../src/calculator");
const sampleRequest = {
    origin: {
        street: '123 Warehouse Ave',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'US',
    },
    destination: {
        street: '456 Customer Blvd',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
    },
    packages: [{ lengthIn: 12, widthIn: 8, heightIn: 6, weightLbs: 5 }],
};
describe('calculatePackageRate', () => {
    it('should calculate rate for a single package', () => {
        const rate = (0, calculator_1.calculatePackageRate)({ lengthIn: 12, widthIn: 8, heightIn: 6, weightLbs: 5 }, 'ups', 'ground');
        expect(rate).not.toBeNull();
        expect(rate.carrier).toBe('ups');
        expect(rate.serviceLevel).toBe('ground');
        expect(rate.totalCost).toBeGreaterThan(0);
        expect(rate.currency).toBe('USD');
    });
    it('should return null for unavailable service', () => {
        const rate = (0, calculator_1.calculatePackageRate)({ lengthIn: 12, widthIn: 8, heightIn: 6, weightLbs: 5 }, 'usps', 'overnight');
        expect(rate).toBeNull();
    });
    it('should use dimensional weight when greater than actual', () => {
        const lightButBulky = {
            lengthIn: 24, widthIn: 24, heightIn: 24, weightLbs: 2,
        };
        const rate = (0, calculator_1.calculatePackageRate)(lightButBulky, 'fedex', 'ground');
        expect(rate).not.toBeNull();
        expect(rate.totalCost).toBeGreaterThan(40);
    });
});
describe('calculateRate', () => {
    it('should return rates for all carriers when none specified', () => {
        const rates = (0, calculator_1.calculateRate)(sampleRequest);
        expect(rates.length).toBeGreaterThan(0);
        const carriers = new Set(rates.map((r) => r.carrier));
        expect(carriers.size).toBeGreaterThanOrEqual(3);
    });
    it('should return only specified carrier rates', () => {
        const rates = (0, calculator_1.calculateRate)({ ...sampleRequest, carrier: 'fedex' });
        expect(rates.every((r) => r.carrier === 'fedex')).toBe(true);
    });
    it('should return only specified service level', () => {
        const rates = (0, calculator_1.calculateRate)({
            ...sampleRequest,
            carrier: 'ups',
            serviceLevel: 'ground',
        });
        expect(rates).toHaveLength(1);
        expect(rates[0].serviceLevel).toBe('ground');
    });
});
describe('getBestRate', () => {
    it('should return the cheapest rate across all carriers', () => {
        const best = (0, calculator_1.getBestRate)(sampleRequest);
        expect(best).not.toBeNull();
        const allRates = (0, calculator_1.calculateRate)(sampleRequest);
        const cheapest = Math.min(...allRates.map((r) => r.totalCost));
        expect(best.totalCost).toBe(cheapest);
    });
});
