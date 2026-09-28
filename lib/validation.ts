export interface PhoneValidationResult {
  isValid: boolean;
  cleanPhone: string;
  formattedDisplay: string;
  error?: string;
}

/**
 * Validates Indonesian WhatsApp / Mobile Phone Numbers.
 * Supports: 08xx, 628xx, +628xx with 10 to 14 digits.
 * Also supports valid international numbers starting with '+' (8-15 digits).
 */
export function validatePhoneNumber(phone?: string | null): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      cleanPhone: '',
      formattedDisplay: '',
      error: 'Nomor WhatsApp wajib diisi.'
    };
  }

  // Remove whitespace, dashes, dots, parentheses
  const cleaned = phone.trim().replace(/[\s\-\.\(\)]/g, '');

  if (!cleaned) {
    return {
      isValid: false,
      cleanPhone: '',
      formattedDisplay: '',
      error: 'Nomor WhatsApp tidak boleh kosong.'
    };
  }

  // Only digits and optional leading '+'
  if (!/^\+?[0-9]+$/.test(cleaned)) {
    return {
      isValid: false,
      cleanPhone: cleaned,
      formattedDisplay: cleaned,
      error: 'Nomor telepon hanya boleh berisi angka dan tanda +.'
    };
  }

  // Check if Indonesian format
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
        error: 'Nomor WhatsApp Indonesia harus diawali 08... atau +628...'
      };
    }

    // Standard Indonesian cellular length is 10 to 14 digits
    if (standardLocal.length < 10) {
      return {
        isValid: false,
        cleanPhone: cleaned,
        formattedDisplay: cleaned,
        error: `Nomor terlalu pendek (${standardLocal.length} digit). Nomor WhatsApp minimal 10 digit.`
      };
    }

    if (standardLocal.length > 14) {
      return {
        isValid: false,
        cleanPhone: cleaned,
        formattedDisplay: cleaned,
        error: `Nomor terlalu panjang (${standardLocal.length} digit). Nomor WhatsApp maksimal 14 digit.`
      };
    }

    // Check obviously fake repeating numbers (e.g. 08111111111, 08000000000)
    const suffix = standardLocal.slice(2);
    if (/^(.)\1{7,}$/.test(suffix)) {
      return {
        isValid: false,
        cleanPhone: cleaned,
        formattedDisplay: standardLocal,
        error: 'Nomor WhatsApp tidak valid (terlalu banyak angka berulang).'
      };
    }

    // Check sequential numbers like 08123456789
    if (standardLocal === '08123456789' || standardLocal === '081234567890') {
      return {
        isValid: false,
        cleanPhone: cleaned,
        formattedDisplay: standardLocal,
        error: 'Harap masukkan nomor WhatsApp aktif yang sesungguhnya.'
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
      error: 'Nomor internasional harus terdiri dari 8 hingga 15 digit angka.'
    };
  }

  return {
    isValid: false,
    cleanPhone: cleaned,
    formattedDisplay: cleaned,
    error: 'Format nomor WhatsApp tidak valid. Gunakan format diawali 08... atau +628...'
  };
}

/**
 * Validates Email Address format
 */
export function validateEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
