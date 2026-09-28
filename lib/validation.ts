export interface PhoneValidationResult {
  isValid: boolean;
  cleanPhone: string;
  formattedDisplay: string;
  error?: string;
}

/**
 * Validates WhatsApp / Mobile Phone Numbers.
 * Supports: 08xx, 628xx, +628xx (10 to 14 digits) as well as valid international numbers with '+' prefix (8-15 digits).
 */
export function validatePhoneNumber(phone?: string | null): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      cleanPhone: '',
      formattedDisplay: '',
      error: 'WhatsApp / Phone number is required.'
    };
  }

  // Remove whitespace, dashes, dots, parentheses
  const cleaned = phone.trim().replace(/[\s\-\.\(\)]/g, '');

  if (!cleaned) {
    return {
      isValid: false,
      cleanPhone: '',
      formattedDisplay: '',
      error: 'Phone number cannot be empty.'
    };
  }

  // Only digits and optional leading '+'
  if (!/^\+?[0-9]+$/.test(cleaned)) {
    return {
      isValid: false,
      cleanPhone: cleaned,
      formattedDisplay: cleaned,
      error: 'Phone number can only contain digits and a leading + sign.'
    };
  }

  // Check if Indonesian cellular format
  const isIndonesian =
    cleaned.startsWith('08') ||
    cleaned.startsWith('+628') ||
    cleaned.startsWith('628') ||
    cleaned.startsWith('02') || // Landline
    cleaned.startsWith('+62');

  if (isIndonesian) {
    let digitsOnly = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
    let standardLocal = digitsOnly;
    if (digitsOnly.startsWith('62')) {
      standardLocal = '0' + digitsOnly.slice(2);
    }

    // Must start with 08 for mobile / WhatsApp
    if (!standardLocal.startsWith('08')) {
      return {
        isValid: false,
        cleanPhone: cleaned,
        formattedDisplay: cleaned,
        error: 'Indonesian WhatsApp numbers must start with 08... or +628...'
      };
    }

    // Standard Indonesian cellular length is 10 to 14 digits
    if (standardLocal.length < 10) {
      return {
        isValid: false,
        cleanPhone: cleaned,
        formattedDisplay: cleaned,
        error: `Number is too short (${standardLocal.length} digits). Minimum 10 digits required.`
      };
    }

    if (standardLocal.length > 14) {
      return {
        isValid: false,
        cleanPhone: cleaned,
        formattedDisplay: cleaned,
        error: `Number is too long (${standardLocal.length} digits). Maximum 14 digits allowed.`
      };
    }

    // Check obviously fake repeating numbers (e.g. 08111111111, 08000000000)
    const suffix = standardLocal.slice(2);
    if (/^(.)\1{7,}$/.test(suffix)) {
      return {
        isValid: false,
        cleanPhone: cleaned,
        formattedDisplay: standardLocal,
        error: 'Invalid phone number pattern (too many repeating digits).'
      };
    }

    // Check sequential dummy numbers
    if (standardLocal === '08123456789' || standardLocal === '081234567890') {
      return {
        isValid: false,
        cleanPhone: cleaned,
        formattedDisplay: standardLocal,
        error: 'Please enter a genuine, active mobile phone number.'
      };
    }

    return {
      isValid: true,
      cleanPhone: standardLocal,
      formattedDisplay: standardLocal
    };
  }

  // International phone check (starts with '+')
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    if (digits.length >= 8 && digits.length <= 15) {
      return {
        isValid: true,
        cleanPhone: cleaned,
        formattedDisplay: cleaned
      };
    }
    return {
      isValid: false,
      cleanPhone: cleaned,
      formattedDisplay: cleaned,
      error: 'International phone numbers must contain 8 to 15 digits.'
    };
  }

  return {
    isValid: false,
    cleanPhone: cleaned,
    formattedDisplay: cleaned,
    error: 'Invalid phone format. Please use 08xx or international format with country code (e.g., +62...)'
  };
}

/**
 * Validates Email Address format
 */
export function validateEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
