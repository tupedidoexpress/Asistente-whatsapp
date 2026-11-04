import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MergedMessage, DispatchStatus } from '../types';
import { exportMergedToExcel, exportMergedToCsv } from '../utils/excelParser';
import { WhatsAppPreview } from './WhatsAppPreview';
import {
  Send,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  Flame,
  LayoutGrid,
  List,
  ArrowUpRight,
} from 'lucide-react';

interface DispatchCenterProps {
  messages: MergedMessage[];
  onUpdateStatus: (id: string, status: DispatchStatus) => void;
  onUpdateAllStatuses: (status: DispatchStatus) => void;
  onBackToData: () => void;
}

export const DispatchCenter: React.FC<DispatchCenterProps> = ({
  messages,
  onUpdateStatus,
  onUpdateAllStatuses,
  onBackToData,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'skipped'>('all');
  const [tableSearch, setTableSearch] = useState('');
  const [viewMode, setViewMode] = useState<'focus' | 'table'>('focus');

  // Stats
  const total = messages.length;
  const sent = messages.filter((m) => m.status === 'sent').length;
  const pending = messages.filter((m) => m.status === 'pending').length;
  const skipped = messages.filter((m) => m.status === 'skipped').length;
  const progressPercent = total > 0 ? Math.round((sent / total) * 100) : 0;

  const currentMessage = messages[currentIndex] || messages[0] || null;

  // Launch WhatsApp and optionally auto-advance
  const handleSendWhatsApp = (msg: MergedMessage) => {
    if (!msg.whatsappUrl) return;

    // Open WhatsApp Web/App
    window.open(msg.whatsappUrl, '_blank', 'noopener,noreferrer');

    // Mark current as sent
    onUpdateStatus(msg.id, 'sent');

    // Check if that was the last pending one!
    if (sent + 1 === total) {
      triggerConfetti();
    }

    // Auto advance to next contact
    if (autoAdvance && currentIndex < messages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Copy text to clipboard
  const handleCopyText = async (msg: MergedMessage) => {
    try {
      await navigator.clipboard.writeText(msg.renderedText);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Copy all texts combined
  const handleCopyAllTexts = async () => {
    const combined = messages
      .map((m, idx) => `--- Mensaje #${idx + 1} (${m.recipientName} - ${m.cleanPhone}) ---\n${m.renderedText}\n`)
      .join('\n');
    await navigator.clipboard.writeText(combined);
    setCopiedId('ALL');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Confetti celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Filtered rows for table view
  const filteredMessages = messages.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      return (
        m.recipientName.toLowerCase().includes(q) ||
        m.cleanPhone.includes(q) ||
        m.renderedText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner / Progress Metrics */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                3. Despacho & Envíos de WhatsApp
              </h2>
              {progressPercent === 100 && (
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> ¡100% Completado!
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Envía tus mensajes uno a uno con 1 clic en WhatsApp, o exporta la base completa de mensajes ya combinados.
            </p>
          </div>

          {/* Export Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => exportMergedToExcel(messages)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-lg text-xs font-semibold transition-all shadow-2xs whitespace-nowrap min-h-[38px]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
            <button
              type="button"
              onClick={() => exportMergedToCsv(messages)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 active:scale-[0.98] text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[38px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleCopyAllTexts}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 active:scale-[0.98] text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[38px]"
            >
              {copiedId === 'ALL' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'ALL' ? '¡Copiados!' : 'Copiar Textos'}</span>
            </button>
          </div>
        </div>

        {/* Responsive Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
            <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">Progreso Total</span>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {progressPercent}%
            </span>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
            <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">Enviados</span>
            <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {sent}
            </span>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
            <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">Pendientes</span>
            <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {pending}
            </span>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
            <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">Total Contactos</span>
            <span className="text-lg font-bold font-mono text-neutral-800 dark:text-neutral-200 tabular-nums">
              {total}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
          {skipped > 0 && (
            <div
              className="h-full bg-neutral-400 transition-all duration-300"
              style={{ width: `${(skipped / total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Mode Switcher: Focus Dispatch vs Bulk Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-medium w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode('focus')}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-all text-center whitespace-nowrap min-h-[36px] ${
              viewMode === 'focus'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Modo Despachador (1 a 1)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-all text-center whitespace-nowrap min-h-[36px] ${
              viewMode === 'table'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Vista Lista Masiva ({messages.length})
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={() => onUpdateAllStatuses('sent')}
            className="text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1"
          >
            Marcar todos enviados
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <button
            type="button"
            onClick={() => onUpdateAllStatuses('pending')}
            className="text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1"
          >
            Reiniciar a pendientes
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: FOCUS DISPATCHER */}
      {viewMode === 'focus' && currentMessage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Left: Dispatch Actions Control (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 space-y-4 sm:space-y-5 shadow-xs">
              {/* Recipient Header with Touch Navigation */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-200 dark:border-neutral-800 gap-2">
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {currentMessage.recipientName}
                    </h3>
                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        currentMessage.status === 'sent'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : currentMessage.status === 'skipped'
                          ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {currentMessage.status === 'sent'
                        ? 'Enviado'
                        : currentMessage.status === 'skipped'
                        ? 'Omitido'
                        : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                    WhatsApp: {currentMessage.cleanPhone ? `+${currentMessage.cleanPhone}` : 'Sin teléfono'}
                  </p>
                </div>

                {/* Recipient Navigator Buttons (Thumb friendly) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 text-neutral-700 dark:text-neutral-300 transition-colors"
                    title="Contacto anterior"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-xs font-mono tabular-nums px-1.5 font-semibold text-neutral-600 dark:text-neutral-300">
                    {currentIndex + 1}/{messages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(messages.length - 1, prev + 1))}
                    disabled={currentIndex === messages.length - 1}
                    className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 text-neutral-700 dark:text-neutral-300 transition-colors"
                    title="Contacto siguiente"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Big Touch CTA: Enviar por WhatsApp */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(currentMessage)}
                  className="w-full h-14 sm:h-12 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                >
                  <Send className="w-5 h-5 shrink-0" />
                  <span className="truncate">
                    Enviar a {currentMessage.recipientName.split(' ')[0]}
                  </span>
                </button>

                {/* Automation & Quick Options */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-700 dark:text-neutral-300 py-1">
                    <input
                      type="checkbox"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
                    />
                    <span>Avanzar al siguiente automáticamente al enviar</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleCopyText(currentMessage)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98] text-neutral-700 dark:text-neutral-300 font-semibold transition-all min-h-[38px]"
                  >
                    {copiedId === currentMessage.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === currentMessage.id ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-medium text-neutral-600 dark:text-neutral-400">Estado de este mensaje:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(currentMessage.id, 'pending')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[34px] ${
                      currentMessage.status === 'pending'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    Pendiente
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(currentMessage.id, 'sent')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[34px] ${
                      currentMessage.status === 'sent'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    Enviado
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(currentMessage.id, 'skipped')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[34px] ${
                      currentMessage.status === 'skipped'
                        ? 'bg-neutral-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    Omitir
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: WhatsApp Mockup Preview (5 cols) */}
          <div className="lg:col-span-5">
            <WhatsAppPreview
              message={currentMessage}
              totalMessages={messages.length}
              currentIndex={currentIndex}
              onNavigateIndex={setCurrentIndex}
            />
          </div>
        </div>
      )}

      {/* VIEW MODE 2: BULK TABLE & CARDS VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs space-y-4 p-3.5 sm:p-5">
          {/* Table Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px] ${
                  statusFilter === 'all' ? 'bg-white dark:bg-neutral-700 font-semibold shadow-2xs' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Todos ({total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px] ${
                  statusFilter === 'pending' ? 'bg-white dark:bg-neutral-700 font-semibold shadow-2xs text-amber-700 dark:text-amber-300' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Pendientes ({pending})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('sent')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px] ${
                  statusFilter === 'sent' ? 'bg-white dark:bg-neutral-700 font-semibold shadow-2xs text-emerald-700 dark:text-emerald-300' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Enviados ({sent})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('skipped')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px] ${
                  statusFilter === 'skipped' ? 'bg-white dark:bg-neutral-700 font-semibold shadow-2xs text-neutral-700 dark:text-neutral-300' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Omitidos ({skipped})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-1 focus:ring-emerald-500 min-h-[36px]"
              />
            </div>
          </div>

          {/* MOBILE CARDS VIEW (<md) */}
          <div className="block md:hidden space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                No hay mensajes que coincidan con el filtro actual.
              </div>
            ) : (
              filteredMessages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl border transition-colors space-y-2.5 ${
                    msg.status === 'sent'
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {msg.recipientName}
                      </h4>
                      <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                        {msg.cleanPhone ? `+${msg.cleanPhone}` : 'Sin teléfono'}
                      </p>
                    </div>

                    <select
                      value={msg.status}
                      onChange={(e) => onUpdateStatus(msg.id, e.target.value as DispatchStatus)}
                      className={`text-xs rounded-lg px-2 py-1 font-semibold border min-h-[32px] ${
                        msg.status === 'sent'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          : msg.status === 'skipped'
                          ? 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="sent">Enviado</option>
                      <option value="skipped">Omitido</option>
                    </select>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 bg-white/70 dark:bg-neutral-900/70 p-2 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                    {msg.renderedText}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(msg)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[38px]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg)}
                      className="py-2 px-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors min-h-[38px]"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* TABLE VIEW (>=md) */}
          <div className="hidden md:block overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100/80 dark:bg-neutral-800/90 text-neutral-600 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Destinatario</th>
                  <th className="py-2.5 px-3">Teléfono WhatsApp</th>
                  <th className="py-2.5 px-3">Mensaje Personalizado</th>
                  <th className="py-2.5 px-3 w-24">Estado</th>
                  <th className="py-2.5 px-3 w-28 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No hay mensajes que coincidan con el filtro actual.
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((msg, idx) => (
                    <tr
                      key={msg.id}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                        msg.status === 'sent' ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-neutral-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                        {msg.recipientName}
                      </td>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        {msg.cleanPhone ? `+${msg.cleanPhone}` : <em className="text-neutral-400">Sin número</em>}
                      </td>
                      <td className="py-2.5 px-3 max-w-md truncate text-neutral-600 dark:text-neutral-300">
                        {msg.renderedText}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={msg.status}
                          onChange={(e) => onUpdateStatus(msg.id, e.target.value as DispatchStatus)}
                          className={`text-xs rounded-lg px-2 py-1 font-semibold border min-h-[32px] ${
                            msg.status === 'sent'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : msg.status === 'skipped'
                              ? 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="sent">Enviado</option>
                          <option value="skipped">Omitido</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(msg)}
                            title="Abrir WhatsApp"
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg)}
                            title="Copiar texto"
                            className="p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
