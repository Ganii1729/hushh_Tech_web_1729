import { describe, it, expect } from 'vitest'
import {
    validateEmail,
    validatePhone,
    validatePAN,
    validateAadhaar,
    validateDOB,
    validateFullName,
    validateKYCStep1,
    validateKYCStep2,
} from '../src/utils/kycValidator'

describe('KYC Validation — kycValidator', () => {

    // ── email ──────────────────────────────────────────────────────────────────
    describe('validateEmail', () => {
        it('passes a valid email', () => {
            expect(validateEmail('user@example.com')).toBeNull()
        })
        it('fails an empty email', () => {
            expect(validateEmail('')?.field).toBe('email')
        })
        it('fails a malformed email', () => {
            expect(validateEmail('not-an-email')?.field).toBe('email')
        })
    })

    // ── phone ──────────────────────────────────────────────────────────────────
    describe('validatePhone', () => {
        it('passes a valid Indian phone number', () => {
            expect(validatePhone('+919876543210', 'IN')).toBeNull()
        })
        it('fails an empty phone', () => {
            expect(validatePhone('')?.field).toBe('phone')
        })
        it('fails an invalid phone number', () => {
            expect(validatePhone('12345', 'IN')?.field).toBe('phone')
        })
    })

    // ── PAN ───────────────────────────────────────────────────────────────────
    describe('validatePAN', () => {
        it('passes a valid PAN', () => {
            expect(validatePAN('ABCDE1234F')).toBeNull()
        })
        it('fails an empty PAN', () => {
            expect(validatePAN('')?.field).toBe('pan')
        })
        it('fails an invalid PAN format', () => {
            expect(validatePAN('1234ABCDEF')?.field).toBe('pan')
        })
    })

    // ── Aadhaar ───────────────────────────────────────────────────────────────
    describe('validateAadhaar', () => {
        it('passes a valid Aadhaar', () => {
            expect(validateAadhaar('234567890123')).toBeNull()
        })
        it('fails an empty Aadhaar', () => {
            expect(validateAadhaar('')?.field).toBe('aadhaar')
        })
        it('fails a short Aadhaar', () => {
            expect(validateAadhaar('12345')?.field).toBe('aadhaar')
        })
    })

    // ── DOB ───────────────────────────────────────────────────────────────────
    describe('validateDOB', () => {
        it('passes an adult DOB', () => {
            expect(validateDOB('1995-06-15')).toBeNull()
        })
        it('fails an empty DOB', () => {
            expect(validateDOB('')?.field).toBe('dob')
        })
        it('fails an underage DOB', () => {
            expect(validateDOB('2015-01-01')?.message).toContain('18')
        })
    })

    // ── Full name ─────────────────────────────────────────────────────────────
    describe('validateFullName', () => {
        it('passes a valid name', () => {
            expect(validateFullName('Shiva Ganesh')).toBeNull()
        })
        it('fails an empty name', () => {
            expect(validateFullName('')?.field).toBe('fullName')
        })
    })

    // ── step-level validators ─────────────────────────────────────────────────
    describe('validateKYCStep1', () => {
        it('passes when all step-1 fields are valid', () => {
            const result = validateKYCStep1({
                fullName: 'Shiva Ganesh',
                email: 'shiva@example.com',
                phone: '+919876543210',
            })
            expect(result.valid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })
        it('collects all errors when step-1 fields are empty', () => {
            const result = validateKYCStep1({})
            expect(result.valid).toBe(false)
            expect(result.errors.length).toBeGreaterThanOrEqual(3)
        })
    })

    describe('validateKYCStep2', () => {
        it('passes when all step-2 fields are valid', () => {
            const result = validateKYCStep2({
                dob: '1995-06-15',
                pan: 'ABCDE1234F',
                aadhaar: '234567890123',
            })
            expect(result.valid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })
        it('fails when step-2 fields are empty', () => {
            const result = validateKYCStep2({})
            expect(result.valid).toBe(false)
            expect(result.errors.length).toBeGreaterThanOrEqual(3)
        })
    })
})