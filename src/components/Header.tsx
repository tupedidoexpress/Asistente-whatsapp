import React, { useState } from 'react';
import { MessageSquare, Sun, Moon, RotateCcw, Sparkles, ChevronDown, Check } from 'lucide-react';
import { TEMPLATE_PRESETS } from '../data/presets';
import { TemplatePreset } from '../types';

interface HeaderProps {
  currentTab: 'template' | 'data' | 'dispatch';
  onSelectTab: (tab: 'template' | 'data' | 'dispatch') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLoadPreset: (preset: TemplatePreset) => void;
  onReset: () => void;
  rowsCount: number;
  variablesCount: number;
  sentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  darkMode,
  onToggleDarkMode,
  onLoadPreset,
  onReset,
  rowsCount,
  variablesCount,
  sentCount,
}) => {
  const [mobilePresetsOpen, setMobilePresetsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-6 h-14 sm:h-16">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <a href="#" className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  AutoMerge <span className="text-emerald-600 dark:text-emerald-400">WA</span>
                </a>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden lg:block leading-tight">
                  Combinación de correspondencia y variables masivas
                </p>
              </div>
            </div>

            {/* Zone 2: Navigation Steps / Tabs (Hidden on small mobile, visible on sm+) */}
            <nav className="hidden sm:flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => onSelectTab('template')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
                  currentTab === 'template'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>1. Plantilla</span>
                <span className="hidden md:inline">& Variables</span>
                {variablesCount > 0 && (
                  <span className="font-mono px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-600 text-[10px] rounded text-neutral-700 dark:text-neutral-200">
                    {variablesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('data')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
                  currentTab === 'data'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>2. Datos</span>
                <span className="hidden md:inline">Excel/CSV</span>
                {rowsCount > 0 && (
                  <span className="font-mono px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-600 text-[10px] rounded text-neutral-700 dark:text-neutral-200">
                    {rowsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('dispatch')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
                  currentTab === 'dispatch'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>3. Despacho</span>
                <span className="hidden md:inline">WhatsApp</span>
                {rowsCount > 0 && (
                  <span
                    className={`font-mono px-1.5 py-0.2 text-[10px] rounded ${
                      currentTab === 'dispatch'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200'
                    }`}
                  >
                    {sentCount}/{rowsCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Mobile Tab Active Indicator (Visible only on <sm) */}
            <div className="flex sm:hidden items-center text-xs font-semibold px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-800 dark:text-neutral-200 truncate max-w-[150px]">
              {currentTab === 'template' && '1. Plantilla'}
              {currentTab === 'data' && `2. Datos (${rowsCount})`}
              {currentTab === 'dispatch' && `3. Despacho (${sentCount}/${rowsCount})`}
            </div>

            {/* Zone 3: Actions & Theme Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Desktop Preset Selector */}
              <div className="relative hidden lg:block">
                <select
                  aria-label="Cargar plantilla de ejemplo"
                  defaultValue=""
                  onChange={(e) => {
                    const preset = TEMPLATE_PRESETS.find((p) => p.id === e.target.value);
                    if (preset) onLoadPreset(preset);
                    e.target.value = '';
                  }}
                  className="text-xs bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-2 font-medium cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <option value="" disabled>
                    ⚡ Cargar Ejemplo...
                  </option>
                  {TEMPLATE_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.category}: {preset.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile/Tablet Presets Trigger Button */}
              <div className="relative lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobilePresetsOpen(!mobilePresetsOpen)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-colors min-h-[36px]"
                  title="Cargar plantilla de ejemplo"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden xs:inline">Ejemplos</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {mobilePresetsOpen && (
                  <div className="absolute right-0 top-11 z-50 w-72 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl p-2 space-y-1">
                    <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Cargar plantilla de ejemplo
                    </div>
                    {TEMPLATE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onLoadPreset(preset);
                          setMobilePresetsOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-neutral-800 transition-colors text-xs text-neutral-800 dark:text-neutral-200"
                      >
                        <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {preset.title}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                          {preset.category} · {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={onToggleDarkMode}
                title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Reset button */}
              <button
                type="button"
                onClick={onReset}
                title="Restablecer plantilla y datos"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile presets menu */}
      {mobilePresetsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMobilePresetsOpen(false)}
        />
      )}
    </>
  );
};
