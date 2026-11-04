import { CountryCode } from '../types';

export const POPULAR_COUNTRY_CODES: CountryCode[] = [
  { country: 'Sin prefijo (automático/ya incluido)', code: 'AUTO', prefix: '', flag: '🌐' },
  { country: 'México', code: 'MX', prefix: '52', flag: '🇲🇽' },
  { country: 'Argentina', code: 'AR', prefix: '54', flag: '🇦🇷' },
  { country: 'Colombia', code: 'CO', prefix: '57', flag: '🇨🇴' },
  { country: 'España', code: 'ES', prefix: '34', flag: '🇪🇸' },
  { country: 'Perú', code: 'PE', prefix: '51', flag: '🇵🇪' },
  { country: 'Chile', code: 'CL', prefix: '56', flag: '🇨🇱' },
  { country: 'Estados Unidos / Canadá', code: 'US', prefix: '1', flag: '🇺🇸' },
  { country: 'Ecuador', code: 'EC', prefix: '593', flag: '🇪🇨' },
  { country: 'Venezuela', code: 'VE', prefix: '58', flag: '🇻🇪' },
  { country: 'Guatemala', code: 'GT', prefix: '502', flag: '🇬🇹' },
  { country: 'Bolivia', code: 'BO', prefix: '591', flag: '🇧🇴' },
  { country: 'República Dominicana', code: 'DO', prefix: '1', flag: '🇩🇴' },
  { country: 'Costa Rica', code: 'CR', prefix: '506', flag: '🇨🇷' },
  { country: 'Panamá', code: 'PA', prefix: '507', flag: '🇵🇦' },
  { country: 'Uruguay', code: 'UY', prefix: '598', flag: '🇺🇾' },
  { country: 'Paraguay', code: 'PY', prefix: '595', flag: '🇵🇾' },
  { country: 'El Salvador', code: 'SV', prefix: '503', flag: '🇸🇻' },
  { country: 'Honduras', code: 'HN', prefix: '504', flag: '🇭🇳' },
];

/**
 * Sanitizes phone numbers for WhatsApp URL (only digits)
 * If number does not start with country prefix and a defaultPrefix is specified, prepends it.
 */
export function cleanPhoneNumber(rawPhone: string | number | undefined | null, defaultPrefix: string = ''): string {
  if (rawPhone === undefined || rawPhone === null) return '';
  const str = String(rawPhone).trim();
  
  // Extract all digits
  let digits = str.replace(/\D/g, '');
  if (!digits) return '';

  // If phone already starts with '00', remove leading '00'
  if (digits.startsWith('00')) {
    digits = digits.substring(2);
  }

  // If a default prefix is chosen and digits don't already start with it (and digits are short, e.g. local 8-10 digits)
  if (defaultPrefix && defaultPrefix !== '') {
    // If digits are already 11-13 digits long and match prefix, leave it
    if (!digits.startsWith(defaultPrefix) && digits.length <= 11) {
      digits = defaultPrefix + digits;
    }
  }

  return digits;
}

/**
 * Formats a WhatsApp Web/App click-to-chat URL
 */
export function buildWhatsAppUrl(cleanPhone: string, message: string): string {
  const encodedText = encodeURIComponent(message);
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
