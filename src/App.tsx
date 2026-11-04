/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TemplateEditor } from './components/TemplateEditor';
import { DataImporter } from './components/DataImporter';
import { DispatchCenter } from './components/DispatchCenter';
import { TEMPLATE_PRESETS } from './data/presets';
import { VariableConfig, VariableTransform, DataRow, TemplatePreset, DispatchStatus, MergedMessage } from './types';
import { extractVariables, generateMergedMessages } from './utils/mergeEngine';
import { PenTool, Database, Send } from 'lucide-react';

const STORAGE_KEY_TEMPLATE = 'automerge_template';
const STORAGE_KEY_THEME = 'automerge_theme';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved !== null) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Active navigation step
  const [currentTab, setCurrentTab] = useState<'template' | 'data' | 'dispatch'>('template');

  // Initial preset
  const defaultPreset = TEMPLATE_PRESETS[0];

  // Template state (loaded from localStorage or preset)
  const [template, setTemplate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATE);
      if (saved) return saved;
    }
    return defaultPreset.template;
  });

  // Raw data rows and columns
  const [columns, setColumns] = useState<string[]>(defaultPreset.sampleColumns);
  const [rows, setRows] = useState<DataRow[]>(() =>
    defaultPreset.sampleData.map((d, i) => ({
      __id: `row-init-${i}`,
      ...d,
    }))
  );

  // Column associations
  const [phoneColumn, setPhoneColumn] = useState<string>(defaultPreset.phoneColumn);
  const [nameColumn, setNameColumn] = useState<string>(defaultPreset.nameColumn);
  const [defaultCountryPrefix, setDefaultCountryPrefix] = useState<string>('');

  // Row dispatch statuses map: rowId -> DispatchStatus
  const [dispatchStatuses, setDispatchStatuses] = useState<Record<string, DispatchStatus>>({});

  // Variable configs with mapping and transforms
  const [variables, setVariables] = useState<VariableConfig[]>(() => {
    const extracted = extractVariables(defaultPreset.template);
    return extracted.map((name) => {
      // Auto match column
      const nameClean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchCol = defaultPreset.sampleColumns.find((c) => {
        const cClean = c.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cClean === nameClean || cClean.includes(nameClean) || nameClean.includes(cClean);
      });
      return {
        name,
        mappedColumn: matchCol || (defaultPreset.sampleColumns[0] ?? ''),
        transform: name.toLowerCase().includes('monto') ? 'currency' : 'none',
        fallbackValue: '',
      };
    });
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [darkMode]);

  // Persist template
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEMPLATE, template);
  }, [template]);

  // Sync extracted variables whenever template text changes
  useEffect(() => {
    const extractedNames = extractVariables(template);
    setVariables((prevVars) => {
      // Keep existing configs if they still exist in the template
      const currentMap = new Map(prevVars.map((v) => [v.name, v]));
      return extractedNames.map((name) => {
        if (currentMap.has(name)) {
          return currentMap.get(name)!;
        }
        // Fuzzy auto match with current columns
        const nameClean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchCol = columns.find((c) => {
          const cClean = c.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cClean === nameClean || cClean.includes(nameClean) || nameClean.includes(cClean);
        });
        return {
          name,
          mappedColumn: matchCol || (columns.length > 0 ? columns[0] : ''),
          transform: name.toLowerCase().includes('monto') ? 'currency' : 'none',
          fallbackValue: '',
        };
      });
    });
  }, [template, columns]);

  // Generate merged messages
  const mergedMessages: MergedMessage[] = useMemo(() => {
    const generated = generateMergedMessages(
      template,
      variables,
      rows,
      phoneColumn,
      nameColumn,
      defaultCountryPrefix
    );

    // Apply recorded statuses
    return generated.map((msg) => ({
      ...msg,
      status: dispatchStatuses[msg.id] || 'pending',
    }));
  }, [template, variables, rows, phoneColumn, nameColumn, defaultCountryPrefix, dispatchStatuses]);

  // Count of sent
  const sentCount = useMemo(() => {
    return mergedMessages.filter((m) => m.status === 'sent').length;
  }, [mergedMessages]);

  // Load a template preset
  const handleLoadPreset = (preset: TemplatePreset) => {
    setTemplate(preset.template);
    setColumns(preset.sampleColumns);
    const newRows: DataRow[] = preset.sampleData.map((d, i) => ({
      __id: `row-${preset.id}-${i}-${Date.now()}`,
      ...d,
    }));
    setRows(newRows);
    setPhoneColumn(preset.phoneColumn);
    setNameColumn(preset.nameColumn);
    setDispatchStatuses({});

    const extracted = extractVariables(preset.template);
    const mapped: VariableConfig[] = extracted.map((name) => {
      const nameClean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchCol = preset.sampleColumns.find((c) => {
        const cClean = c.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cClean === nameClean || cClean.includes(nameClean) || nameClean.includes(cClean);
      });
      return {
        name,
        mappedColumn: matchCol || preset.sampleColumns[0],
        transform: (name.toLowerCase().includes('monto') ? 'currency' : 'none') as VariableTransform,
        fallbackValue: '',
      };
    });
    setVariables(mapped);
  };

  // Reset all
  const handleReset = () => {
    if (window.confirm('¿Deseas reiniciar la plantilla y los datos?')) {
      handleLoadPreset(TEMPLATE_PRESETS[0]);
      setCurrentTab('template');
    }
  };

  // Single status update
  const handleUpdateStatus = (id: string, status: DispatchStatus) => {
    setDispatchStatuses((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  // All statuses update
  const handleUpdateAllStatuses = (status: DispatchStatus) => {
    const updated: Record<string, DispatchStatus> = {};
    rows.forEach((r) => {
      updated[r.__id] = status;
    });
    setDispatchStatuses(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* 3-Zone Header Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLoadPreset={handleLoadPreset}
        onReset={handleReset}
        rowsCount={rows.length}
        variablesCount={variables.length}
        sentCount={sentCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8">
        {currentTab === 'template' && (
          <TemplateEditor
            template={template}
            onChangeTemplate={setTemplate}
            variables={variables}
            onChangeVariables={setVariables}
            onProceedToData={() => setCurrentTab('data')}
          />
        )}

        {currentTab === 'data' && (
          <DataImporter
            columns={columns}
            rows={rows}
            variables={variables}
            phoneColumn={phoneColumn}
            nameColumn={nameColumn}
            defaultCountryPrefix={defaultCountryPrefix}
            onUpdateData={(newCols, newRows) => {
              setColumns(newCols);
              setRows(newRows);
              setDispatchStatuses({});
            }}
            onUpdateMapping={(updatedVars, pCol, nCol) => {
              setVariables(updatedVars);
              setPhoneColumn(pCol);
              setNameColumn(nCol);
            }}
            onUpdateCountryPrefix={setDefaultCountryPrefix}
            onProceedToDispatch={() => setCurrentTab('dispatch')}
          />
        )}

        {currentTab === 'dispatch' && (
          <DispatchCenter
            messages={mergedMessages}
            onUpdateStatus={handleUpdateStatus}
            onUpdateAllStatuses={handleUpdateAllStatuses}
            onBackToData={() => setCurrentTab('data')}
          />
        )}
      </main>

      {/* Subdued Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-4 px-4 sm:px-6 text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>AutoMerge WhatsApp</span>
            <span aria-hidden="true">·</span>
            <span>Combinación de correspondencia local y segura</span>
          </div>
          <div>
            <span>Tus datos se procesan 100% en tu navegador</span>
          </div>
        </div>
      </footer>

      {/* Fixed Mobile Bottom Navigation Bar (Ergonomic thumb zone) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 sm:hidden">
        <div className="grid grid-cols-3 h-16 items-center px-2">
          <button
            type="button"
            onClick={() => setCurrentTab('template')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              currentTab === 'template'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800'
            }`}
          >
            <div className="relative">
              <PenTool className="w-5 h-5" />
              {variables.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {variables.length}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1">1. Plantilla</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('data')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              currentTab === 'data'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800'
            }`}
          >
            <div className="relative">
              <Database className="w-5 h-5" />
              {rows.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {rows.length}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1">2. Datos</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('dispatch')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              currentTab === 'dispatch'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800'
            }`}
          >
            <div className="relative">
              <Send className="w-5 h-5" />
              {rows.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white font-mono text-[9px] px-1 h-4 rounded-full flex items-center justify-center">
                  {sentCount}/{rows.length}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1">3. Despacho</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
