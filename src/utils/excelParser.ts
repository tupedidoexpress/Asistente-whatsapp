import * as XLSX from 'xlsx';
import { DataRow, MergedMessage } from '../types';

export interface ParseResult {
  columns: string[];
  rows: DataRow[];
  fileName: string;
  rowCount: number;
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file from a browser File object
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('El archivo no contiene hojas de cálculo legibles.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: '',
    raw: false,
  });

  if (!rawJson || rawJson.length === 0) {
    throw new Error('El archivo está vacío o no contiene filas con encabezados.');
  }

  // Extract column headers from first row keys
  const columns = Object.keys(rawJson[0]).filter((col) => !col.startsWith('__'));
  const rows: DataRow[] = rawJson.map((row, index) => ({
    __id: `row-${Date.now()}-${index}`,
    ...row,
  }));

  return {
    columns,
    rows,
    fileName: file.name,
    rowCount: rows.length,
  };
}

/**
 * Parses raw pasted text (e.g. copied from Google Sheets, Excel or CSV)
 */
export function parsePastedText(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('El texto ingresado está vacío.');
  }

  // Detect delimiter: tab or comma or semicolon
  const firstLine = trimmed.split(/\r?\n/)[0];
  let delimiter = '\t';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  } else if (firstLine.includes(',')) {
    delimiter = ',';
  }

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('Se requiere al menos una fila de encabezados y una fila de datos.');
  }

  const columns = lines[0].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
  const rows: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));
    const rowObj: DataRow = { __id: `row-${Date.now()}-${i}` };
    columns.forEach((col, idx) => {
      rowObj[col] = values[idx] ?? '';
    });
    rows.push(rowObj);
  }

  return {
    columns,
    rows,
    fileName: 'Datos_Pegados.tsv',
    rowCount: rows.length,
  };
}

/**
 * Exports merged messages and WhatsApp links to an Excel spreadsheet
 */
export function exportMergedToExcel(messages: MergedMessage[], fileName: string = 'Campana_WhatsApp_Personalizada.xlsx') {
  const exportData = messages.map((m, idx) => ({
    '#': idx + 1,
    'Destinatario': m.recipientName,
    'Teléfono Original': m.recipientPhone,
    'Teléfono Limpio (WhatsApp)': m.cleanPhone,
    'Mensaje Personalizado': m.renderedText,
    'Enlace Directo WhatsApp': m.whatsappUrl,
    'Estado Envío': m.status === 'sent' ? 'Enviado' : m.status === 'skipped' ? 'Omitido' : 'Pendiente',
    ...m.data,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  // Auto column widths
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 45 },
    { wch: 40 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Envíos WhatsApp');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Exports merged messages to a clean CSV
 */
export function exportMergedToCsv(messages: MergedMessage[], fileName: string = 'Campana_WhatsApp_Personalizada.csv') {
  const exportData = messages.map((m, idx) => ({
    Numero: idx + 1,
    Destinatario: m.recipientName,
    Telefono: m.cleanPhone || m.recipientPhone,
    Mensaje: m.renderedText,
    Link_WhatsApp: m.whatsappUrl,
    Estado: m.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
