'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AvatarEditor, { type AvatarEditorRef } from 'react-avatar-editor';
import { IconMapper } from '@/app/_components/icons/IconMapper';

interface ImageEditorModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  /** Returns a JPEG blob (always JPEG — normalises HEIC/BMP/TIFF/etc.) */
  onSave: (blob: Blob) => void;
  isSaving?: boolean;
}

/**
 * Converts the editor canvas to a JPEG blob at 500×500 max, quality 0.85.
 * Always outputs JPEG so we can pass a predictable content-type to S3.
 * ponytail: fixed 500px output; upgrade path is to accept maxPx as prop.
 */
async function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      0.88,
    );
  });
}

export function ImageEditorModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  isSaving = false,
}: ImageEditorModalProps) {
  const editorRef = useRef<AvatarEditorRef>(null);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  // SSR guard — document doesn't exist on the server
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset controls when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotate(0);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!editorRef.current || isSaving) return;
    try {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const blob = await canvasToJpegBlob(canvas);
      onSave(blob);
    } catch (err) {
      console.error('[ImageEditorModal] Failed to export image', err);
    }
  };

  const handleRotate = (dir: -1 | 1) => {
    setRotate((r) => (r + dir * 90 + 360) % 360);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="bg-[#FFF8EE] rounded-2xl shadow-2xl border border-[#ddc0bd] w-full max-w-sm mx-auto overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ddc0bd]">
          <h2 className="text-[16px] font-bold text-[#370003] font-['Playfair_Display']">
            Adjust Profile Photo
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg hover:bg-[#f5e0da] text-[#7a1f1f] transition-colors disabled:opacity-50"
            aria-label="Close editor"
          >
            <IconMapper name="close" className="text-xl" />
          </button>
        </div>

        {/* Editor canvas */}
        <div className="flex items-center justify-center bg-[#f7ede8] py-5 select-none">
          <AvatarEditor
            ref={editorRef}
            image={imageSrc}
            width={240}
            height={240}
            borderRadius={120}
            border={24}
            color={[247, 237, 232, 0.7]}
            scale={zoom}
            rotate={rotate}
            style={{ borderRadius: '12px' }}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 space-y-4">
          {/* Zoom */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#564240] mb-1.5 uppercase tracking-wide">
              <span>Zoom</span>
              <span className="font-mono text-[#7a1f1f]">{zoom.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={isSaving}
              className="w-full h-1.5 accent-[#7a1f1f] cursor-pointer"
            />
          </div>

          {/* Rotate */}
          <div>
            <p className="text-[11px] font-semibold text-[#564240] mb-1.5 uppercase tracking-wide">
              Rotate
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleRotate(-1)}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#ddc0bd] bg-white hover:bg-[#fff0eb] text-[#7a1f1f] text-xs font-medium transition-colors disabled:opacity-50"
              >
                <IconMapper name="rotate_left" className="text-base" />
                Rotate 90° Left
              </button>
              <button
                type="button"
                onClick={() => handleRotate(1)}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#ddc0bd] bg-white hover:bg-[#fff0eb] text-[#7a1f1f] text-xs font-medium transition-colors disabled:opacity-50"
              >
                <IconMapper name="rotate_right" className="text-base" />
                Rotate 90° Right
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl border border-[#ddc0bd] bg-white hover:bg-[#ffe5e0] text-[#7a1f1f] text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-[#7a1f1f] hover:bg-[#5b060c] text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <IconMapper name="autorenew" className="text-base animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Photo'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
