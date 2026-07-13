import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { aiService } from '../services/aiService';
import { criterionName, KKM } from '../lib/scoring';
import { toast } from '../components/common/toast';
import { CT_PILLARS, scoreToLevel } from '../lib/ctRubric';
import { toHTML, toFormattedCode } from '../services/astUtils';

// Read-only mini preview of a finished karya (no interaction, replay-only)
function RekapPreview({ ast }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  let parsed = [];
  try {
    parsed = typeof ast === 'string' ? JSON.parse(ast) : (ast || []);
  } catch (e) {
    parsed = [];
  }
  const html = toHTML(parsed);
  const fullHTML = `<!DOCTYPE html><html><head><style>
    body { font-family:'Nunito',sans-serif; margin:0; padding:16px; background:#ffffff; color:#0f172a; }
  </style></head><body>${html}</body></html>`;
  return (
    <div className="w-full h-64 border-2 border-[#0F172A] rounded-xl overflow-hidden bg-white relative shadow-[3px_3px_0px_#0F172A] group">
      <iframe srcDoc={fullHTML} sandbox="" title="Rekap Preview" className="w-full h-full border-none" />
      <div className="absolute inset-0 pointer-events-none" />
      <button
        onClick={() => setIsFullScreen(true)}
        type="button"
        title="Tampilkan Layar Penuh"
        className="absolute top-2 right-2 p-1.5 bg-white hover:bg-slate-100 border-2 border-[#0F172A] text-slate-800 font-bold rounded-lg shadow-[1px_1.5px_0px_#0F172A] cursor-pointer transition-all active:translate-y-0.5 hover:-translate-y-0.5 flex items-center justify-center text-xs opacity-90 group-hover:opacity-100 z-10"
      >
        <i className="ti ti-maximize text-sm" />
      </button>

      {isFullScreen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-white z-[200] w-screen h-screen overflow-hidden flex flex-col">
          <iframe
            srcDoc={fullHTML}
            sandbox=""
            title="Full Screen Preview"
            className="w-full h-full border-none bg-white"
          />
          <button
            onClick={() => setIsFullScreen(false)}
            type="button"
            title="Tutup Pratinjau"
            className="fixed top-4 right-4 z-[210] w-10 h-10 bg-[#EC4899] hover:bg-[#D01C7A] text-white border-2 border-[#0F172A] rounded-full shadow-[2px_2px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all flex items-center justify-center text-xl font-bold"
          >
            <i className="ti ti-x" />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

// Read-only tree view of the AST block structure (no drag/select/edit).
function BlockTree({ nodes, depth = 0 }) {
  if (!nodes || nodes.length === 0) {
    return depth === 0
      ? <p className="text-slate-400 font-nunito text-xs font-bold italic p-2">Tidak ada blok.</p>
      : null;
  }
  return (
    <div className={depth > 0 ? 'pl-4 border-l-2 border-dashed border-slate-200 flex flex-col gap-1.5' : 'flex flex-col gap-1.5'}>
      {nodes.map((node, i) => (
        <div key={node.id || i} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-lg px-2.5 py-1.5 text-left">
            <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">{`<${node.type}>`}</span>
            {node.type === 'style'
              ? <span className="font-nunito text-[10px] text-slate-400 font-bold italic">gaya CSS</span>
              : node.content
                ? <span className="font-nunito text-[11px] text-slate-600 font-semibold truncate">{node.content}</span>
                : null}
          </div>
          {Array.isArray(node.children) && node.children.length > 0 && (
            <BlockTree nodes={node.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

// Read-only artifact viewer with Preview / Blocks / Code tabs.
function RekapArtifact({ ast }) {
  const [tab, setTab] = useState('preview'); // 'preview' | 'blocks' | 'code'
  let parsed = [];
  try {
    parsed = typeof ast === 'string' ? JSON.parse(ast) : (ast || []);
  } catch (e) {
    parsed = [];
  }
  const code = toFormattedCode(parsed);

  const tabs = [
    ['preview', 'Pratinjau', 'ti-eye'],
    ['blocks', 'Blok', 'ti-stack-2'],
    ['code', 'Kode', 'ti-code'],
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-2 mb-2">
        {tabs.map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 border-2 border-[#0F172A] rounded-lg font-fredoka text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              tab === key ? 'bg-[#0F172A] text-white shadow-[2px_2px_0px_#94A3B8]' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className={`ti ${icon}`} /> {label}
          </button>
        ))}
      </div>

      {tab === 'preview' && <RekapPreview ast={parsed} />}

      {tab === 'blocks' && (
        <div className="w-full h-64 overflow-y-auto border-2 border-[#0F172A] rounded-xl bg-white p-3 shadow-[3px_3px_0px_#0F172A] custom-scrollbar text-left">
          <BlockTree nodes={parsed} />
        </div>
      )}

      {tab === 'code' && (
        <div className="w-full h-64 overflow-auto border-2 border-[#0F172A] rounded-xl bg-[#0F172A] shadow-[3px_3px_0px_#0F172A] custom-scrollbar text-left">
          <pre className="p-3 text-[11px] leading-relaxed font-mono text-emerald-200 whitespace-pre">{code || '<!-- Kode kosong -->'}</pre>
        </div>
      )}
    </div>
  );
}

export default function PenilaianAnalitik() {
  const { activeRoom, setActiveRoom } = useStore();
  const [rooms, setRooms] = useState([]);
  const [projectSubmissions, setProjectSubmissions] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [pertemuanList, setPertemuanList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState(null); // 'pertId-learning' or 'pertId-project'

  const handleOpenStudentDetail = async (student) => {
    setSelectedStudent(student);
    setLoadingDetails(true);
    setStudentDetails(null);
    setExpandedPreview(null);
    try {
      const res = await api.get(`/rooms/${activeRoom.id}/student/${student.id}/submissions`);
      setStudentDetails(res.data);
    } catch (err) {
      console.error("Gagal memuat detail pengerjaan siswa:", err);
      toast.error("Gagal memuat detail pengerjaan siswa.");
      setSelectedStudent(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Ekspor rekap nilai lengkap ke Excel (multi-sheet, transparansi penuh)
  const handleExportExcel = async () => {
    if (!activeRoom || isExporting) return;
    setIsExporting(true);
    try {
      // Lazy-load SheetJS hanya saat tombol diklik — tidak membebani load halaman
      const XLSX = await import('xlsx');
      const { data } = await api.get(`/rooms/${activeRoom.id}/export`);
      const fmtDate = (d) => (d ? new Date(d).toLocaleString('id-ID') : '-');
      const wb = XLSX.utils.book_new();

      const ringkasan = studentGrades.map((s) => ({
        'Nama Siswa': s.name,
        'Email': s.email,
        'Nilai Misi Belajar (rata-rata)': s.learning,
        'Nilai Proyek': s.project ?? 'Belum dinilai',
        'CT Komposit': s.ct,
        'Dekomposisi': s.decomposition,
        'Abstraksi': s.abstraction,
        'Pengenalan Pola': s.pattern_recognition,
        'Desain Algoritma': s.algorithm_design,
        'Status': s.status,
        'Tugas Selesai': s.already_done,
        'Belum Dikerjakan': s.not_done,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ringkasan), 'Ringkasan');

      const misi = data.learning.map((l) => ({
        'Nama Siswa': l.student_name,
        'Pertemuan': l.pertemuan,
        'Nilai Akhir': l.final_score,
        'Akurasi (100−15×error)': l.accuracy,
        'Efisiensi (dari percobaan)': l.efficiency,
        'Jumlah Percobaan': l.attempts,
        'Remidi': l.is_remedial ? `Ya (maks KKM ${data.kkm})` : 'Tidak',
        [`Ketuntasan (KKM ${data.kkm})`]: l.tuntas ? 'Tuntas' : 'Belum Tuntas',
        'Waktu Kirim': fmtDate(l.submitted_at),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(misi), 'Misi Belajar');

      const proyek = data.projects.map((p) => ({
        'Nama Siswa': p.student_name,
        'Tugas Proyek': p.task,
        'Nilai Guru (terbobot)': p.teacher_score ?? 'Belum dinilai',
        'Jumlah Percobaan': p.attempts ?? 1,
        'Rincian Rubrik': p.rubrik_scores
          ? Object.entries(p.rubrik_scores)
              .map(([k, v]) => {
                const bobot = (p.rubrik || []).find((c) => criterionName(c) === k)?.bobot;
                return `${k}${bobot ? ` (bobot ${bobot}%)` : ''}: ${v}`;
              })
              .join('; ')
          : '-',
        'Komentar Guru': p.teacher_comment || '-',
        'Publik di Galeri': p.is_published ? 'Ya' : 'Tidak',
        'Waktu Kirim': fmtDate(p.submitted_at),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(proyek), 'Proyek');

      const ctRows = data.ct.map((c) => ({
        'Nama Siswa': c.student_name,
        'Pertemuan': c.pertemuan,
        'Dekomposisi': c.decomposition,
        'Abstraksi': c.abstraction,
        'Pengenalan Pola': c.pattern_recognition,
        'Desain Algoritma': c.algorithm_design,
        'Komposit (rata-rata 4 pilar)': c.composite,
        'Waktu': fmtDate(c.recorded_at),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ctRows), 'Skor CT');

      // Transparansi penuh: aturan perhitungan nilai ikut dalam file
      const aturan = [
        { 'Aturan Penilaian WebCraft': `KKM (Kriteria Ketuntasan Minimal): ${data.kkm}` },
        { 'Aturan Penilaian WebCraft': 'Nilai Misi Belajar = (Akurasi + Efisiensi) ÷ 2 — divalidasi otomatis oleh server' },
        { 'Aturan Penilaian WebCraft': 'Akurasi = 100 − 15 × jumlah error struktur pada karya final (minimal 0)' },
        { 'Aturan Penilaian WebCraft': 'Efisiensi = ≤1 percobaan: 100 · 2: 90 · 3: 80 · 4: 70 · ≥5: 60' },
        { 'Aturan Penilaian WebCraft': `Remidi: nilai < KKM dapat dikerjakan ulang; nilai pengulangan maksimal ${data.kkm}` },
        { 'Aturan Penilaian WebCraft': 'Nilai Proyek = rata-rata terbobot rubrik: Σ(skor × bobot) ÷ Σ(bobot) — dinilai guru' },
        { 'Aturan Penilaian WebCraft': 'Skor CT Komposit = rata-rata 4 pilar (Dekomposisi, Abstraksi, Pola, Algoritma), skala 0–100' },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(aturan), 'Aturan Nilai');

      XLSX.writeFile(wb, `Rekap Nilai - ${data.room.name}.xlsx`);
    } catch (err) {
      console.error('Gagal mengekspor Excel:', err);
      toast.error('Gagal mengekspor Excel. Coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch rooms list on mount
  useEffect(() => {
    api.get('/rooms')
      .then(res => {
        const list = res.data || [];
        setRooms(list);
        if (!activeRoom && list.length > 0) {
          setActiveRoom(list[0]);
        }
      })
      .catch(err => console.error("Error fetching rooms list:", err));
  }, []);

  // Load submissions and class insights whenever activeRoom changes
  useEffect(() => {
    if (activeRoom) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [activeRoom]);

  const fetchData = async () => {
    if (!activeRoom) return;
    setIsLoading(true);
    try {
      // 1. Fetch project submissions
      const subRes = await api.get('/submissions/project');
      const allSubs = subRes.data || [];
      const roomSubs = allSubs.filter(sub => sub.room_id === activeRoom.id);
      setProjectSubmissions(roomSubs);

      // 2. Fetch real student grades for this room
      const gradesRes = await api.get(`/rooms/${activeRoom.id}/grades`);
      setStudentGrades(gradesRes.data || []);

      // 3. Fetch AI class insights for active room
      const insRes = await aiService.getClassInsights(activeRoom.id, 'easy-1');
      setInsights(insRes);

      // 4. Fetch meetings list
      const pertRes = await api.get(`/rooms/${activeRoom.id}/pertemuan`);
      setPertemuanList(pertRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data analitik kelas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Rata-rata hanya dari angka NYATA (null = belum ada data → dilewati),
  // tidak mengarang skor. Kembalikan null bila tak ada data sama sekali.
  const meanOf = (nums) => {
    const real = nums.filter((n) => typeof n === 'number');
    return real.length ? Math.round(real.reduce((a, b) => a + b, 0) / real.length) : null;
  };

  // Distribusi nilai: komposit per siswa = rata-rata nilai nyata yang dimiliki
  // (misi belajar + proyek). Siswa tanpa nilai apa pun tidak dihitung.
  const distributionData = useMemo(() => {
    let under70 = 0, under80 = 0, under90 = 0, under100 = 0, belumAda = 0;
    studentGrades.forEach(s => {
      const avg = meanOf([s.learning, s.project]);
      if (avg === null) { belumAda++; return; }
      if (avg < 70) under70++;
      else if (avg < 80) under80++;
      else if (avg < 90) under90++;
      else under100++;
    });
    return { under70, under80, under90, under100, belumAda };
  }, [studentGrades]);

  // Rata-rata pilar CT kelas — hanya siswa yang punya skor CT nyata
  const classPillarData = useMemo(() => {
    const pillar = (key) => meanOf(studentGrades.map((s) => s[key])) ?? 0;
    return [
      { name: 'Dekomposisi', score: pillar('decomposition'), color: 'bg-blue-500', text: 'blue-600' },
      { name: 'Abstraksi', score: pillar('abstraction'), color: 'bg-pink-500', text: 'pink-650' },
      { name: 'Pengenalan Pola', score: pillar('pattern_recognition'), color: 'bg-amber-500', text: 'amber-600' },
      { name: 'Desain Algoritma', score: pillar('algorithm_design'), color: 'bg-emerald-500', text: 'emerald-600' }
    ];
  }, [studentGrades]);

  // Rata-rata skor CT kelas (hanya yang punya data)
  const classAverageCT = useMemo(
    () => meanOf(studentGrades.map((s) => s.ct)) ?? 0,
    [studentGrades],
  );

  // Partisipasi: siswa yang punya minimal satu nilai nyata
  const participationRate = useMemo(() => {
    if (studentGrades.length === 0) return 0;
    const active = studentGrades.filter(
      (s) => typeof s.learning === 'number' || typeof s.project === 'number',
    ).length;
    return Math.round((active / studentGrades.length) * 100);
  }, [studentGrades]);

  return (
    <div className="w-full px-4 md:px-6 py-8 flex flex-col gap-8 text-left max-w-[1200px] mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="font-fredoka text-3xl font-bold text-slate-800 mb-1">Penilaian & Analitik Kelas</h2>
          <p className="font-nunito text-slate-650 font-semibold">
            Pantau rekapitulasi nilai, statistik pencapaian kognitif, dan peta kesulitan berpikir komputasional siswa secara real-time.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={!activeRoom || isExporting}
          className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-2 border-[#0F172A] font-fredoka text-sm font-bold rounded-xl shadow-[3px_3px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className={`ti ${isExporting ? 'ti-loader animate-spin' : 'ti-file-spreadsheet'} text-base`} />
          {isExporting ? 'Menyiapkan...' : 'Unduh Excel'}
        </button>
      </div>

      {/* Custom Class Selector Dropdown */}
      {rooms.length > 0 && (
        <div className="bg-white border-4 border-[#0F172A] shadow-[6px_6px_0px_#0F172A] p-5 rounded-[24px] flex flex-col sm:flex-row gap-4 items-center justify-between relative z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 border-2 border-[#0F172A] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#0F172A] text-blue-600 shrink-0">
              <i className="ti ti-school text-xl" />
            </div>
            <div>
              <span className="font-nunito text-[9px] font-black text-slate-400 uppercase tracking-widest block">Manajemen Kelas</span>
              <span className="font-fredoka text-base font-bold text-slate-800">Kelas Aktif Saat Ini</span>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            {/* Custom Dropdown Trigger */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#0F172A] rounded-xl font-fredoka font-bold text-blue-700 shadow-[3px_3px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer flex justify-between items-center transition-all select-none"
            >
              <span className="truncate mr-2">
                {activeRoom ? `${activeRoom.name}` : 'Pilih Kelas...'}
              </span>
              <i className={`ti ti-chevron-down text-base font-bold transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsDropdownOpen(false)}
                />

                <div className="absolute right-0 top-full mt-2 w-full bg-white border-2 border-[#0F172A] shadow-[5px_5px_0px_#0F172A] rounded-xl z-50 overflow-hidden flex flex-col max-h-60 overflow-y-auto">
                  {rooms.map((room) => {
                    const isSelected = room.id === activeRoom?.id;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setActiveRoom(room);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-4 py-3 text-left font-nunito font-bold text-xs border-b border-dashed border-slate-100 transition-colors cursor-pointer w-full flex justify-between items-center ${isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'text-[#0F172A] hover:bg-blue-50 hover:text-blue-700'
                          }`}
                      >
                        <span className="truncate pr-2">{room.name}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-fredoka font-bold border shrink-0 ${isSelected
                            ? 'bg-blue-500 text-white border-blue-400'
                            : 'bg-yellow-300 text-[#0F172A] border-[#0F172A]'
                          }`}>
                          {room.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!activeRoom ? (
        <div className="py-16 text-center border-4 border-[#0F172A] rounded-[24px] bg-white shadow-[6px_6px_0px_#0F172A] p-8 max-w-xl mx-auto flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-slate-100 border-2 border-slate-350 text-slate-400 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#0F172A]">
            <i className="ti ti-school text-3xl" />
          </div>
          <h3 className="font-fredoka text-xl font-bold text-slate-800">Pilih Ruang Kelas Terlebih Dahulu</h3>
          <p className="font-nunito text-xs text-slate-500 font-bold max-w-sm leading-relaxed">
            Masuk ke menu Ruang Belajar dan pilih salah satu kelas aktif Anda untuk melihat buku nilai dan analisis perkembangan siswa.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white border-4 border-[#0F172A] rounded-2xl shadow-[6px_6px_0px_#0F172A]">
          <i className="ti ti-loader animate-spin text-4xl text-slate-400" />
          <p className="font-nunito font-bold text-slate-500 mt-4">Memuat data analitik...</p>
        </div>
      ) : studentGrades.length === 0 ? (
        <div className="py-16 text-center border-4 border-[#0F172A] rounded-[24px] bg-white shadow-[6px_6px_0px_#0F172A] p-8 max-w-xl mx-auto flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-slate-100 border-2 border-slate-350 text-slate-400 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#0F172A]">
            <i className="ti ti-users text-3xl" />
          </div>
          <h3 className="font-fredoka text-xl font-bold text-slate-800">Belum Ada Siswa Bergabung</h3>
          <p className="font-nunito text-xs text-slate-500 font-bold max-w-sm leading-relaxed">
            Berikan Kode Kelas <strong className="text-blue-600 text-sm uppercase tracking-wide">"{activeRoom.code}"</strong> kepada siswa Anda agar mereka dapat bergabung dan mulai mengerjakan misi belajar!
          </p>
        </div>
      ) : (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-[#0F172A] p-4 rounded-xl shadow-[3px_3px_0px_#0F172A] text-center">
              <span className="font-nunito text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Rata-rata CT Kelas</span>
              <span className="font-fredoka text-2xl font-bold text-blue-600">{classAverageCT}%</span>
            </div>
            <div className="bg-white border-2 border-[#0F172A] p-4 rounded-xl shadow-[3px_3px_0px_#0F172A] text-center">
              <span className="font-nunito text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Siswa Aktif</span>
              <span className="font-fredoka text-2xl font-bold text-[#0F172A]">{studentGrades.length} Siswa</span>
            </div>
            <div className="bg-white border-2 border-[#0F172A] p-4 rounded-xl shadow-[3px_3px_0px_#0F172A] text-center">
              <span className="font-nunito text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Proyek Disubmit</span>
              <span className="font-fredoka text-2xl font-bold text-emerald-600">{projectSubmissions.length} Karya</span>
            </div>
            <div className="bg-white border-2 border-[#0F172A] p-4 rounded-xl shadow-[3px_3px_0px_#0F172A] text-center">
              <span className="font-nunito text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Partisipasi Misi</span>
              <span className="font-fredoka text-2xl font-bold text-pink-600">{participationRate}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Panel: Table of student grades */}
            <div className="lg:col-span-8 bg-white border-4 border-[#0F172A] shadow-[6px_6px_0px_#0F172A] p-6 rounded-[24px] flex flex-col justify-between overflow-hidden">
              <div className="w-full">
                <h3 className="font-fredoka text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                  <i className="ti ti-table text-blue-600 text-xl" />
                  Buku Nilai Computational Thinking
                </h3>

                <div className="overflow-x-auto border-2 border-[#0F172A] rounded-xl shadow-[2px_2px_0px_#0F172A]">
                  <table className="w-full text-xs font-nunito font-bold text-slate-700 min-w-[550px]">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-[#0F172A] text-left">
                        <th className="p-3 text-center">No</th>
                        <th className="p-3">Nama Lengkap</th>
                        <th className="p-3 text-center">Misi Belajar</th>
                        <th className="p-3 text-center">Proyek</th>
                        <th className="p-3 text-center">Skor CT</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentGrades.map((student, idx) => (
                        <tr
                          key={idx}
                          onClick={() => handleOpenStudentDetail(student)}
                          className="border-b border-slate-200 bg-white hover:bg-blue-50/40 cursor-pointer transition-colors"
                        >
                          <td className="p-3 text-center text-slate-450">{idx + 1}</td>
                          <td className="p-3 font-fredoka font-bold text-slate-800">{student.name}</td>
                          <td className="p-3 text-center">{student.learning ?? '-'}</td>
                          <td className="p-3 text-center">{student.project ?? '-'}</td>
                          <td className="p-3 text-center text-blue-600 font-bold">{student.ct ?? '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] border ${student.status === "Selesai"
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                                : student.status === "Perlu Dinilai"
                                  ? 'bg-amber-50 text-amber-700 border-amber-250'
                                  : student.status === "Dalam Proses"
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenStudentDetail(student)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border-2 border-[#0F172A] font-fredoka text-[10px] font-bold rounded-lg shadow-[1.5px_1.5px_0px_#0F172A] cursor-pointer transition-all active:translate-y-0.5 hover:-translate-y-0.5 flex items-center gap-1 mx-auto"
                            >
                              <i className="ti ti-eye text-xs" />
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Panel: Clean HTML Sebaran & Distribusi (No Recharts) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Pillar CT Distribution using simple progress bars */}
              <div className="bg-white border-4 border-[#0F172A] shadow-[6px_6px_0px_#0F172A] p-5 rounded-[24px] flex flex-col justify-between">
                <h4 className="font-fredoka text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <i className="ti ti-chart-radar text-blue-600" />
                  Rata-rata Pilar CT Kelas
                </h4>
                <div className="flex flex-col gap-3.5">
                  {classPillarData.map((p, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-fredoka text-[10px] font-bold text-slate-700">{p.name}</span>
                        <span className={`font-fredoka text-[10px] font-bold text-${p.text}`}>{p.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 border-2 border-[#0F172A] rounded-full h-3 overflow-hidden">
                        <div
                          className={`${p.color} h-full border-r-2 border-[#0F172A]`}
                          style={{ width: `${p.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Range Distribution Card */}
              <div className="bg-white border-4 border-[#0F172A] shadow-[6px_6px_0px_#0F172A] p-5 rounded-[24px] flex flex-col">
                <h4 className="font-fredoka text-sm font-bold text-slate-800 mb-3 text-left flex items-center gap-1.5">
                  <i className="ti ti-chart-bar text-amber-500" />
                  Distribusi Nilai Kelas
                </h4>

                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center border-2 border-[#0F172A] p-2.5 rounded-xl bg-slate-50 shadow-[2px_2px_0px_#0F172A]">
                    <span className="font-fredoka text-[10px] font-bold text-slate-700">Maju (90 - 100)</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg text-[10px] font-fredoka font-bold border border-emerald-300">
                      {distributionData.under100} Siswa
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-2 border-[#0F172A] p-2.5 rounded-xl bg-slate-50 shadow-[2px_2px_0px_#0F172A]">
                    <span className="font-fredoka text-[10px] font-bold text-slate-700">Cakap (80 - 89)</span>
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg text-[10px] font-fredoka font-bold border border-blue-300">
                      {distributionData.under90} Siswa
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-2 border-[#0F172A] p-2.5 rounded-xl bg-slate-50 shadow-[2px_2px_0px_#0F172A]">
                    <span className="font-fredoka text-[10px] font-bold text-slate-700">Layak (70 - 79)</span>
                    <span className="bg-yellow-100 text-yellow-850 px-2.5 py-0.5 rounded-lg text-[10px] font-fredoka font-bold border border-yellow-300">
                      {distributionData.under80} Siswa
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-2 border-[#0F172A] p-2.5 rounded-xl bg-slate-50 shadow-[2px_2px_0px_#0F172A]">
                    <span className="font-fredoka text-[10px] font-bold text-slate-700">Perlu Bimbingan (&lt; 70)</span>
                    <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-lg text-[10px] font-fredoka font-bold border border-red-300">
                      {distributionData.under70} Siswa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-center items-center overflow-y-auto p-4">
          <div className="w-full max-w-4xl bg-white border-4 border-[#0F172A] rounded-[24px] shadow-[8px_8px_0px_#0F172A] flex flex-col my-auto relative max-h-[92vh] overflow-hidden">
            <div className="bg-[#3B82F6] text-white px-6 py-4 flex justify-between items-center border-b-4 border-[#0F172A]">
              <div className="text-left">
                <span className="font-nunito text-[9px] font-black text-blue-100 uppercase tracking-widest block mb-0.5">Detail Perkembangan Siswa</span>
                <h3 className="font-fredoka text-lg font-bold flex items-center gap-1.5">
                  <i className="ti ti-user text-xl" />
                  {selectedStudent.name}
                </h3>
                <p className="font-nunito text-[11px] text-blue-100 font-bold mt-0.5">
                  {selectedStudent.email}
                </p>
              </div>
              <button
                onClick={() => { setSelectedStudent(null); setStudentDetails(null); }}
                className="text-white hover:opacity-75 cursor-pointer text-xl font-bold"
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-left max-h-[70vh] bg-slate-50">
              {loadingDetails ? (
                <div className="py-12 text-center">
                  <i className="ti ti-loader animate-spin text-3xl text-blue-600 mb-2" />
                  <p className="font-nunito text-xs text-slate-500 font-bold">Memuat rincian tugas siswa...</p>
                </div>
              ) : !studentDetails ? (
                <div className="py-12 text-center">
                  <i className="ti ti-alert-triangle text-3xl text-red-500 mb-2" />
                  <p className="font-nunito text-xs text-slate-500 font-bold">Gagal mengambil data.</p>
                </div>
              ) : (
                <>
                  {(() => {
                    const activities = [];
                    (pertemuanList || [])
                      .slice()
                      .sort((a, b) => a.urutan - b.urutan)
                      .forEach((pert) => {
                        const lSub = studentDetails.learning?.find((s) => s.pertemuan_id === pert.id);
                        const pSub = studentDetails.projects?.find((s) => s.pertemuan_id === pert.id);

                        const isLearningDefined = studentDetails.definedTasks
                          ? studentDetails.definedTasks.learning?.some((t) => t.pertemuan_id === pert.id)
                          : true;
                        
                        const isProjectDefined = studentDetails.definedTasks
                          ? studentDetails.definedTasks.projects?.some((t) => t.pertemuan_id === pert.id)
                          : true;

                        if (isLearningDefined) {
                          activities.push({
                            id: `${pert.id}-learning`,
                            type: 'learning',
                            pert,
                            sub: lSub,
                          });
                        }

                        if (isProjectDefined) {
                          activities.push({
                            id: `${pert.id}-project`,
                            type: 'project',
                            pert,
                            sub: pSub,
                          });
                        }
                      });

                    return (
                      <div className="flex flex-col gap-6">
                        {/* Summary CT Grid */}
                        <div className="bg-white border-2 border-[#0F172A] p-4 rounded-xl shadow-[3px_3px_0px_#0F172A] flex flex-col gap-3">
                          <h4 className="font-fredoka text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <i className="ti ti-chart-bar text-indigo-650" />
                            Rata-rata Capaian Pilar CT Siswa
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                              { label: 'Dekomposisi', val: selectedStudent.decomposition, c: 'text-blue-600 bg-blue-50 border-blue-200' },
                              { label: 'Abstraksi', val: selectedStudent.abstraction, c: 'text-pink-650 bg-pink-50 border-pink-200' },
                              { label: 'Pengenalan Pola', val: selectedStudent.pattern_recognition, c: 'text-amber-600 bg-amber-50 border-amber-250' },
                              { label: 'Desain Algoritma', val: selectedStudent.algorithm_design, c: 'text-emerald-600 bg-emerald-50 border-emerald-250' },
                              { label: 'CT Komposit', val: selectedStudent.ct, c: 'text-indigo-600 bg-indigo-50 border-indigo-200 font-black' },
                            ].map((p) => (
                              <div key={p.label} className={`border-2 rounded-xl p-3 shadow-[1.5px_1.5px_0px_#0f172a] text-center flex flex-col justify-between ${p.c}`}>
                                <span className="font-fredoka text-[9px] font-bold text-slate-500 uppercase block mb-1">{p.label}</span>
                                <span className="font-fredoka text-xl font-bold">{p.val !== null ? `${p.val}%` : '-'}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tasks List */}
                        <div className="flex flex-col gap-4">
                          <h4 className="font-fredoka text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <i className="ti ti-clipboard-list text-blue-600" />
                            Aktivitas & Submisi Kelas ({activities.length} Aktivitas)
                          </h4>

                          {activities.length === 0 ? (
                            <p className="font-nunito text-xs text-slate-500 font-bold italic py-4 text-center">Tidak ada aktivitas terdaftar.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {activities.map((act) => {
                                const pert = act.pert;
                                if (act.type === 'learning') {
                                  const lSub = act.sub;
                                  return (
                                    <div key={act.id} className="bg-white border-2 border-[#0F172A] rounded-[20px] p-5 shadow-[4px_4px_0px_#0F172A] flex flex-col justify-between gap-4 text-left">
                                      <div className="flex flex-col gap-3">
                                        <div className="border-b border-dashed border-slate-200 pb-2 flex flex-col gap-0.5">
                                          <span className="font-nunito text-[9px] font-black text-slate-400 uppercase">Pertemuan {pert.urutan}</span>
                                          <h5 className="font-fredoka text-sm font-bold text-slate-800 line-clamp-1">
                                            {pert.judul}
                                          </h5>
                                        </div>

                                        <div className="flex justify-between items-center">
                                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-fredoka font-bold px-2 py-0.5 rounded">
                                            Misi Belajar
                                          </span>
                                          <span className={`text-[10px] font-fredoka font-bold px-2 py-0.5 rounded-lg border ${
                                            lSub
                                              ? lSub.ctScore >= KKM
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                : 'bg-amber-50 text-amber-700 border-amber-300'
                                              : 'bg-slate-200 text-slate-500 border-slate-350'
                                          }`}>
                                            {lSub
                                              ? lSub.ctScore >= KKM ? 'Tuntas' : `Remidi (KKM ${KKM})`
                                              : 'Belum Dikerjakan'}
                                          </span>
                                        </div>

                                        {lSub ? (
                                          <div className="flex flex-col gap-2.5 text-xs font-nunito font-semibold text-slate-700">
                                            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                              <div className="bg-white border border-[#0F172A] rounded-lg p-1.5">
                                                <p className="text-slate-400 font-bold uppercase text-[8px]">Skor</p>
                                                <p className="font-fredoka text-sm font-bold text-slate-800">{lSub.ctScore}</p>
                                              </div>
                                              <div className="bg-white border border-[#0F172A] rounded-lg p-1.5">
                                                <p className="text-slate-400 font-bold uppercase text-[8px]">Akurasi</p>
                                                <p className="font-fredoka text-sm font-bold text-slate-800">{lSub.accuracy}%</p>
                                              </div>
                                              <div className="bg-white border border-[#0F172A] rounded-lg p-1.5">
                                                <p className="text-slate-400 font-bold uppercase text-[8px]">Percobaan</p>
                                                <p className="font-fredoka text-sm font-bold text-slate-800">{lSub.attempts}x</p>
                                              </div>
                                            </div>

                                            {/* Pillar CT scores */}
                                            {lSub.ct_post_score && (
                                              <div className="bg-white border border-[#0F172A] p-2 rounded-lg text-[10px] grid grid-cols-2 gap-1.5">
                                                {Object.entries(lSub.ct_post_score).map(([pilar, skor]) => (
                                                  <div key={pilar} className="flex justify-between items-center border-b border-dashed border-slate-100 last:border-b-0 pb-0.5">
                                                    <span className="capitalize font-bold text-slate-500">{pilar.replace('_', ' ')}</span>
                                                    <span className="font-fredoka font-black text-slate-800">{skor}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            {lSub.reflection_answers?.answer && (
                                              <div className="bg-white border border-[#0F172A] p-2.5 rounded-lg text-[10px]">
                                                <p className="font-fredoka font-bold text-slate-500 mb-0.5"><i className="ti ti-notes" /> Refleksi Siswa:</p>
                                                <p className="italic text-slate-700 font-semibold">"{lSub.reflection_answers.answer}"</p>
                                              </div>
                                            )}

                                            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-[10px] text-blue-900 leading-normal">
                                              <p className="font-fredoka font-bold text-blue-800 mb-0.5"><i className="ti ti-sparkles" /> Umpan Balik AI:</p>
                                              <p className="italic font-semibold">"{lSub.teacherComment}"</p>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-[11px] font-nunito font-semibold text-slate-400 italic py-2">Belum ada submission.</p>
                                        )}
                                      </div>

                                      {lSub && (
                                        <div className="mt-auto pt-2 border-t border-slate-150">
                                          <button
                                            onClick={() => setExpandedPreview(expandedPreview === act.id ? null : act.id)}
                                            className="w-full text-center px-3 py-1.5 border border-[#0F172A] bg-white text-slate-750 font-fredoka text-[10px] font-bold rounded-lg shadow-[1.5px_1.5px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all flex items-center justify-center gap-1"
                                          >
                                            <i className={`ti ${expandedPreview === act.id ? 'ti-chevron-up' : 'ti-code'}`} />
                                            {expandedPreview === act.id ? 'Sembunyikan Karya' : 'Lihat Hasil Karya'}
                                          </button>
                                          {expandedPreview === act.id && (
                                            <RekapArtifact ast={lSub.ast} />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                } else {
                                  const pSub = act.sub;
                                  return (
                                    <div key={act.id} className="bg-white border-2 border-[#0F172A] rounded-[20px] p-5 shadow-[4px_4px_0px_#0F172A] flex flex-col justify-between gap-4 text-left">
                                      <div className="flex flex-col gap-3">
                                        <div className="border-b border-dashed border-slate-200 pb-2 flex flex-col gap-0.5">
                                          <span className="font-nunito text-[9px] font-black text-slate-400 uppercase">Pertemuan {pert.urutan}</span>
                                          <h5 className="font-fredoka text-sm font-bold text-slate-800 line-clamp-1">
                                            {pert.judul}
                                          </h5>
                                        </div>

                                        <div className="flex justify-between items-center">
                                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-[10px] font-fredoka font-bold px-2 py-0.5 rounded">
                                            Proyek
                                          </span>
                                          <span className={`text-[10px] font-fredoka font-bold px-2 py-0.5 rounded-lg border ${
                                            pSub
                                              ? pSub.teacher_score !== null
                                                ? pSub.teacher_score >= KKM
                                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                  : 'bg-amber-50 text-amber-700 border-amber-300'
                                                : 'bg-yellow-50 text-yellow-800 border-yellow-300 border-dashed'
                                              : 'bg-slate-200 text-slate-500 border-slate-350'
                                          }`}>
                                            {pSub
                                              ? pSub.teacher_score !== null
                                                ? pSub.teacher_score >= KKM ? 'Tuntas' : `Remidi (KKM ${KKM})`
                                                : 'Perlu Dinilai'
                                              : 'Belum Dikerjakan'}
                                          </span>
                                        </div>

                                        {pSub ? (
                                          <div className="flex flex-col gap-2.5 text-xs font-nunito font-semibold text-slate-700">
                                            <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                                              <div className="bg-white border border-[#0F172A] rounded-lg p-1.5">
                                                <p className="text-slate-400 font-bold uppercase text-[8px]">Skor Evaluasi</p>
                                                <p className="font-fredoka text-sm font-bold text-slate-800">
                                                  {pSub.teacher_score !== null ? pSub.teacher_score : 'Belum dinilai'}
                                                </p>
                                              </div>
                                              <div className="bg-white border border-[#0F172A] rounded-lg p-1.5">
                                                <p className="text-slate-400 font-bold uppercase text-[8px]">Percobaan</p>
                                                <p className="font-fredoka text-sm font-bold text-slate-800">{pSub.attempts}x</p>
                                              </div>
                                            </div>

                                            {/* Rubric scores breakdown */}
                                            {pSub.rubrik_scores && Object.keys(pSub.rubrik_scores).length > 0 && (
                                              <div className="bg-white border border-[#0F172A] p-2.5 rounded-lg text-[10px]">
                                                <p className="font-fredoka font-bold text-slate-500 mb-1.5"><i className="ti ti-list-check" /> Rubrik Penilaian Guru:</p>
                                                <div className="flex flex-col gap-1">
                                                  {Object.entries(pSub.rubrik_scores).map(([kriteria, skor]) => {
                                                    const lvlInfo = scoreToLevel(skor);
                                                    const bobot = pSub.rubrik?.find((c) => criterionName(c) === kriteria)?.bobot;
                                                    return (
                                                      <div key={kriteria} className="flex justify-between items-center border-b border-dashed border-slate-100 last:border-b-0 pb-0.5">
                                                        <span className="font-bold text-slate-700">
                                                          {kriteria} {bobot ? `(${bobot}%)` : ''}
                                                        </span>
                                                        <span className="font-fredoka font-bold text-slate-800">
                                                          {skor} ({lvlInfo.level})
                                                        </span>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}

                                            {pSub.teacher_comment && (
                                              <div className="bg-white border border-[#0F172A] p-2.5 rounded-lg text-[10px]">
                                                <p className="font-fredoka font-bold text-slate-500 mb-0.5"><i className="ti ti-user-check" /> Catatan Guru:</p>
                                                <p className="italic text-slate-700 font-semibold">"{pSub.teacher_comment}"</p>
                                              </div>
                                            )}

                                            <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-lg text-[10px] text-indigo-900 leading-normal">
                                              <p className="font-fredoka font-bold text-indigo-800 mb-0.5"><i className="ti ti-sparkles" /> Analisis AI (Saran):</p>
                                              <p className="italic font-semibold">"{pSub.ai_suggestion?.analysis || 'Tidak ada analisis.'}"</p>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-[11px] font-nunito font-semibold text-slate-400 italic py-2">Belum ada submission.</p>
                                        )}
                                      </div>

                                      {pSub && (
                                        <div className="mt-auto pt-2 border-t border-slate-150">
                                          <button
                                            onClick={() => setExpandedPreview(expandedPreview === act.id ? null : act.id)}
                                            className="w-full text-center px-3 py-1.5 border border-[#0F172A] bg-white text-slate-750 font-fredoka text-[10px] font-bold rounded-lg shadow-[1.5px_1.5px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all flex items-center justify-center gap-1"
                                          >
                                            <i className={`ti ${expandedPreview === act.id ? 'ti-chevron-up' : 'ti-code'}`} />
                                            {expandedPreview === act.id ? 'Sembunyikan Karya' : 'Lihat Hasil Proyek'}
                                          </button>
                                          {expandedPreview === act.id && (
                                            <RekapArtifact ast={pSub.final_ast} />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            <div className="bg-slate-100 border-t-4 border-[#0F172A] px-6 py-4 flex justify-end">
              <button
                onClick={() => { setSelectedStudent(null); setStudentDetails(null); }}
                className="px-5 py-2.5 bg-white text-[#0F172A] border-2 border-[#0F172A] shadow-[2.5px_2.5px_0px_#0F172A] font-fredoka text-xs font-bold rounded-xl hover:-translate-y-0.5 active:translate-y-[0.5px] cursor-pointer transition-all"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
