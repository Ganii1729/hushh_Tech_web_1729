import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'

export interface KYCValidationError {
    field: string
    message: string
}

export interface KYCValidationResult {
    valid: boolean
    errors: KYCValidationError[]
}

// ── helpers ──────────────────────────────────────────────────────────────────

function isBlank(value: unknown): boolean {
    return value === undefined || value === null || String(value).trim() === ''
}

// ── individual validators ─────────────────────────────────────────────────────

export function validateRequired(
    field: string,
    value: unknown,
    label: string
): KYCValidationError | null {
    if (isBlank(value)) {
        return { field, message: `${label} is required` }
    }
    return null
}

export function validateEmail(email: unknown): KYCValidationError | null {
    if (isBlank(email)) {
        return { field: 'email', message: 'Email address is required' }
    }
    const RFC_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!RFC_EMAIL.test(String(email).trim())) {
        return { field: 'email', message: 'Enter a valid email address' }
    }
    return null
}

export function validatePhone(
    phone: unknown,
    countryCode: CountryCode = 'IN'
): KYCValidationError | null {
    if (isBlank(phone)) {
        return { field: 'phone', message: 'Phone number is required' }
    }
    const parsed = parsePhoneNumberFromString(String(phone), countryCode)
    if (!parsed || !parsed.isValid()) {
        return { field: 'phone', message: 'Enter a valid phone number' }
    }
    return null
}

export function validatePAN(pan: unknown): KYCValidationError | null {
    if (isBlank(pan)) {
        return { field: 'pan', message: 'PAN number is required' }
    }
    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!PAN_REGEX.test(String(pan).trim().toUpperCase())) {
        return {
            field: 'pan',
            message: 'Enter a valid PAN number (e.g. ABCDE1234F)',
        }
    }
    return null
}

export function validateAadhaar(aadhaar: unknown): KYCValidationError | null {
    if (isBlank(aadhaar)) {
        return { field: 'aadhaar', message: 'Aadhaar number is required' }
    }
    const cleaned = String(aadhaar).replace(/\s/g, '')
    const AADHAAR_REGEX = /^[2-9]{1}[0-9]{11}$/
    if (!AADHAAR_REGEX.test(cleaned)) {
        return {
            field: 'aadhaar',
            message: 'Enter a valid 12-digit Aadhaar number',
        }
    }
    return null
}

export function validateDOB(dob: unknown): KYCValidationError | null {
    if (isBlank(dob)) {
        return { field: 'dob', message: 'Date of birth is required' }
    }
    const dobString = String(dob)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dobString)) {
        return { field: 'dob', message: 'Enter a valid date in YYYY-MM-DD format' }
    }
    const date = new Date(dobString)
    if (isNaN(date.getTime())) {
        return { field: 'dob', message: 'Enter a valid date of birth' }
    }
    const today = new Date()
    let age = today.getUTCFullYear() - date.getUTCFullYear()
    const monthDiff = today.getUTCMonth() - date.getUTCMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < date.getUTCDate())) {
        age--
    }
    if (age < 18) {
        return {
            field: 'dob',
            message: 'You must be at least 18 years old to complete KYC',
        }
    }
    return null
}

export function validateFullName(name: unknown): KYCValidationError | null {
    if (isBlank(name)) {
        return { field: 'fullName', message: 'Full name is required' }
    }
    if (String(name).trim().length < 2) {
        return { field: 'fullName', message: 'Enter your full name' }
    }
    return null
}

// ── step-level validators ────────────────────────────────────────────────────

export function validateKYCStep1(data: {
    fullName?: unknown
    email?: unknown
    phone?: unknown
}): KYCValidationResult {
    const errors: KYCValidationError[] = []

    const nameErr = validateFullName(data.fullName)
    if (nameErr) errors.push(nameErr)

    const emailErr = validateEmail(data.email)
    if (emailErr) errors.push(emailErr)

    const phoneErr = validatePhone(data.phone)
    if (phoneErr) errors.push(phoneErr)

    return { valid: errors.length === 0, errors }
}

export function validateKYCStep2(data: {
    dob?: unknown
    pan?: unknown
    aadhaar?: unknown
}): KYCValidationResult {
    const errors: KYCValidationError[] = []

    const dobErr = validateDOB(data.dob)
    if (dobErr) errors.push(dobErr)

    const panErr = validatePAN(data.pan)
    if (panErr) errors.push(panErr)

    const aadhaarErr = validateAadhaar(data.aadhaar)
    if (aadhaarErr) errors.push(aadhaarErr)

    return { valid: errors.length === 0, errors }
}