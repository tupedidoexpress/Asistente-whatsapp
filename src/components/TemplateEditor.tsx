import React, { useState, useRef } from 'react';
import { VariableConfig, VariableTransform } from '../types';
import { Sparkles, Tag, Bold, Italic, Strikethrough, Code, Smile, ChevronRight, HelpCircle, AlertCircle, X } from 'lucide-react';
import { replaceTextWithVariable } from '../utils/mergeEngine';

interface TemplateEditorProps {
  template: string;
  onChangeTemplate: (newTemplate: string) => void;
  variables: VariableConfig[];
  onChangeVariables: (newVariables: VariableConfig[]) => void;
  onProceedToData: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onChangeTemplate,
  variables,
  onChangeVariables,
  onProceedToData,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [newVarName, setNewVarName] = useState('');
  const [customVarInput, setCustomVarInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Common WhatsApp emojis
  const COMMON_EMOJIS = ['✨', '👋', '📦', '🚚', '🗓️', '💳', '📍', '🎁', '🛍️', '⚠️', '⭐', '✅', '🔥', '🚀', '📞'];

  // Handle text selection inside the template editor
  const handleSelect = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = template.substring(start, end).trim();
    if (text && text.length > 0 && text.length < 80) {
      setSelectedText(text);
      setSelectionRange({ start, end });
      // Suggest clean variable name based on text
      const cleanSuggestion = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'variable';
      setNewVarName(cleanSuggestion);
    } else {
      setSelectedText('');
    }
  };

