import { useState, useRef } from 'react';
import { Award, Download, Copy, Check, X, Sparkles, ShieldCheck, Printer } from 'lucide-react';
import logo from '../../assets/logo.png';

const CertificateModal = ({ isOpen, onClose, certData }) => {
  const [copied, setCopied] = useState(false);
  const certRef = useRef(null);

  if (!isOpen || !certData) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(certData.certificate_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-[var(--bg-secondary,#080808)] border border-amber-500/30 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[95vh] overflow-y-auto scrollbar-thin">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-[var(--border,rgba(255,255,255,0.08))] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary,#ffffff)]">Verified Certificate of Completion</h2>
              <p className="text-xs text-[var(--text-muted,#71717a)]">Officially recognized learning milestone</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Print / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Render Frame */}
        <div
          ref={certRef}
          className="relative p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-4 border-double border-amber-500/40 text-center space-y-6 shadow-2xl overflow-hidden print:m-0 print:border-none print:shadow-none"
        >
          {/* Background watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <img src={logo} alt="Watermark" className="w-96 h-96" />
          </div>

          {/* Top Gold Crest */}
          <div className="flex justify-center items-center gap-3">
            <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl shadow-lg" />
            <div className="text-left">
              <span className="text-sm font-extrabold tracking-widest uppercase text-amber-500 block">
                Adhyaya AI
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
                Autonomous Learning Operating System
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.25em] font-extrabold text-amber-400">
              Certificate of Mastery & Completion
            </p>
            <p className="text-xs text-zinc-400 italic">This is proudly awarded to</p>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight py-2 font-serif">
              {certData.student_name}
            </h1>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
              for successfully completing all curriculum milestones, interactive video lessons, and mastery assessments in
            </p>
            <h2 className="text-lg sm:text-2xl font-bold text-amber-300 py-1">
              "{certData.course_title}"
            </h2>
          </div>

          {/* Metrics & Hash Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-4 border-t border-amber-500/20 text-center">
            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase font-mono">Lessons</p>
              <p className="text-sm font-bold text-white">{certData.total_lessons} Completed</p>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase font-mono">Mastery</p>
              <p className="text-sm font-bold text-emerald-400">{certData.mastery_score}% Score</p>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase font-mono">Issued Date</p>
              <p className="text-xs font-bold text-white mt-0.5">{certData.issued_at}</p>
            </div>
          </div>

          {/* Signature & Verification Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-amber-500/20 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Digitally Verified Credential</span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400">
                Verification ID: <span className="text-amber-400">{certData.certificate_id}</span>
              </p>
            </div>

            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-400 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Credential ID'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
