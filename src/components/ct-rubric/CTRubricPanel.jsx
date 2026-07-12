'use client';
// Panel visual Rubrik CT 4 pilar (Tabel 5). Presentational — data dari
// lib/ctRubric.ts. Dipakai di: panduan siswa (TugasDetail), modal Workspace,
// dan referensi modal nilai guru.
import { CT_PILLARS, scoreToLevel } from '../../lib/ctRubric';

const TONE = {
  blue: { head: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700 border-blue-300', ring: 'ring-blue-500' },
  amber: { head: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-300', ring: 'ring-amber-500' },
  rose: { head: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 border-rose-300', ring: 'ring-rose-500' },
  emerald: { head: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-300', ring: 'ring-emerald-500' },
};

// scores: peta opsional { [labelPilar]: skor 0-100 } → menandai level tercapai.
export default function CTRubricPanel({ scores = null, compact = false }) {
  return (
    <div className={`flex flex-col ${compact ? 'gap-2.5' : 'gap-4'}`}>
      {CT_PILLARS.map((p) => {
        const tone = TONE[p.color] || TONE.blue;
        const achieved = scores && typeof scores[p.label] === 'number'
          ? scoreToLevel(scores[p.label]).level
          : null;
        return (
          <div key={p.key} className="border-2 border-[#0F172A] rounded-2xl overflow-hidden shadow-[3px_3px_0px_#0F172A] bg-white">
            {/* Kepala pilar */}
            <div className={`${tone.head} text-white flex items-center gap-2 border-b-2 border-[#0F172A] ${compact ? 'px-3 py-1.5' : 'px-4 py-2.5'}`}>
              <div className="w-7 h-7 rounded-lg bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0">
                <i className={`ti ${p.icon} text-base`} />
              </div>
              <div className="min-w-0">
                <h4 className={`font-fredoka font-bold leading-none ${compact ? 'text-xs' : 'text-sm'}`}>{p.label}</h4>
                {!compact && <p className="font-nunito text-[10px] font-bold text-white/85 mt-0.5 leading-tight">{p.summary}</p>}
              </div>
              {achieved != null && (
                <span className="ml-auto shrink-0 bg-white text-[#0F172A] border-2 border-[#0F172A] rounded-lg font-fredoka font-black text-[10px] px-2 py-0.5 shadow-[1.5px_1.5px_0px_#0F172A]">
                  Skor {achieved}
                </span>
              )}
            </div>
            {/* 4 level kriteria */}
            <div className="divide-y divide-slate-100">
              {p.levels.map((lv) => {
                const active = achieved === lv.level;
                return (
                  <div
                    key={lv.level}
                    className={`flex items-start gap-2.5 ${compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'} ${active ? `${tone.chip} border-l-4` : ''}`}
                  >
                    <span className={`shrink-0 w-6 h-6 rounded-lg border-2 border-[#0F172A] flex items-center justify-center font-fredoka font-black text-xs ${active ? tone.head + ' text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {lv.level}
                    </span>
                    <p className={`font-nunito leading-snug ${compact ? 'text-[10px]' : 'text-[11px]'} ${active ? 'font-black text-slate-800' : 'font-bold text-slate-600'}`}>
                      {lv.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="font-nunito text-[10px] font-bold text-slate-400 text-center">
        Skor: 4 = Sangat Baik (90–100) · 3 = Baik (75–89) · 2 = Cukup (60–74) · 1 = Kurang (&lt;60)
      </p>
    </div>
  );
}
