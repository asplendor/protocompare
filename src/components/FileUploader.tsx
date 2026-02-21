import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileCode } from 'lucide-react';
import { validateHTML, validateFile, readFileAsText, formatBytes } from '../utils/validators';

interface FileUploaderProps {
  side: 'Left' | 'Right';
  onLoad: (html: string) => void;
  onClose: () => void;
}

type Tab = 'upload' | 'paste';

export default function FileUploader({ side, onLoad, onClose }: FileUploaderProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  // Paste tab state — code persists when switching tabs or on failed renders
  const [pasteCode, setPasteCode] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Upload tab state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Upload tab ---
  const handleFileSelect = (file: File) => {
    setUploadError(null);
    try {
      validateFile(file);
      setUploadFile(file);
    } catch (e) {
      setUploadError((e as Error).message);
      setUploadFile(null);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setUploadError(null);
    try {
      const html = await readFileAsText(uploadFile);
      validateHTML(html);
      onLoad(html);
      onClose();
    } catch (e) {
      setUploadError((e as Error).message);
    }
  };

  // --- Paste tab ---
  const handlePasteSubmit = () => {
    setPasteError(null);
    try {
      validateHTML(pasteCode);
      onLoad(pasteCode);
      onClose();
      // Note: pasteCode is intentionally NOT cleared — state stays for re-editing
    } catch (e) {
      setPasteError((e as Error).message);
      // pasteCode is untouched — user's work stays in the textarea
    }
  };

  const charCount = pasteCode.length;
  const charLimit = 1_000_000;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div
        className="w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
            Load {side} Prototype
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)')
            }
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {(['upload', 'paste'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-sm font-medium capitalize transition-colors"
              style={{
                color:
                  activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom:
                  activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {tab === 'upload' ? 'Upload File' : 'Paste Code'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed cursor-pointer py-10 px-6 transition-colors"
                style={{
                  borderColor: isDragging ? 'var(--color-primary)' : 'var(--color-border)',
                  background: isDragging ? 'rgba(20,184,166,0.06)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <Upload
                  size={32}
                  style={{ color: isDragging ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                />
                <div className="text-center">
                  <p style={{ color: 'var(--color-text)' }} className="text-sm font-medium">
                    {uploadFile
                      ? uploadFile.name
                      : 'Drag & drop your HTML file here'}
                  </p>
                  {uploadFile ? (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatBytes(uploadFile.size)} · click to change
                    </p>
                  ) : (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      or click to browse · .html files only
                    </p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
              </div>

              {uploadError && (
                <p
                  className="text-sm rounded-lg px-3 py-2"
                  style={{
                    color: '#f87171',
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.25)',
                  }}
                >
                  {uploadError}
                </p>
              )}

              <button
                onClick={handleUploadSubmit}
                disabled={!uploadFile}
                className="btn-primary w-full rounded-lg px-4 py-2.5 text-sm"
              >
                Render Prototype
              </button>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={pasteCode}
                  onChange={(e) => {
                    setPasteCode(e.target.value);
                    setPasteError(null);
                  }}
                  placeholder={`Paste your HTML code here…\n\nTip: Ask Claude to export as a "single self-contained HTML file"`}
                  rows={12}
                  className="w-full rounded-lg border text-sm font-mono resize-none p-3 outline-none transition-colors"
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderColor: pasteError ? 'rgba(248,113,113,0.5)' : 'var(--color-border)',
                    color: 'var(--color-text)',
                    lineHeight: '1.5',
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--color-primary)')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = pasteError
                      ? 'rgba(248,113,113,0.5)'
                      : 'var(--color-border)')
                  }
                  spellCheck={false}
                />
                <div className="flex justify-between mt-1">
                  <span />
                  <span
                    className="text-xs"
                    style={{
                      color:
                        charCount > charLimit * 0.9
                          ? '#f87171'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {charCount.toLocaleString()} / {charLimit.toLocaleString()} chars
                  </span>
                </div>
              </div>

              {pasteError && (
                <p
                  className="text-sm rounded-lg px-3 py-2"
                  style={{
                    color: '#f87171',
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.25)',
                  }}
                >
                  {pasteError}
                </p>
              )}

              <div className="flex items-center gap-2">
                <FileCode size={14} style={{ color: 'var(--color-text-secondary)' }} />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  .html only · external CDN links work · no JSX/React imports
                </p>
              </div>

              <button
                onClick={handlePasteSubmit}
                disabled={!pasteCode.trim()}
                className="btn-primary w-full rounded-lg px-4 py-2.5 text-sm"
              >
                Render Prototype
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
