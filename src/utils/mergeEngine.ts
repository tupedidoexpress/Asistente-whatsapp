import { VariableConfig, VariableTransform, DataRow, MergedMessage } from '../types';
import { cleanPhoneNumber, buildWhatsAppUrl } from './phoneUtils';

/**
 * Extracts variable names from template text.
 * Finds all patterns like {{variable}} or {variable}
 */
export function extractVariables(template: string): string[] {
  if (!template) return [];
  const regex = /\{\{([a-zA-Z0-9_\-\s]+)\}\}|\{([a-zA-Z0-9_\-\s]+)\}/g;
  const matches = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    const varName = (match[1] || match[2] || '').trim();
    if (varName) {
      matches.add(varName);
    }
  }

  return Array.from(matches);
}

/**
 * Transforms a raw string value according to selected format
 */
export function applyTransform(val: any, transform: VariableTransform): string {
  if (val === undefined || val === null) return '';
  const str = String(val).trim();
  if (!str) return '';

  switch (transform) {
    case 'titleCase':
      return str
        .toLowerCase()
        .replace(/(?:^|\s|\/|-)\S/g, (char) => char.toUpperCase());

    case 'upperCase':
      return str.toUpperCase();

    case 'lowerCase':
      return str.toLowerCase();

    case 'currency': {
      // Strip currency signs and commas, parse as float
      const cleaned = str.replace(/[^\d.-]/g, '');
      const num = parseFloat(cleaned);
      if (isNaN(num)) return str;
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
      }).format(num);
    }

    case 'date': {
      // Check if it's already a Date or date string
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
      return str;
    }

    case 'none':
    default:
      return str;
  }
}

/**
 * Replaces a selected phrase or word in template with a variable tag {{variableName}}
 */
export function replaceTextWithVariable(
  fullText: string,
  targetPhrase: string,
  variableName: string,
  replaceAll: boolean = true,
  selectionStart?: number,
  selectionEnd?: number
): string {
  const cleanVarName = variableName.trim().replace(/[^a-zA-Z0-9_]/g, '_') || 'variable';
  const tag = `{{${cleanVarName}}}`;

  if (!replaceAll && selectionStart !== undefined && selectionEnd !== undefined && selectionStart !== selectionEnd) {
    // Replace only selection slice
    return fullText.slice(0, selectionStart) + tag + fullText.slice(selectionEnd);
  }

  // Replace all occurrences of targetPhrase (case insensitive or exact)
  if (!targetPhrase) return fullText;
  const escaped = targetPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'g');
  return fullText.replace(regex, tag);
}

/**
 * Generates merged message instances from template and rows
 */
export function generateMergedMessages(
  template: string,
  variables: VariableConfig[],
  rows: DataRow[],
  phoneColumn: string = '',
  nameColumn: string = '',
  defaultCountryPrefix: string = ''
): MergedMessage[] {
  return rows.map((row, idx) => {
    let text = template;
    const missing: string[] = [];

    // Replace all variable instances
    variables.forEach((v) => {
      const colName = v.mappedColumn;
      let rawVal = colName && row[colName] !== undefined ? row[colName] : undefined;

      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
        if (v.fallbackValue && v.fallbackValue.trim() !== '') {
          rawVal = v.fallbackValue;
        } else {
          missing.push(v.name);
          rawVal = `[${v.name}]`;
        }
      } else {
        rawVal = applyTransform(rawVal, v.transform);
      }

      // Replace patterns: {{name}} or {name}
      const safeName = v.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\{\\{\\s*${safeName}\\s*\\}\\}|\\{\\s*${safeName}\\s*\\}`, 'g');
      text = text.replace(regex, String(rawVal));
    });

    // Detect recipient info
    const recipientPhoneRaw = phoneColumn && row[phoneColumn] !== undefined ? String(row[phoneColumn]) : '';
    const recipientName = nameColumn && row[nameColumn] !== undefined ? String(row[nameColumn]) : `Contacto #${idx + 1}`;
    const cleanPhone = cleanPhoneNumber(recipientPhoneRaw, defaultCountryPrefix);
    const whatsappUrl = buildWhatsAppUrl(cleanPhone, text);

    return {
      id: row.__id || `row-${idx}`,
      rowIndex: idx,
      data: row,
      renderedText: text,
      recipientPhone: recipientPhoneRaw,
      recipientName,
      cleanPhone,
      whatsappUrl,
      status: 'pending',
      missingVariables: missing,
    };
  });
}
