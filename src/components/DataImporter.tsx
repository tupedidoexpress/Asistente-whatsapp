import React, { useState, useRef } from 'react';
import { VariableConfig, DataRow } from '../types';
import { POPULAR_COUNTRY_CODES } from '../utils/phoneUtils';
import { parseFile, parsePastedText } from '../utils/excelParser';
import {
  Upload,
  FileSpreadsheet,
  ClipboardList,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Phone,
  User,
  LayoutGrid,
  List,
  Edit2,
  Check,
  X,
} from 'lucide-react';

interface DataImporterProps {
  columns: string[];
  rows: DataRow[];
  variables: VariableConfig[];
  phoneColumn: string;
  nameColumn: string;
  defaultCountryPrefix: string;
  onUpdateData: (columns: string[], rows: DataRow[], fileName?: string) => void;
  onUpdateMapping: (updatedVariables: VariableConfig[], phoneCol: string, nameCol: string) => void;
  onUpdateCountryPrefix: (prefix: string) => void;
  onProceedToDispatch: () => void;
}

export const DataImporter: React.FC<DataImporterProps> = ({
  columns,
  rows,
  variables,
  phoneColumn,
  nameColumn,
  defaultCountryPrefix,
  onUpdateData,
  onUpdateMapping,
  onUpdateCountryPrefix,
  onProceedToDispatch,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingCell, setEditingCell] = useState<{ rowId: string; col: string } | null>(null);
  const [tempCellValue, setTempCellValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileViewStyle, setMobileViewStyle] = useState<'cards' | 'table'>('cards');

  // File drop/upload handler
  const handleFileUpload = async (file: File) => {
    try {
      setErrorMessage(null);
      const result = await parseFile(file);
      onUpdateData(result.columns, result.rows, result.fileName);
      autoMapColumns(result.columns);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el archivo Excel/CSV.');
    }
  };

  // Paste text handler
  const handleProcessPastedText = () => {
    try {
      setErrorMessage(null);
      const result = parsePastedText(pastedContent);
      onUpdateData(result.columns, result.rows, 'Datos_Pegados.tsv');
      autoMapColumns(result.columns);
      setShowPasteModal(false);
      setPastedContent('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el texto pegado.');
    }
  };

  // Fuzzy auto mapping
  const autoMapColumns = (cols: string[]) => {
    const updatedVars = variables.map((v) => {
      const vClean = v.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = cols.find((c) => {
        const cClean = c.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cClean === vClean || cClean.includes(vClean) || vClean.includes(cClean);
      });
      return {
        ...v,
        mappedColumn: match || (cols.length > 0 ? cols[0] : ''),
      };
    });

    const detectedPhone =
      cols.find((c) => {
        const lower = c.toLowerCase();
        return lower.includes('tel') || lower.includes('cel') || lower.includes('phone') || lower.includes('whatsapp') || lower.includes('movil');
      }) || (cols.length > 0 ? cols[0] : '');

    const detectedName =
      cols.find((c) => {
        const lower = c.toLowerCase();
        return lower.includes('nom') || lower.includes('name') || lower.includes('client') || lower.includes('destinatario');
      }) || (cols.length > 0 ? cols[0] : '');

    onUpdateMapping(updatedVars, detectedPhone, detectedName);
  };

  // Change mapping for single variable
  const handleVariableColChange = (varName: string, newCol: string) => {
    const updated = variables.map((v) => (v.name === varName ? { ...v, mappedColumn: newCol } : v));
    onUpdateMapping(updated, phoneColumn, nameColumn);
  };

  // Edit cell in data table
  const saveCellEdit = () => {
    if (!editingCell) return;
    const updatedRows = rows.map((r) => {
      if (r.__id === editingCell.rowId) {
        return { ...r, [editingCell.col]: tempCellValue };
      }
      return r;
    });
    onUpdateData(columns, updatedRows);
    setEditingCell(null);
  };

  // Add new empty row
  const handleAddRow = () => {
    const newRow: DataRow = { __id: `row-${Date.now()}` };
    columns.forEach((c) => {
      newRow[c] = '';
    });
    const updated = [newRow, ...rows];
    onUpdateData(columns, updated);
  };

  // Delete row
  const handleDeleteRow = (rowId: string) => {
    const updated = rows.filter((r) => r.__id !== rowId);
    onUpdateData(columns, updated);
  };

  // Filtered rows for search
  const filteredRows = rows.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(r).some((v) => String(v).toLowerCase().includes(term));
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            2. Carga de Lista Masiva y Mapeo de Columnas
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Importa tus contactos desde un archivo Excel (.xlsx, .xls) o CSV, o pega directamente desde tu hoja de cálculo.
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToDispatch}
          disabled={rows.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white rounded-lg text-sm font-semibold transition-all shadow-xs whitespace-nowrap w-full sm:w-auto"
        >
          <span>Ir al Despacho de WhatsApp</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="font-semibold underline shrink-0">
            Cerrar
          </button>
        </div>
      )}

      {/* Upload Zone & Quick Paste */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Drag and Drop Zone (2 cols) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-2 border-2 border-dashed rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 sm:mb-3">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Toca o arrastra tu archivo Excel o CSV
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            Soporta formatos .xlsx, .xls y .csv con encabezados en la primera fila.
          </p>
        </div>

        {/* Paste from Clipboard Button & Info Card (1 col) */}
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Copiar y Pegar Celdas
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Copia una tabla desde Google Sheets o Excel y pégala aquí directamente.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPasteModal(true)}
            className="w-full py-2.5 px-3 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:scale-[0.98] text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-2xs min-h-[40px]"
          >
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <span>Pegar desde Portapapeles</span>
          </button>
        </div>
      </div>

      {/* Column Mapping & Phone Settings Bar */}
      {columns.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Mapeo de Variables con Columnas de tu Excel
              </h3>
            </div>

            <button
              type="button"
              onClick={() => autoMapColumns(columns)}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium self-start sm:self-auto py-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Auto-emparejar por similitud</span>
            </button>
          </div>

          {/* Primary WhatsApp Channels (Phone, Name, Country Code) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Columna de Teléfono / WhatsApp:</span>
              </label>
              <select
                value={phoneColumn}
                onChange={(e) => onUpdateMapping(variables, e.target.value, nameColumn)}
                className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:ring-1 focus:ring-emerald-500 min-h-[40px]"
              >
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Columna de Nombre Destinatario:</span>
              </label>
              <select
                value={nameColumn}
                onChange={(e) => onUpdateMapping(variables, phoneColumn, e.target.value)}
                className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:ring-1 focus:ring-emerald-500 min-h-[40px]"
              >
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                <span>🌐 Prefijo País (si falta en el número):</span>
              </label>
              <select
                value={defaultCountryPrefix}
                onChange={(e) => onUpdateCountryPrefix(e.target.value)}
                className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:ring-1 focus:ring-emerald-500 min-h-[40px]"
              >
                {POPULAR_COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.prefix}>
                    {item.flag} {item.country} {item.prefix ? `(+${item.prefix})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variables to Columns Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Mapeo de Variables de la Plantilla:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {variables.map((v) => (
                <div
                  key={v.name}
                  className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {'{{' + v.name + '}}'}
                    </span>
                    <span className="text-[10px] text-neutral-400">columna:</span>
                  </div>
                  <select
                    value={v.mappedColumn || ''}
                    onChange={(e) => handleVariableColChange(v.name, e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 focus:ring-1 focus:ring-emerald-500 font-medium min-h-[36px]"
                  >
                    <option value="" disabled>
                      Seleccionar columna...
                    </option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Table / Cards Section */}
      {rows.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs space-y-3 p-3.5 sm:p-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Contactos ({rows.length} filas)
              </span>

              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg text-xs font-medium transition-colors min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Fila</span>
              </button>

              {/* Mobile View Toggle */}
              <div className="flex sm:hidden items-center border border-neutral-300 dark:border-neutral-700 rounded-lg p-0.5 bg-neutral-100 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={() => setMobileViewStyle('cards')}
                  title="Vista tarjetas"
                  className={`p-1.5 rounded ${mobileViewStyle === 'cards' ? 'bg-white dark:bg-neutral-700 shadow-2xs' : 'text-neutral-500'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewStyle('table')}
                  title="Vista tabla"
                  className={`p-1.5 rounded ${mobileViewStyle === 'table' ? 'bg-white dark:bg-neutral-700 shadow-2xs' : 'text-neutral-500'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar en datos..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 min-h-[36px]"
                />
              </div>

              <select
                aria-label="Filas por página"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-neutral-700 dark:text-neutral-300 min-h-[36px]"
              >
                <option value={5}>5 / pág</option>
                <option value={10}>10 / pág</option>
                <option value={25}>25 / pág</option>
              </select>
            </div>
          </div>

          {/* MOBILE CARDS VIEW (Clean touch experience on phones) */}
          <div className={`${mobileViewStyle === 'cards' ? 'block sm:hidden' : 'hidden'} space-y-2.5`}>
            {paginatedRows.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                No se encontraron contactos.
              </div>
            ) : (
              paginatedRows.map((row, idx) => {
                const rowNumber = (currentPage - 1) * rowsPerPage + idx + 1;
                const contactName = nameColumn && row[nameColumn] ? String(row[nameColumn]) : `Fila #${rowNumber}`;
                const contactPhone = phoneColumn && row[phoneColumn] ? String(row[phoneColumn]) : 'Sin teléfono';

                return (
                  <div
                    key={row.__id}
                    className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-neutral-400 tabular-nums">#{rowNumber}</span>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{contactName}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.__id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded"
                        title="Eliminar fila"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                      <Phone className="w-3 h-3" />
                      <span>{contactPhone}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60 text-[11px]">
                      {columns.slice(0, 4).map((col) => (
                        <div key={col} className="truncate">
                          <span className="text-neutral-400">{col}: </span>
                          <span className="text-neutral-700 dark:text-neutral-300 font-medium">{String(row[col] ?? '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP/TABLET TABLE VIEW (also togglable on mobile) */}
          <div className={`${mobileViewStyle === 'cards' ? 'hidden sm:block' : 'block'} overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100/80 dark:bg-neutral-800/90 text-neutral-600 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  {columns.map((c) => (
                    <th key={c} className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span>{c}</span>
                        {c === phoneColumn && (
                          <span className="text-[10px] text-emerald-600 font-normal">[WhatsApp]</span>
                        )}
                        {c === nameColumn && (
                          <span className="text-[10px] text-emerald-600 font-normal">[Nombre]</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 w-12 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200 font-sans">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="py-6 text-center text-neutral-400">
                      No se encontraron filas que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, idx) => {
                    const rowNumber = (currentPage - 1) * rowsPerPage + idx + 1;
                    return (
                      <tr
                        key={row.__id}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="py-2 px-3 text-center font-mono tabular-nums text-neutral-400">
                          {rowNumber}
                        </td>
                        {columns.map((col) => {
                          const isEditing = editingCell?.rowId === row.__id && editingCell?.col === col;
                          return (
                            <td
                              key={col}
                              onClick={() => {
                                if (!isEditing) {
                                  setEditingCell({ rowId: row.__id, col });
                                  setTempCellValue(String(row[col] ?? ''));
                                }
                              }}
                              className="py-2 px-3 max-w-xs truncate cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                            >
                              {isEditing ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={tempCellValue}
                                  onChange={(e) => setTempCellValue(e.target.value)}
                                  onBlur={saveCellEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveCellEdit();
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                  className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-neutral-900 border border-emerald-500 rounded focus:outline-hidden"
                                />
                              ) : (
                                <span className={col === phoneColumn ? 'font-mono text-neutral-900 dark:text-neutral-100 font-medium' : ''}>
                                  {row[col] !== undefined && row[col] !== '' ? String(row[col]) : <em className="text-neutral-400">vacío</em>}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.__id)}
                            title="Eliminar fila"
                            className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-2 pt-2">
            <span>
              {Math.min(filteredRows.length, (currentPage - 1) * rowsPerPage + 1)} -{' '}
              {Math.min(filteredRows.length, currentPage * rowsPerPage)} de {filteredRows.length} filas
            </span>
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors min-h-[36px]"
              >
                Anterior
              </button>
              <span className="font-mono tabular-nums px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors min-h-[36px]"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 sm:py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center space-y-2 sm:space-y-3 p-4">
          <FileSpreadsheet className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-300 dark:text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No hay datos cargados todavía
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Sube un archivo de Excel o CSV arriba, o pega datos desde tu portapapeles para generar los mensajes masivos.
          </p>
        </div>
      )}

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Pegar Datos desde Excel o Sheets
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Selecciona tus celdas en tu hoja de cálculo, presiona <kbd className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700">Ctrl+C</kbd>, y pégalas aquí:
              </p>
            </div>

            <textarea
              rows={7}
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Nombre&#9;Telefono&#9;Monto&#9;Fecha&#10;Carlos&#9;525512345678&#9;1500&#9;15/11/2026&#10;Valeria&#9;525598765432&#9;3200&#9;18/11/2026"
              className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowPasteModal(false);
                  setPastedContent('');
                }}
                className="px-3 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors min-h-[36px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessPastedText}
                disabled={!pastedContent.trim()}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white rounded-lg transition-all min-h-[36px]"
              >
                Procesar y Cargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
