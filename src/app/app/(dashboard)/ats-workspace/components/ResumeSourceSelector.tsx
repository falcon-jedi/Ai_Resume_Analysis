'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState } from 'react';
import { useResumes } from '@/app/app/_hooks/use-resumes';

interface ResumeSourceSelectorProps {
  selectedResumeId: string;
  setSelectedResumeId: (id: string) => void;
  resumeText: string;
  setResumeText: (text: string) => void;
  resumeFileBytes: string;
  setResumeFileBytes: (bytes: string) => void;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export function ResumeSourceSelector({
  selectedResumeId,
  setSelectedResumeId,
  resumeText,
  setResumeText,
  resumeFileBytes,
  setResumeFileBytes,
  resumeFileName,
  setResumeFileName,
  onValidationChange,
}: ResumeSourceSelectorProps) {
  const [sourceType, setSourceType] = useState<'library' | 'upload'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);

  const { data: resumeListData, isLoading: isLoadingResumes } = useResumes({ limit: 20 });
  const resumes = resumeListData?.data ?? [];

  // Filter resumes by search query
  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFile = async (file: File) => {
    // 1. Validate file type
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isValidType = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isValidType) {
      alert('Unsupported file format. Please upload PDF, DOCX, or TXT.');
      return;
    }

    // 2. Validate file size (Max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    setParsing(true);
    try {
      // 3. Read file as Base64 string
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const resultStr = reader.result as string;
          const base64 = resultStr.split(',')[1];
          resolve(base64);
        };
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);
      const base64Bytes = await base64Promise;

      setResumeText(''); // Clear text mode text
      setResumeFileBytes(base64Bytes);
      setResumeFileName(file.name);
      setSelectedResumeId('');
      onValidationChange(true);
    } catch (err) {
      console.error(err);
      alert('Failed to read file.');
      onValidationChange(false);
    } finally {
      setParsing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Source Choice Radio Cards */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <label className="flex-1 cursor-pointer">
          <input
            type="radio"
            name="resume_source"
            checked={sourceType === 'library'}
            onChange={() => {
              setSourceType('library');
              setResumeText('');
              setResumeFileBytes('');
              setResumeFileName('');
              onValidationChange(selectedResumeId !== '');
            }}
            className="sr-only peer"
          />
          <div className="flex flex-col items-start gap-1.5 sm:gap-2 p-3.5 sm:p-4 bg-white/60 border border-[#ddc0bd] rounded-xl hover:border-[#7a1f1f] cursor-pointer transition-all peer-checked:border-[#7a1f1f] peer-checked:bg-[#fff0ed]/40 h-full">
            <div className="flex items-center gap-2">
              <IconMapper
                name="folder_open"
                className="text-[#7a1f1f] text-[20px] sm:text-[22px]"
              />
              <span className="font-['Hanken_Grotesk'] text-[13px] sm:text-[14px] font-bold text-[#2b1611]">
                Use JobPatra Resume
              </span>
            </div>
            <p className="font-['Hanken_Grotesk'] text-[11px] sm:text-[12px] text-[#564240]/80 leading-relaxed">
              Select one of your existing, formatted resumes from your account workspace.
            </p>
          </div>
        </label>

        <label className="flex-1 cursor-pointer">
          <input
            type="radio"
            name="resume_source"
            checked={sourceType === 'upload'}
            onChange={() => {
              setSourceType('upload');
              setSelectedResumeId('');
              onValidationChange(resumeText.trim().length > 0 || resumeFileBytes.length > 0);
            }}
            className="sr-only peer"
          />
          <div className="flex flex-col items-start gap-1.5 sm:gap-2 p-3.5 sm:p-4 bg-white/60 border border-[#ddc0bd] rounded-xl hover:border-[#7a1f1f] cursor-pointer transition-all peer-checked:border-[#7a1f1f] peer-checked:bg-[#fff0ed]/40 h-full">
            <div className="flex items-center gap-2">
              <IconMapper
                name="upload_file"
                className="text-[#7a1f1f] text-[20px] sm:text-[22px]"
              />
              <span className="font-['Hanken_Grotesk'] text-[13px] sm:text-[14px] font-bold text-[#2b1611]">
                Upload New Resume
              </span>
            </div>
            <p className="font-['Hanken_Grotesk'] text-[11px] sm:text-[12px] text-[#564240]/80 leading-relaxed">
              Upload a standard document file (PDF, DOCX, TXT) from your system.
            </p>
          </div>
        </label>
      </div>

      {/* Library Selection View */}
      {sourceType === 'library' && (
        <div className="border border-[#ddc0bd] bg-white/60 rounded-xl p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          <div className="relative">
            <IconMapper
              name="search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a716f]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes..."
              className="w-full pl-12 pr-4 py-2.5 bg-[#fff0ed] border border-[#ddc0bd] rounded-full font-['Hanken_Grotesk'] text-[14px] leading-[20px] text-[#2b1611] outline-none focus:border-[#5b060c] focus:ring-1 focus:ring-[#5b060c]/20 placeholder:text-[#8a716f]/60 transition-all shadow-xs"
            />
          </div>

          {isLoadingResumes ? (
            <div className="space-y-2">
              <div className="h-10 bg-black/5 animate-pulse rounded-md" />
              <div className="h-10 bg-black/5 animate-pulse rounded-md" />
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-[#ddc0bd] rounded-lg text-[#564240]/60 font-['Hanken_Grotesk'] text-[13px]">
              No matching resumes found in your workspace repository.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
              {filteredResumes.map((r) => {
                const isSelected = selectedResumeId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedResumeId(r.id);
                      onValidationChange(true);
                    }}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-[#fff0ed] border-[#7a1f1f] text-[#7a1f1f]'
                        : 'bg-white/40 border-[#ddc0bd]/40 text-[#2b1611] hover:bg-white/80 hover:border-[#7a1f1f]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IconMapper name="description" className="text-[20px] text-[#564240]" />
                      <div className="min-w-0">
                        <p className="font-['Hanken_Grotesk'] text-[13px] font-semibold truncate">
                          {r.title}
                        </p>
                        <p className="font-['Hanken_Grotesk'] text-[10px] text-[#564240]/60 uppercase tracking-wider">
                          Template: {r.templateId} • {new Date(r.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <IconMapper
                        name="check_circle"
                        className="text-[#7a1f1f] text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* File Upload View */}
      {sourceType === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
            dragActive
              ? 'border-[#7a1f1f] bg-[#fff0ed]/40'
              : resumeFileName
                ? 'border-[#7a1f1f] bg-white/40'
                : 'border-[#ddc0bd] bg-white/20 hover:bg-white/40 hover:border-[#7a1f1f]'
          }`}
        >
          <input
            type="file"
            id="resume-file-input"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="resume-file-input"
            className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
          >
            {parsing ? (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-[#7a1f1f]/20 border-t-[#7a1f1f] animate-spin mb-3" />
                <p className="font-['Hanken_Grotesk'] text-[13px] font-bold text-[#2b1611]">
                  Reading document content...
                </p>
                <p className="font-['Hanken_Grotesk'] text-[11px] text-[#564240]/60 mt-1">
                  Preparing file for analysis...
                </p>
              </>
            ) : resumeFileName ? (
              <>
                <IconMapper
                  name="task"
                  className="text-[#7a1f1f] text-[36px] mb-2"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                />
                <p className="font-['Hanken_Grotesk'] text-[13px] font-bold text-[#7a1f1f]">
                  {resumeFileName}
                </p>
                <p className="font-['Hanken_Grotesk'] text-[11px] text-[#564240]/60 mt-1">
                  Successfully imported. Click browse or drop a new file to replace.
                </p>
              </>
            ) : (
              <>
                <IconMapper name="upload_file" className="text-[#7a1f1f] text-[36px] mb-3" />
                <p className="font-['Hanken_Grotesk'] text-[13px] font-bold text-[#2b1611]">
                  Drop your resume document here
                </p>
                <p className="font-['Hanken_Grotesk'] text-[11px] text-[#564240]/60 mt-1">
                  Supports PDF, DOCX, or TXT formats (Max 5MB)
                </p>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
