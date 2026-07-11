'use client';
// Dialog konfirmasi bergaya neo-brutalist, pengganti window.confirm() bawaan.
// Pakai: `if (!(await confirmDialog({ message, danger: true }))) return;`
// ConfirmHost dipasang sekali di AppShell; callers cukup impor confirmDialog.
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

let _open = null; // di-set oleh ConfirmHost saat ter-mount

export function confirmDialog(opts) {
  return new Promise((resolve) => {
    // Fallback ke confirm bawaan bila host belum siap (mis. SSR/edge).
    if (!_open) {
      resolve(window.confirm(opts.message));
      return;
    }
    _open({ ...opts, resolve });
  });
}

export function ConfirmHost() {
  const [state, setState] = useState(null);

  useEffect(() => {
    _open = setState;
    return () => { _open = null; };
  }, []);

  const close = useCallback((val) => {
    setState((s) => { s?.resolve(val); return null; });
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
      else if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, close]);

  if (!state || typeof window === 'undefined') return null;

  const danger = state.danger;
  const icon = state.icon ?? (danger ? 'ti-alert-triangle' : 'ti-help-circle');

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 onboard-fade"
      onClick={() => close(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="onboard-pop w-full max-w-sm bg-white border-4 border-[#0F172A] rounded-2xl shadow-[8px_8px_0px_#0F172A] overflow-hidden"
      >
        <div className={`flex items-center gap-3 px-5 py-4 border-b-4 border-[#0F172A] ${danger ? 'bg-[#FEE2E2]' : 'bg-[#FEF3C7]'}`}>
          <div className={`w-10 h-10 rounded-xl border-2 border-[#0F172A] flex items-center justify-center shadow-[2px_2px_0px_#0F172A] shrink-0 ${danger ? 'bg-[#F43F5E] text-white' : 'bg-[#FACC15] text-[#0F172A]'}`}>
            <i className={`ti ${icon} text-xl`} />
          </div>
          <h3 className="font-fredoka text-base font-bold text-[#0F172A]">
            {state.title ?? (danger ? 'Konfirmasi Hapus' : 'Konfirmasi')}
          </h3>
        </div>

        <p className="px-5 py-4 font-nunito text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
          {state.message}
        </p>

        <div className="flex gap-3 px-5 pb-5 justify-end">
          <button
            onClick={() => close(false)}
            className="px-4 py-2 bg-white text-slate-700 border-2 border-[#0F172A] font-fredoka text-xs font-bold rounded-xl shadow-[2px_2px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer transition-all"
          >
            {state.cancelText ?? 'Batal'}
          </button>
          <button
            autoFocus
            onClick={() => close(true)}
            className={`px-5 py-2 border-2 border-[#0F172A] text-white font-fredoka text-xs font-bold rounded-xl shadow-[2px_2px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer transition-all flex items-center gap-1.5 ${danger ? 'bg-[#F43F5E] hover:bg-[#E11D48]' : 'bg-[#3B82F6] hover:bg-[#2563EB]'}`}
          >
            {danger && <i className="ti ti-trash text-sm" />}
            {state.confirmText ?? (danger ? 'Hapus' : 'Ya, Lanjutkan')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
