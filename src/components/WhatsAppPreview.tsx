import React from 'react';
import { Phone, CheckCheck, MessageCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { MergedMessage } from '../types';

interface WhatsAppPreviewProps {
  message?: MergedMessage | null;
  totalMessages: number;
  currentIndex: number;
  onNavigateIndex: (idx: number) => void;
}

/**
 * Formats WhatsApp markdown text (*bold*, _italic_, ~strike~, ```code```) to HTML elements safely
 */
export function formatWhatsAppMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Split lines
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = [];
    let keyIdx = 0;

    // Regex for whatsapp formatting: *bold*, _italic_, ~strike~, `mono`
    const regex = /(\*([^*]+)\*)|(_([^_]+)_)|(~([^~]+)~)|(`([^`]+)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(line.substring(lastIndex, match.index));
      }

      if (match[1]) {
        // *bold*
        tokens.push(
          <strong key={`${lineIdx}-${keyIdx++}`} className="font-bold text-neutral-900 dark:text-neutral-50">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // _italic_
        tokens.push(
          <em key={`${lineIdx}-${keyIdx++}`} className="italic">
            {match[4]}
          </em>
        );
      } else if (match[5]) {
        // ~strike~
        tokens.push(
          <del key={`${lineIdx}-${keyIdx++}`} className="line-through text-neutral-500">
            {match[6]}
          </del>
        );
      } else if (match[7]) {
        // `mono`
        tokens.push(
          <code key={`${lineIdx}-${keyIdx++}`} className="font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[11px]">
            {match[8]}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push(line.substring(lastIndex));
    }

    return (
      <React.Fragment key={lineIdx}>
        {tokens.length > 0 ? tokens : <span>&nbsp;</span>}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  message,
  totalMessages,
  currentIndex,
  onNavigateIndex,
}) => {
  if (!message) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 text-center text-neutral-400 space-y-2">
        <MessageCircle className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600" />
        <p className="text-xs">No hay mensaje disponible para previsualizar.</p>
      </div>
    );
  }

  const hasMissing = message.missingVariables && message.missingVariables.length > 0;
  const isPhoneValid = Boolean(message.cleanPhone && message.cleanPhone.length >= 8);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs flex flex-col">
      {/* Top Bar of WhatsApp Mockup */}
      <div className="bg-emerald-800 dark:bg-neutral-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-emerald-900 dark:border-neutral-700">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-700 dark:bg-neutral-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner shrink-0">
            {message.recipientName ? message.recipientName.substring(0, 2) : 'WA'}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold leading-tight flex items-center gap-1.5 truncate">
              <span className="truncate max-w-[130px] sm:max-w-[180px]">{message.recipientName}</span>
              <span className="text-[10px] text-emerald-200 dark:text-neutral-400 font-mono shrink-0">
                {message.cleanPhone ? `+${message.cleanPhone}` : '(Sin tel)'}
              </span>
            </div>
            <div className="text-[10px] text-emerald-200/90 dark:text-neutral-400">en línea</div>
          </div>
        </div>

        {/* Index Navigator */}
        {totalMessages > 1 && (
          <div className="flex items-center gap-1 text-xs shrink-0">
            <button
              type="button"
              onClick={() => onNavigateIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded-md bg-emerald-900/60 dark:bg-neutral-700 hover:bg-emerald-900 disabled:opacity-30 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] tabular-nums px-1">
              {currentIndex + 1}/{totalMessages}
            </span>
            <button
              type="button"
              onClick={() => onNavigateIndex(Math.min(totalMessages - 1, currentIndex + 1))}
              disabled={currentIndex === totalMessages - 1}
              className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded-md bg-emerald-900/60 dark:bg-neutral-700 hover:bg-emerald-900 disabled:opacity-30 text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp Wallpaper Chat Canvas */}
      <div className="p-3 sm:p-4 bg-[#efeae2] dark:bg-[#0b141a] min-h-[250px] sm:min-h-[280px] flex flex-col justify-end relative overflow-y-auto max-h-[380px]">
        {/* Subtle date pill in center */}
        <div className="self-center mb-3">
          <span className="text-[11px] bg-white/90 dark:bg-[#182229]/90 text-neutral-600 dark:text-neutral-300 px-3 py-1 rounded-md shadow-2xs font-medium">
            HOY
          </span>
        </div>

        {/* Outgoing Message Bubble (WhatsApp Green) */}
        <div className="self-end max-w-[92%] sm:max-w-[80%] bg-[#d9fdd3] dark:bg-[#005c4b] text-neutral-900 dark:text-[#e9edef] rounded-xl rounded-tr-none p-3 shadow-xs text-xs sm:text-sm leading-relaxed relative break-words">
          {/* Chat Bubble Tail */}
          <div className="absolute top-0 -right-2 w-0 h-0 border-t-8 border-t-[#d9fdd3] dark:border-t-[#005c4b] border-r-8 border-r-transparent" />

          {/* Rendered WhatsApp Markdown */}
          <div className="whitespace-pre-wrap">{formatWhatsAppMarkdown(message.renderedText)}</div>

          {/* Time & Double Blue Checkmark */}
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-neutral-500 dark:text-neutral-300">
            <span>12:00</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
          </div>
        </div>
      </div>

      {/* Validation Warnings Footer */}
      {(hasMissing || !isPhoneValid) && (
        <div className="p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs space-y-1">
          {hasMissing && (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Faltan valores para: <strong className="font-mono">{message.missingVariables.join(', ')}</strong>
              </span>
            </div>
          )}
          {!isPhoneValid && (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>Número de teléfono inválido o incompleto.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