  // Convert selected phrase into {{variable}}
  const handleConvertSelection = (replaceAll: boolean) => {
    if (!selectedText) return;
    const varName = newVarName.trim().replace(/[^a-zA-Z0-9_]/g, '_') || 'variable';
    
    const updated = replaceTextWithVariable(
      template,
      selectedText,
      varName,
      replaceAll,
      selectionRange.start,
      selectionRange.end
    );
    onChangeTemplate(updated);
    setSelectedText('');
    setNewVarName('');

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  // Insert a tag at current cursor position
  const insertAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const updated = template.substring(0, start) + textToInsert + template.substring(end);
    onChangeTemplate(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + textToInsert.length;
      }
    }, 50);
  };

  // Wrap selection with WhatsApp formatting markers
  const wrapSelectionWith = (marker: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = template.substring(start, end);

    if (start === end) {
      insertAtCursor(`${marker}texto${marker}`);
    } else {
      const updated = template.substring(0, start) + `${marker}${selected}${marker}` + template.substring(end);
      onChangeTemplate(updated);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = start + marker.length;
          textareaRef.current.selectionEnd = end + marker.length;
        }
      }, 50);
    }
  };

  // Update transformation for a variable
  const updateVariableTransform = (varName: string, transform: VariableTransform) => {
    const updated = variables.map((v) => (v.name === varName ? { ...v, transform } : v));
    onChangeVariables(updated);
  };

  // Update fallback value for a variable
  const updateVariableFallback = (varName: string, fallbackValue: string) => {
    const updated = variables.map((v) => (v.name === varName ? { ...v, fallbackValue } : v));
    onChangeVariables(updated);
  };

  // Add custom variable
  const handleAddCustomVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVarInput.trim()) return;
    const clean = customVarInput.trim().replace(/[^a-zA-Z0-9_]/g, '_');
    insertAtCursor(`{{${clean}}}`);
    setCustomVarInput('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            1. Redacción de Plantilla y Definición de Variables
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Escribe tu mensaje y <span className="font-semibold text-neutral-900 dark:text-neutral-200">selecciona cualquier palabra o frase</span> para convertirla en variable dinámica, o inserta etiquetas directamente.
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToData}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-lg text-sm font-semibold transition-all shadow-xs whitespace-nowrap w-full sm:w-auto"
        >
          <span>Continuar a Datos</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Main Editor Section (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* WhatsApp Text Formatting Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-t-xl border border-b-0 border-neutral-200 dark:border-neutral-700 text-xs">
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium px-1 text-[11px] sm:text-xs">Formato:</span>
              <button
                type="button"
                onClick={() => wrapSelectionWith('*')}
                title="Negrita (*texto*)"
                className="w-8 h-8 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold transition-colors"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => wrapSelectionWith('_')}
                title="Cursiva (_texto_)"
                className="w-8 h-8 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 italic transition-colors"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => wrapSelectionWith('~')}
                title="Tachado (~texto~)"
                className="w-8 h-8 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 line-through transition-colors"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => wrapSelectionWith('```')}
                title="Monoespaciado (```texto```)"
                className="w-8 h-8 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-0.5" />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Insertar emoji común"
                  className="px-2 py-1 h-8 sm:h-7 rounded flex items-center gap-1 hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors text-xs"
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Emojis</span>
                </button>

                {showEmojiPicker && (
                  <div className="absolute top-9 left-0 z-30 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2 shadow-xl grid grid-cols-5 gap-1.5 w-52">
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          insertAtCursor(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="w-9 h-9 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded flex items-center justify-center text-base transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
              {template.length} caracteres
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={template}
              onChange={(e) => onChangeTemplate(e.target.value)}
              onSelect={handleSelect}
              onKeyUp={handleSelect}
              onMouseUp={handleSelect}
              rows={10}
              placeholder="Escribe tu mensaje aquí... Por ejemplo:&#10;Hola Juan, te recordamos que tu pedido #402 vence el 12 de Noviembre por un valor de $50 USD..."
              className="w-full p-3 sm:p-4 rounded-b-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans text-base sm:text-sm leading-relaxed resize-y shadow-xs"
            />
          </div>

          {/* HIGHLIGHT & CONVERT MODAL / FLOATING CALLOUT */}
          {selectedText && (
            <div className="p-3.5 sm:p-4 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl transition-all shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Convertir texto seleccionado en variable
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedText('')}
                  className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="text-xs text-neutral-700 dark:text-neutral-300 truncate">
                  Texto marcado: <span className="font-mono bg-white dark:bg-neutral-900 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 font-semibold text-emerald-800 dark:text-emerald-300">"{selectedText}"</span>
                </div>
                <span className="hidden sm:inline text-neutral-400">→</span>
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-xs text-neutral-500 font-mono font-medium">{'{{'}</span>
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="nombre_variable"
                    className="flex-1 px-2.5 py-1.5 text-xs sm:text-sm font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-neutral-500 font-mono font-medium">{'}}'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleConvertSelection(false)}
                  className="w-full sm:w-auto px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors text-center"
                >
                  Reemplazar esta selección
                </button>
                <button
                  type="button"
                  onClick={() => handleConvertSelection(true)}
                  className="w-full sm:w-auto px-3 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md text-xs font-semibold transition-colors text-center"
                >
                  Reemplazar todas las apariciones
                </button>
              </div>
            </div>
          )}

          {/* Quick Insert Common Variables Bar */}
          <div className="p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2.5">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 gap-1">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Inserción rápida de etiquetas
              </span>
              <span className="text-[11px] text-neutral-500">Toca para añadir en el cursor</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {['nombre', 'telefono', 'monto', 'pedido', 'fecha', 'producto', 'ciudad'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertAtCursor(`{{${tag}}}`)}
                  className="px-2.5 py-1.5 min-h-[36px] text-xs font-mono bg-white dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-neutral-700 hover:text-emerald-700 dark:hover:text-emerald-400 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 transition-colors shadow-2xs flex items-center"
                >
                  + {'{{' + tag + '}}'}
                </button>
              ))}
            </div>

            {/* Custom Variable Form */}
            <form onSubmit={handleAddCustomVar} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 shrink-0">Otra etiqueta:</span>
              <input
                type="text"
                value={customVarInput}
                onChange={(e) => setCustomVarInput(e.target.value)}
                placeholder="ej: descuento, asesor, factura"
                className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 sm:py-1.5 bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
              >
                Insertar
              </button>
            </form>
          </div>
        </div>

        {/* Variables Configuration & Transformations Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Variables Detectadas ({variables.length})
                </h3>
              </div>
              <span className="text-[11px] text-neutral-500">Auto-extraídas</span>
            </div>

            {variables.length === 0 ? (
              <div className="py-6 sm:py-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Aún no hay variables en la plantilla. Selecciona palabras en el texto de la izquierda o escribe <code className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{'{{nombre}}'}</code> para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {variables.map((variable) => (
                  <div
                    key={variable.name}
                    className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/80 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{'{{' + variable.name + '}}'}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Columna en Paso 2</span>
                    </div>

                    {/* Transform dropdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                          Transformación:
                        </label>
                        <select
                          value={variable.transform}
                          onChange={(e) => updateVariableTransform(variable.name, e.target.value as VariableTransform)}
                          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 min-h-[36px]"
                        >
                          <option value="none">Sin transformación</option>
                          <option value="titleCase">Capitalizar (Juan Pérez)</option>
                          <option value="upperCase">MAYÚSCULAS</option>
                          <option value="lowerCase">minúsculas</option>
                          <option value="currency">Moneda ($ 1,234.50)</option>
                          <option value="date">Fecha (DD/MM/AAAA)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                          Texto si está vacío:
                        </label>
                        <input
                          type="text"
                          value={variable.fallbackValue || ''}
                          onChange={(e) => updateVariableFallback(variable.name, e.target.value)}
                          placeholder="ej: Estimado cliente"
                          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 min-h-[36px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Practical Advice */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <HelpCircle className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
              <p>
                Los nombres de variables deben coincidir o mapearse con las columnas de tu Excel en el siguiente paso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
