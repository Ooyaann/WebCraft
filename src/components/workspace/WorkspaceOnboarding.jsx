import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function WorkspaceOnboarding({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem('webcraft_hide_onboarding', 'true');
    }
    onClose();
  };

  const steps = [
    {
      title: "Selamat Datang di WebCraft!",
      subtitle: "Petualangan pemrograman web interaktif berbasis Computational Thinking.",
      content: (
        <div className="flex flex-col items-center text-center p-2">
          {/* Welcome Interactive Animation */}
          <div className="relative w-full h-44 bg-[#F0F7FF] border-2 border-[#0F172A] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner mb-4">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Animated Code Floating Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute left-6 top-6 bg-white border border-[#0F172A] px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold shadow-[1px_1px_0px_#0F172A]"
            >
              &lt;body&gt;
            </motion.div>
            <motion.div 
              animate={{ y: [0, 8, 0], rotate: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-8 top-10 bg-white border border-[#0F172A] px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold shadow-[1px_1px_0px_#0F172A]"
            >
              &lt;h1&gt;Halo&lt;/h1&gt;
            </motion.div>
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute right-12 bottom-6 bg-white border border-[#0F172A] px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold shadow-[1px_1px_0px_#0F172A]"
            >
              color: blue;
            </motion.div>

            {/* Central Rocket Character */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
              className="relative z-10 flex flex-col items-center"
            >
              <i className="ti ti-rocket text-5xl text-blue-500" />
              <div className="w-12 h-1.5 bg-[#0F172A] opacity-20 rounded-full blur-[1px] mt-2 animate-pulse"></div>
            </motion.div>

            {/* Sparkles */}
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute left-1/4 top-1/3 text-yellow-400 text-lg"
            >
              ✦
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.7 }}
              className="absolute right-1/4 bottom-1/3 text-pink-400 text-lg"
            >
              ✦
            </motion.div>
          </div>

          <p className="font-nunito text-sm text-slate-700 leading-relaxed font-bold">
            Di WebCraft, kamu tidak perlu mengetik kode yang rumit secara manual. Kamu akan merakit struktur HTML dan gaya CSS menggunakan <span className="text-[#3B82F6]">Blok Visual</span> yang menyenangkan, sekaligus mengasah kemampuan berpikir logismu!
          </p>
        </div>
      )
    },
    {
      title: "1. Seret & Lepas Blok (Drag & Drop)",
      subtitle: "Susun kode web impianmu dengan menyatukan blok-blok semantik.",
      content: (
        <div className="flex flex-col items-center text-center p-2">
          {/* Animated Drag-and-Drop Mockup */}
          <div className="relative w-full h-44 bg-[#F0F7FF] border-2 border-[#0F172A] rounded-2xl overflow-hidden flex items-center justify-between px-6 shadow-inner mb-4">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Left: Palette mockup */}
            <div className="w-[38%] h-32 bg-white border-2 border-[#0F172A] rounded-xl p-2 flex flex-col gap-1.5 z-10 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              <span className="font-fredoka text-[9px] text-slate-400 font-bold block text-left">PALET BLOK</span>
              <div className="h-6 bg-blue-100 border border-blue-400 rounded-md flex items-center px-1.5 gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
                <span className="font-mono text-[9px] font-bold text-blue-800">body</span>
              </div>
              <div className="h-6 bg-pink-100 border border-pink-400 rounded-md flex items-center px-1.5 gap-1 relative opacity-40">
                <span className="w-2.5 h-2.5 rounded bg-pink-500 inline-block"></span>
                <span className="font-mono text-[9px] font-bold text-pink-800">h1</span>
              </div>
              <div className="h-6 bg-yellow-100 border border-yellow-400 rounded-md flex items-center px-1.5 gap-1 opacity-50">
                <span className="w-2.5 h-2.5 rounded bg-yellow-500 inline-block"></span>
                <span className="font-mono text-[9px] font-bold text-yellow-800">p</span>
              </div>
            </div>

            {/* Center Animated Moving Pointer and Block */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Floating block shadow */}
              <motion.div
                animate={{
                  x: [45, 185, 185, 45],
                  y: [60, 60, 42, 60],
                  scale: [1, 1.1, 1, 1],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  times: [0, 0.45, 0.8, 1],
                  ease: "easeInOut"
                }}
                className="absolute bg-pink-100 border-2 border-pink-500 rounded-md px-2 py-1 flex items-center gap-1 shadow-md font-mono text-[9px] font-bold text-pink-800"
              >
                <span className="w-2 h-2 rounded bg-pink-500 inline-block"></span> h1
              </motion.div>

              {/* Cursor finger */}
              <motion.div
                animate={{
                  x: [65, 205, 205, 65],
                  y: [75, 75, 57, 75],
                  scale: [1, 0.9, 1, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  times: [0, 0.45, 0.8, 1],
                  ease: "easeInOut"
                }}
                className="absolute text-slate-800"
              >
                <i className="ti ti-pointer text-2xl" />
              </motion.div>
            </div>

            {/* Right: Workspace mockup */}
            <div className="w-[45%] h-32 bg-white border-2 border-[#0F172A] rounded-xl p-2 flex flex-col gap-1.5 z-10 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              <span className="font-fredoka text-[9px] text-slate-400 font-bold block text-left">KANVAS KODE</span>
              <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg p-1.5 flex flex-col gap-1 overflow-hidden">
                <div className="h-6 bg-blue-50 border border-dashed border-blue-300 rounded-md flex items-center px-1.5 gap-1">
                  <span className="font-mono text-[8px] font-bold text-blue-600">body</span>
                </div>
                
                {/* Animated slot filling */}
                <motion.div
                  animate={{
                    opacity: [0, 0, 1, 0],
                    scale: [0.9, 0.9, 1, 0.9]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    times: [0, 0.45, 0.5, 0.95],
                    ease: "easeInOut"
                  }}
                  className="h-6 ml-3 bg-pink-50 border border-pink-400 rounded-md flex items-center px-1.5 gap-1"
                >
                  <span className="font-mono text-[8px] font-bold text-pink-600">h1</span>
                </motion.div>
              </div>
            </div>
          </div>

          <p className="font-nunito text-sm text-slate-700 leading-relaxed font-bold">
            Seret blok dari <span className="text-[#3B82F6]">Palet Blok</span> sebelah kiri, lalu tempatkan ke dalam <span className="text-[#EC4899]">Kanvas Kode</span> di bagian tengah. Susun secara berurutan atau masukkan blok ke dalam wadah lainnya (nesting)!
          </p>
        </div>
      )
    },
    {
      title: "2. Computational Thinking Journey",
      subtitle: "Petualangan menganalisis masalah sebelum membuat kode web.",
      content: (
        <div className="flex flex-col items-center text-center p-2">
          {/* Animated CT Steps */}
          <div className="relative w-full h-44 bg-[#F0F7FF] border-2 border-[#0F172A] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner mb-4">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="flex gap-2 items-center justify-center w-full px-4 z-10">
              {[
                { name: "Dekomposisi", icon: "ti-puzzle", color: "bg-blue-400", textCol: "text-blue-500" },
                { name: "Abstraksi", icon: "ti-search", color: "bg-pink-400", textCol: "text-pink-500" },
                { name: "Pola", icon: "ti-bulb", color: "bg-yellow-400", textCol: "text-amber-500" },
                { name: "Algoritma", icon: "ti-settings", color: "bg-emerald-400", textCol: "text-emerald-500" }
              ].map((ct, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    y: [0, -6, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    delay: idx * 0.4,
                    ease: "easeInOut"
                  }}
                  className="flex-1 bg-white border-2 border-[#0F172A] rounded-xl p-1.5 flex flex-col items-center justify-center shadow-[2px_2px_0px_#0F172A] min-w-[70px]"
                >
                  <i className={`ti ${ct.icon} text-xl mb-1 ${ct.textCol}`} />
                  <span className="font-fredoka text-[9px] font-black leading-none text-center h-5 flex items-center justify-center">{ct.name}</span>
                  <div className={`w-3 h-3 rounded-full ${ct.color} border border-[#0F172A] mt-1.5`}></div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="font-nunito text-sm text-slate-700 leading-relaxed font-bold">
            Sebelum merakit blok di level tertentu, kamu akan diajak melatih logika berpikir melalui tantangan <span className="text-[#EC4899]">CT Journey</span>: memilah masalah (Dekomposisi), mengabaikan detail tak penting (Abstraksi), mengenali pola, dan menyusun langkah penyelesaian (Algoritma).
          </p>
        </div>
      )
    },
    {
      title: "3. Socratic AI Tutor & Cek Logika",
      subtitle: "Dapatkan bimbingan interaktif hangat dari Asisten AI Pintar.",
      content: (
        <div className="flex flex-col items-center text-center p-2">
          {/* Animated AI Chat Mockup */}
          <div className="relative w-full h-44 bg-[#F0F7FF] border-2 border-[#0F172A] rounded-2xl overflow-hidden flex flex-col p-3 shadow-inner mb-4">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Simulated Chat Bubble */}
            <div className="flex gap-2 items-start z-10 max-w-[85%] self-start mb-2">
              <div className="w-7 h-7 bg-indigo-600 border border-[#0F172A] rounded-lg flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                <i className="ti ti-robot text-xs text-white" />
              </div>
              <div className="bg-white border border-[#0F172A] rounded-xl px-2.5 py-1.5 shadow-[1.5px_1.5px_0px_#0F172A] text-left">
                <span className="font-fredoka text-[8px] font-bold text-indigo-600 block leading-none">Asisten Sokratik</span>
                <p className="font-nunito text-[10px] text-slate-700 font-bold mt-0.5 leading-snug">
                  Hebat! Di mana sebaiknya kita meletakkan judul &lt;h1&gt; agar tampil di dalam halaman web?
                </p>
              </div>
            </div>

            {/* Glow Check Button Simulation */}
            <div className="mt-auto flex justify-center z-10">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "2px 2px 0px #0F172A",
                    "3px 3px 0px #0F172A",
                    "2px 2px 0px #0F172A"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="bg-indigo-600 text-white border border-[#0F172A] px-3.5 py-1.5 rounded-xl font-fredoka text-[10px] font-bold flex items-center gap-1.5"
              >
                <i className="ti ti-sparkles text-yellow-300 animate-pulse" />
                Cek Logika Kode (AI)
              </motion.div>
            </div>
          </div>

          <p className="font-nunito text-sm text-slate-700 leading-relaxed font-bold">
            Gunakan tombol <span className="text-[#6366F1]">Cek Logika Kode (AI)</span> setelah menyusun blok. Tutor AI tidak akan langsung memberi jawaban, melainkan mengajukan pertanyaan penuntun (Sokratik) untuk membantumu memecahkan teka-teki logika koding secara mandiri!
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative bg-white w-full max-w-lg border-4 border-[#0F172A] rounded-2xl shadow-[6px_6px_0px_#0F172A] overflow-hidden flex flex-col"
      >
        {/* Onboarding Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-5 py-4 border-b-4 border-[#0F172A] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <i className="ti ti-bulb text-xl text-yellow-300 animate-pulse" />
            <div>
              <h3 className="font-fredoka text-sm font-black tracking-wide leading-none text-white">Panduan Penggunaan</h3>
              <p className="font-mono text-[8px] text-indigo-300 mt-1 uppercase font-bold tracking-wider">Langkah {currentStep + 1} dari {steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <i className="ti ti-x text-sm" />
          </button>
        </div>

        {/* Dynamic Slide Content Container */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <h2 className="font-fredoka text-base font-black text-slate-900 text-center mb-1">
            {steps[currentStep].title}
          </h2>
          <p className="font-nunito text-xs text-slate-500 text-center mb-4 leading-relaxed">
            {steps[currentStep].subtitle}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Onboarding Footer */}
        <div className="bg-slate-50 border-t-4 border-[#0F172A] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
          {/* Don't show again Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 border-2 border-[#0F172A] rounded text-[#3B82F6] focus:ring-0 cursor-pointer"
            />
            <span className="font-nunito text-[11px] font-bold text-slate-600">Jangan tunjukkan lagi panduan ini</span>
          </label>

          {/* Navigation Controls */}
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-white text-slate-700 border-2 border-[#0F172A] rounded-xl font-fredoka text-xs font-bold shadow-[2px_2px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-[1px] hover:shadow-[3px_3px_0px_#0F172A] active:shadow-[1px_1px_0px_#0F172A] cursor-pointer transition-all"
              >
                Kembali
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-[#3B82F6] text-white border-2 border-[#0F172A] rounded-xl font-fredoka text-xs font-bold shadow-[2px_2px_0px_#0F172A] hover:-translate-y-0.5 active:translate-y-[1px] hover:shadow-[3px_3px_0px_#0F172A] active:shadow-[1px_1px_0px_#0F172A] cursor-pointer transition-all"
            >
              {currentStep === steps.length - 1 ? "Mulai Petualangan!" : "Lanjut"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
