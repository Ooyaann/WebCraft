import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@/lib/router-compat';
import { useStore } from '../store/useStore';
import api from '../services/api';
import CTJourneyModal from '../components/ct-journey/CTJourneyModal';

export default function TugasDetail() {
  const { roomId, tugasId } = useParams(); // tugasId is the pertemuan_id
  const navigate = useNavigate();
  const { user, setActiveLevel, ctPreScore } = useStore();
  const [pertemuan, setPertemuan] = useState(null);
  const [tasks, setTasks] = useState({ learning_tasks: [], project_tasks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Engage, 2: Investigate, 3: Action
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [journeyAutoOpened, setJourneyAutoOpened] = useState(false);

  const isTeacher = user?.role === 'guru';

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get(`/rooms/${roomId}/pertemuan`),
      api.get(`/pertemuan/${tugasId}/tasks`)
    ])
      .then(([pertRes, tasksRes]) => {
        const found = pertRes.data?.find(p => p.id === tugasId);
        setPertemuan(found || null);
        const t = tasksRes.data || { learning_tasks: [], project_tasks: [] };
        setTasks(t);

        // Register the active level so the CT Journey (and later the workspace)
        // has the correct challenge context, mission text, and validator rules.
        const primary = t.learning_tasks?.[0] || t.project_tasks?.[0];
        if (primary && found) {
          // Pindah ke tugas yang berbeda → analisis CT misi sebelumnya tidak
          // berlaku lagi; kunci fase Action harus aktif kembali.
          const { activeLevel, resetCtJourney } = useStore.getState();
          if (activeLevel && activeLevel !== primary.id) {
            resetCtJourney();
          }
          const isLearning = !!t.learning_tasks?.[0];
          const challenge = found.cbl_engage_json?.challenge
            || (isLearning ? `${found.judul}: Selesaikan instruksi sesuai petunjuk.` : primary.studi_kasus);
          setActiveLevel(primary.id, {
            id: primary.id,
            judul: found.judul,
            type: isLearning ? 'learning' : 'project',
            pertemuan_id: tugasId,
            misi: challenge,
            validator_rules: primary.validator_rules_json || [],
            ct_journey: primary.ct_journey_json || null
          });
        }
      })
      .catch(err => console.error("Error loading task details:", err))
      .finally(() => setIsLoading(false));
  }, [roomId, tugasId, setActiveLevel]);

  // Auto-open CT Journey the first time the student reaches the Investigate phase
  useEffect(() => {
    if (!isTeacher && wizardStep === 2 && !journeyAutoOpened && ctPreScore === null) {
      setIsJourneyOpen(true);
      setJourneyAutoOpened(true);
    }
  }, [wizardStep, isTeacher, journeyAutoOpened, ctPreScore]);

  const handleStartTask = () => {
    const learningTaskId = tasks.learning_tasks[0]?.id;
    const projectTaskId = tasks.project_tasks[0]?.id;

    if (learningTaskId) {
      navigate(`/workspace/${learningTaskId}`);
    } else if (projectTaskId) {
      navigate(`/workspace/${projectTaskId}`);
    } else {
      alert("Tugas ini tidak memiliki modul coding yang aktif.");
    }
  };

  const ctDone = ctPreScore !== null;
  // Fase berurutan: siswa baru bisa masuk fase 3 (Action) setelah Analisis CT
  // di fase Investigate selesai. Guru bebas meninjau semua fase.
  const maxStep = isTeacher || ctDone ? 3 : 2;

  if (isLoading) {
    return (
      <div className="w-full px-6 py-12 flex justify-center items-center">
        <div className="neo-card p-12 text-center max-w-sm">
          <i className="ti ti-loader animate-spin text-3xl text-blue-600 mb-2" />
          <p className="font-nunito text-xs text-slate-500 font-bold">Memuat detail pertemuan...</p>
        </div>
      </div>
    );
  }

  if (!pertemuan) {
    return (
      <div className="w-full px-6 py-12 flex justify-center items-center">
        <div className="neo-card p-8 text-center max-w-sm border-4 border-[#0F172A]">
          <i className="ti ti-alert-triangle text-4xl text-red-500 mb-2" />
          <h3 className="font-fredoka text-lg font-bold">Detail Tidak Ditemukan</h3>
          <p className="font-nunito text-xs text-slate-500 font-bold mt-1">
            Data pertemuan ini tidak dapat ditemukan di server.
          </p>
        </div>
      </div>
    );
  }

  // Extract CBL details
  const cbl = pertemuan.cbl_engage_json || {};
  const bigIdea = cbl.big_idea || 'Coding & Web';
  const essentialQuestion = cbl.essential_question || 'Pertanyaan esensial sedang disiapkan.';
  const challenge = cbl.challenge || 'Tantangan praktik pemrograman web sedang disiapkan.';

  return (
    <div className="w-full px-4 md:px-6 py-8 text-left max-w-[1400px] mx-auto flex flex-col gap-6 neo-page-enter">
      {/* Header & Back Button */}
      <div className="flex justify-between items-center bg-white p-4 rounded-[20px] border-4 border-[#0F172A] shadow-[4px_4px_0px_#0F172A]">
        <button
          onClick={() => navigate(`/ruang-belajar/${roomId}`)}
          className="w-fit py-1.5 px-3 border-2 border-[#0F172A] bg-white text-slate-700 font-fredoka text-xs font-bold rounded-xl shadow-[2px_2px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer transition-all flex items-center gap-1.5"
        >
          <i className="ti ti-arrow-left" />
          Kembali
        </button>
        <h2 className="font-fredoka text-base md:text-lg font-bold text-[#0F172A]">
          {pertemuan.judul}
        </h2>
      </div>

      {/* Single-box CBL Wizard: 1 Engage -> 2 Investigate -> 3 Action */}
      <div className="neo-section bg-white border-4 border-[#0F172A] rounded-[24px] shadow-[6px_6px_0px_#0F172A] flex flex-col overflow-hidden">
        {/* Progress Bar */}
        <div className="flex border-b-4 border-[#0F172A] bg-[#F8FAFC]">
          {[
            { step: 1, label: '1. Engage', icon: 'ti-bulb', activeColor: 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#0F172A]' },
            { step: 2, label: '2. Investigate', icon: 'ti-search', activeColor: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' },
            { step: 3, label: '3. Action', icon: 'ti-rocket', activeColor: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' },
          ].map((s) => {
            const isLocked = s.step > maxStep;
            return (
              <button
                key={s.step}
                type="button"
                disabled={isLocked}
                title={isLocked ? 'Selesaikan Analisis CT di fase Investigate terlebih dahulu.' : undefined}
                onClick={() => !isLocked && setWizardStep(s.step)}
                className={`flex-1 py-4 px-2 text-center font-fredoka text-xs md:text-sm font-bold border-r-4 last:border-r-0 border-[#0F172A] transition-all focus:outline-none flex items-center justify-center gap-1.5 ${
                  isLocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-slate-50'
                } ${
                  wizardStep === s.step ? s.activeColor + ' border-b-4 border-b-[#0F172A]' : 'text-slate-400 bg-white'
                } ${wizardStep > s.step ? 'bg-slate-100/80 text-slate-500' : ''}`}
              >
                <i className={`ti ${isLocked ? 'ti-lock' : s.icon} text-sm md:text-base`} />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Wizard Content Area */}
        <div className="p-6 md:p-8 min-h-[350px] bg-gradient-to-b from-white to-[#FDFEFE]">
          {/* ============ STEP 1: ENGAGE ============ */}
          {wizardStep === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in text-left">
              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-200 pb-4">
                <div className="flex items-center gap-2 bg-amber-55/60 border-2 border-amber-500/80 px-4 py-1.5 rounded-full w-fit shadow-[2px_2px_0px_#0F172A] bg-[#FEF3C7]">
                  <i className="ti ti-bulb text-[#D97706] text-sm animate-pulse" />
                  <span className="font-fredoka text-[11px] font-black text-[#D97706] uppercase tracking-wider">
                    Fase 1 · Engage
                  </span>
                </div>
                <span className="font-fredoka text-xs text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  Topik: {bigIdea}
                </span>
              </div>

              {/* Essential Question Card */}
              <div className="relative bg-gradient-to-r from-amber-50 to-[#FFFDF2] border-4 border-[#0F172A] p-6 rounded-2xl shadow-[4px_4px_0px_#0F172A] overflow-hidden">
                <div className="absolute -right-4 -bottom-10 text-amber-200/40 font-black font-fredoka text-9xl pointer-events-none select-none">“</div>
                <div className="relative z-10 flex flex-col gap-2">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-fredoka">Pertanyaan Esensial</span>
                  <h3 className="font-fredoka text-lg md:text-2xl font-bold text-[#0F172A] leading-snug">
                    {essentialQuestion}
                  </h3>
                </div>
              </div>

              {/* Challenge Card */}
              <div className="bg-gradient-to-r from-blue-50 to-[#F1F8FF] border-4 border-[#0F172A] p-6 rounded-2xl shadow-[4px_4px_0px_#0F172A] relative overflow-hidden">
                <div className="absolute right-4 top-4 bg-blue-100 text-blue-700 w-10 h-10 rounded-xl border-2 border-[#0F172A] flex items-center justify-center text-lg shadow-[1.5px_1.5px_0px_#0F172A]">
                  <i className="ti ti-target" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest font-fredoka block mb-1">Misi / Tantangan Praktis</span>
                  <p className="font-nunito text-xs md:text-sm text-slate-800 font-bold leading-relaxed max-w-[90%]">
                    {challenge}
                  </p>
                </div>
              </div>

              {/* Informative Sticker */}
              <div className="bg-indigo-50 border-2 border-indigo-200/80 p-4 rounded-xl text-xs font-nunito font-semibold text-indigo-900 flex items-start gap-3 shadow-[1.5px_1.5px_0px_rgba(99,102,241,0.2)]">
                <i className="ti ti-sparkles text-indigo-600 text-lg shrink-0 mt-0.5" />
                <div>
                  <p className="font-fredoka text-xs font-bold text-indigo-950 mb-0.5">Siap Melangkah?</p>
                  <span>Klik <b>Selanjutnya</b> (atau pilih tab Langkah 2) untuk masuk ke fase <b>Investigate</b>. Di sana kamu akan menganalisis rencana kerjamu dengan pendekatan Computational Thinking (CT) dipandu AI!</span>
                </div>
              </div>
            </div>
          )}

          {/* ============ STEP 2: INVESTIGATE ============ */}
          {wizardStep === 2 && (
            <div className="flex flex-col gap-6 animate-fade-in text-left">
              <div className="flex items-center gap-2 bg-[#DBEAFE] border-2 border-blue-500/80 px-4 py-1.5 rounded-full w-fit shadow-[2px_2px_0px_#0F172A]">
                <i className="ti ti-search text-blue-600 text-sm" />
                <span className="font-fredoka text-[11px] font-black text-blue-700 uppercase tracking-wider">
                  Fase 2 · Investigate
                </span>
              </div>

              {/* CT Journey Dashboard */}
              {!isTeacher && (
                <div className="flex flex-col gap-4">
                  {ctDone ? (
                    <div className="border-4 border-[#0F172A] rounded-2xl p-5 bg-emerald-50 shadow-[4px_4px_0px_#0F172A] flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg border-2 border-[#0F172A] flex items-center justify-center shadow-[1.5px_1.5px_0px_#0F172A]">
                            <i className="ti ti-brain text-base animate-pulse" />
                          </div>
                          <div>
                            <h4 className="font-fredoka text-base md:text-lg font-bold text-[#0F172A]">Hasil Analisis Berpikir Komputasional (CT)</h4>
                            <p className="font-nunito text-[11px] text-emerald-800 font-extrabold uppercase tracking-wide">Rencana berpikirmu telah disimpan!</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsJourneyOpen(true)}
                          className="px-4 py-2 bg-white border-2 border-[#0F172A] text-slate-700 font-fredoka text-xs font-black rounded-lg shadow-[2px_2px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <i className="ti ti-eye text-sm" /> Lihat Rencana CT
                        </button>
                      </div>

                      {/* 4 Pillars Scoring Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Dekomposisi', val: ctPreScore?.decomposition, desc: 'Memecah tantangan', c: 'text-blue-600 bg-blue-50 border-blue-200', icon: 'ti-layout-grid-add' },
                          { label: 'Abstraksi', val: ctPreScore?.abstraction, desc: 'Fokus aspek penting', c: 'text-rose-600 bg-rose-50 border-rose-200', icon: 'ti-filter' },
                          { label: 'Pola', val: ctPreScore?.pattern_recognition, desc: 'Mencari kesamaan', c: 'text-amber-600 bg-amber-50 border-amber-200', icon: 'ti-subtask' },
                          { label: 'Algoritma', val: ctPreScore?.algorithm_design, desc: 'Langkah terurut', c: 'text-emerald-600 bg-emerald-55 border-emerald-200', icon: 'ti-list-numbers' },
                        ].map((s) => (
                          <div key={s.label} className={`border-2 rounded-2xl p-4 bg-white shadow-[3px_3px_0px_currentColor] hover:-translate-y-0.5 transition-transform duration-250 flex flex-col justify-between gap-3 ${s.c.split(' ')[0]} ${s.c.split(' ')[2]}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-fredoka text-sm font-black text-slate-800">{s.label}</span>
                              <div className={`w-9 h-9 rounded-lg border-2 border-[#0F172A] flex items-center justify-center shrink-0 ${s.c.split(' ')[1]}`}>
                                <i className={`ti ${s.icon} text-lg ${s.c.split(' ')[0]}`} />
                              </div>
                            </div>
                            <div>
                              <p className="font-nunito text-[11px] text-slate-500 font-bold leading-snug">{s.desc}</p>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className={`font-fredoka text-4xl font-black leading-none ${s.c.split(' ')[0]}`}>{s.val ?? '-'}</span>
                                <span className="font-nunito text-xs text-slate-400 font-bold">/100</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border-4 border-[#0F172A] rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-[#F5F3FF] shadow-[4px_4px_0px_#0F172A] flex flex-col sm:flex-row justify-between items-center gap-6 text-left">
                      <div className="flex-1 flex gap-4 items-start">
                        <div className="bg-[#6366F1] text-white w-12 h-12 rounded-xl border-4 border-[#0F172A] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#0F172A] text-xl animate-float-symbol">
                          <i className="ti ti-brain text-xl" />
                        </div>
                        <div>
                          <h4 className="font-fredoka text-sm md:text-base font-bold text-[#0F172A]">Rancang Analisis Berpikir Komputasional</h4>
                          <p className="font-nunito text-xs text-slate-600 font-bold leading-relaxed mt-1">
                            Pecah masalah, pilih bagian penting, cari polanya, dan susun algoritmanya bersama tutor AI. Rencana yang matang akan membantumu menulis kode dengan jauh lebih mudah di fase Action!
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsJourneyOpen(true)}
                        className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 text-white border-2 border-[#0F172A] font-fredoka text-xs font-black rounded-xl shadow-[3px_3px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <i className="ti ti-brain text-base animate-pulse" />
                        Mulai Analisis CT
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Guiding Questions */}
              {pertemuan.guiding_questions_json && pertemuan.guiding_questions_json.length > 0 && (
                <div className="bg-[#FCFAF7] border-4 border-[#0F172A] p-5 rounded-2xl shadow-[4px_4px_0px_#0F172A] mt-2">
                  <h4 className="font-fredoka text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                    <i className="ti ti-notebook text-sm" /> Pertanyaan Pemandu Belajar:
                  </h4>
                  <div className="flex flex-col gap-3">
                    {pertemuan.guiding_questions_json.map((q, idx) => (
                      <div key={idx} className="flex gap-3 bg-white border-2 border-slate-100 p-3.5 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                        <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600 font-fredoka text-[10px] font-bold mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="font-nunito text-xs text-slate-700 font-bold leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ STEP 3: ACTION ============ */}
          {wizardStep === 3 && (
            <div className="flex flex-col gap-6 animate-fade-in text-left">
              <div className="flex items-center gap-2 bg-[#D1FAE5] border-2 border-emerald-500/80 px-4 py-1.5 rounded-full w-fit shadow-[2px_2px_0px_#0F172A]">
                <i className="ti ti-rocket text-emerald-600 text-sm animate-bounce-slow" />
                <span className="font-fredoka text-[11px] font-black text-emerald-700 uppercase tracking-wider">
                  Fase 3 · Action
                </span>
              </div>

              {/* Coding Mission Terminal Block */}
              <div className="bg-[#0F172A] text-slate-200 border-4 border-[#0F172A] p-5 rounded-2xl shadow-[4px_4px_0px_#0F172A] relative overflow-hidden font-mono">
                {/* Terminal Header */}
                <div className="flex gap-1.5 mb-3.5 pb-2.5 border-b border-slate-800/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-slate-500 font-nunito font-black ml-2">misi-tantangan.html</span>
                </div>
                <div className="flex gap-3">
                  <i className="ti ti-terminal text-emerald-400 text-lg shrink-0 mt-0.5" />
                  <div className="text-left font-nunito text-xs md:text-sm font-semibold leading-relaxed text-slate-300">
                    {challenge}
                  </div>
                </div>
              </div>

              {/* Warning Alert if CT is not done */}
              {!isTeacher && !ctDone && (
                <div className="bg-amber-50 border-4 border-[#0F172A] p-4 rounded-xl text-xs font-nunito font-bold text-amber-900 flex items-start gap-3 shadow-[3px_3px_0px_#0F172A] animate-pulse">
                  <i className="ti ti-alert-triangle text-amber-600 text-xl shrink-0 mt-0.5" />
                  <div>
                    <p className="font-fredoka text-xs font-bold text-amber-950 mb-0.5">Analisis CT Belum Lengkap!</p>
                    <span>Kamu belum menyelesaikan analisis berpikir komputasional di fase <b>Investigate</b>. Kami sarankan kamu menyelesaikannya terlebih dahulu agar perakitan kode nanti menjadi lebih matang dan terarah.</span>
                  </div>
                </div>
              )}

              {/* Action Board (pink/indigo gradient banner) */}
              <div className="mt-2 p-6 border-4 border-[#0F172A] shadow-[6px_6px_0px_#0F172A] flex flex-col md:flex-row justify-between items-center gap-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                <div className="text-left flex-1 relative z-10">
                  <h4 className="font-fredoka text-base md:text-xl font-bold text-white flex items-center gap-2">
                    <i className="ti ti-code text-xl" />
                    {isTeacher ? 'Fasilitator Kelas' : 'Mulai Tulis & Susun Kode Web'}
                  </h4>
                  <p className="font-nunito text-xs text-white/95 font-semibold leading-relaxed mt-1 max-w-xl">
                    {isTeacher
                      ? 'Tinjau workspace visual dan aturan validasi untuk pertemuan ini.'
                      : 'Buka Workspace interaktif Triple-View Interface. Susun blok visual coding, periksa struktur kode HTML/CSS otomatis, dan lihat tampilan web buatanmu secara real-time!'}
                  </p>
                </div>

                <div className="shrink-0 w-full md:w-auto relative z-10">
                  {isTeacher ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/ruang-belajar/${roomId}`)}
                      className="w-full md:w-auto px-5 py-2.5 bg-white text-slate-800 border-2 border-[#0F172A] shadow-[2.5px_2.5px_0px_#0F172A] font-fredoka text-xs font-bold rounded-xl hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <i className="ti ti-arrow-left" /> Kelola Rencana
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartTask}
                      className="w-full md:w-auto px-8 py-3.5 bg-yellow-400 text-slate-900 border-4 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] font-fredoka text-sm font-black rounded-xl hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0F172A] cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <i className="ti ti-rocket text-base" /> Mulai Kerjakan Misi
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer / Navigation */}
        <div className="border-t-4 border-[#0F172A] px-6 py-4 bg-slate-100 flex justify-between items-center">
          <button
            onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
            className={`px-5 py-2 bg-white border-2 border-[#0F172A] text-slate-700 font-nunito font-bold rounded-xl text-xs shadow-[2.5px_2.5px_0px_#0F172A] hover:bg-slate-50 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-[0.5px] ${wizardStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Kembali
          </button>

          <span className="font-nunito text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Langkah {wizardStep} dari 3
          </span>

          <button
            onClick={() => setWizardStep(prev => Math.min(maxStep, prev + 1))}
            className={`px-6 py-2 bg-[#0F172A] text-white border-2 border-[#0F172A] shadow-[2.5px_2.5px_0px_#0F172A] font-nunito font-bold rounded-xl text-xs hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer transition-all flex items-center gap-1.5 ${wizardStep >= maxStep ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Selanjutnya <i className="ti ti-arrow-right" />
          </button>
        </div>
      </div>

      {/* Bahan Ajar & Materi Pembelajaran (Outside/Below the Wizard Box) */}
      {pertemuan.materi_list_json && pertemuan.materi_list_json.length > 0 && (
        <section className="neo-card p-6 border-4 border-[#0F172A] bg-[#EFF6FF] rounded-[24px] shadow-[4px_4px_0px_#0F172A] flex flex-col gap-4 text-left">
          <h3 className="font-fredoka text-base font-bold text-[#0F172A] flex items-center gap-2">
            <i className="ti ti-file-text text-blue-600 text-xl animate-pulse" />
            Bahan Ajar & Materi Pendukung
          </h3>
          <p className="font-nunito text-xs text-slate-650 font-bold -mt-1">
            Pelajari materi pendukung di bawah ini untuk membantumu menyelesaikan misi coding di atas:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {pertemuan.materi_list_json.map((m, idx) => (
              <a
                key={idx}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-[#0F172A] p-3 rounded-xl bg-white hover:bg-blue-50 hover:-translate-y-0.5 shadow-[2.5px_2.5px_0px_#0F172A] transition-all flex items-center justify-between text-xs font-nunito font-bold text-slate-800"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <i className="ti ti-file-symlink text-blue-600 text-base" />
                  <span className="truncate">{m.title}</span>
                </div>
                <i className="ti ti-external-link text-slate-400" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CT Journey Modal — runs inside the Investigate phase */}
      <CTJourneyModal isOpen={isJourneyOpen} onClose={() => setIsJourneyOpen(false)} viewOnly={ctDone} />
    </div>
  );
}
