'use client';
// Notifikasi toast bergaya neo-brutalist, pengganti alert() bawaan.
// Pakai: toast.success('...'), toast.error('...'), toast.info('...').
// ToastHost dipasang sekali di AppShell.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

let _add = null; // di-set oleh ToastHost
let _seq = 0;

export function toast(message, type = 'info') {
  if (!_add) return; // host belum siap (mis. SSR) — diamkan
  _add({ id: ++_seq, message, type });
}
toast.success = (m) => toast(m, 'success');
toast.error = (m) => toast(m, 'error');
toast.info = (m) => toast(m, 'info');

const STYLE = {
  success: { bg: 'bg-emerald-500', icon: 'ti-circle-check' },
  error: { bg: 'bg-rose-500', icon: 'ti-alert-triangle' },
  info: { bg: 'bg-blue-500', icon: 'ti-info-circle' },
};

export function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    _add = (t) => {
      setItems((prev) => [...prev, t]);
      // Auto-dismiss setelah 3.8 detik.
      setTimeout(
        () => setItems((prev) => prev.filter((x) => x.id !== t.id)),
        3800,
      );
    };
    return () => { _add = null; };
  }, []);

  if (typeof window === 'undefined') return null;

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  return createPortal(
    <div className="fixed z-[300] bottom-4 right-4 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
      {items.map((t) => {
        const s = STYLE[t.type] || STYLE.info;
        return (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            className={`onboard-pop pointer-events-auto cursor-pointer ${s.bg} text-white border-[3px] border-[#0F172A] rounded-xl shadow-[4px_4px_0px_#0F172A] px-4 py-3 flex items-start gap-2.5`}
          >
            <i className={`ti ${s.icon} text-lg shrink-0 mt-0.5`} />
            <p className="font-nunito text-sm font-bold leading-snug flex-1">{t.message}</p>
            <i className="ti ti-x text-sm opacity-70 shrink-0 mt-0.5" />
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
