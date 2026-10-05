'use client';

import { useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import type { UpdateResumeDTO } from '@/app/api/model/request/resume/resume';
import { MAX_PHOTO_SIZE_BYTES } from '@/app/api/model/enums/upload';
import { getResumePhotoUploadUrl, uploadBlobToS3 } from '@/app/api/client/upload/upload-client';
import { FormInput } from './form-field';
import { IconMapper } from '@/app/_components/icons/IconMapper';
import { ImageEditorModal } from './ImageEditorModal';

interface PersonalInfoFormProps {
  form: UseFormReturn<UpdateResumeDTO>;
  supportsPhoto?: boolean;
  resumeId?: string;
}

export function PersonalInfoForm({ form, supportsPhoto = false, resumeId }: PersonalInfoFormProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const photoUrl = watch('personalInfo.photoUrl');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editorImageSrc, setEditorImageSrc] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so re-selecting same file triggers change
    if (!file) return;

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error('File size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setEditorImageSrc(objectUrl);
    setIsEditorOpen(true);
  };

  const handleEditCurrentPhoto = async () => {
    if (!photoUrl) return;
    try {
      // Fetch through our own origin to avoid cross-origin canvas taint.
      // A blob: URL is same-origin, so toBlob() won't throw SecurityError.
      const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(photoUrl)}`);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      setEditorImageSrc(URL.createObjectURL(blob));
    } catch {
      // Fallback: pass the URL directly (will taint if no CORS, but better than nothing)
      setEditorImageSrc(photoUrl);
    }
    setIsEditorOpen(true);
  };

  const handleEditorSave = async (blob: Blob) => {
    if (!resumeId) {
      toast.error('Resume ID is missing. Please save the resume first.');
      return;
    }

    setUploading(true);
    try {
      // 1. Get pre-signed PUT URL using the upload API client
      const { uploadUrl, publicUrl } = await getResumePhotoUploadUrl(resumeId, 'image/jpeg');

      // 2. PUT cropped JPEG blob directly to S3
      await uploadBlobToS3(uploadUrl, blob, 'image/jpeg');

      // 3. Store the public S3 URL in the form
      setValue('personalInfo.photoUrl', publicUrl, { shouldDirty: true, shouldValidate: true });
      toast.success('Profile photo updated successfully!');

      // Close modal & clean up object URL
      setIsEditorOpen(false);
      if (editorImageSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(editorImageSrc);
      }
      setEditorImageSrc(null);
    } catch (err) {
      console.error('[photo upload]', err);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditorClose = () => {
    if (uploading) return;
    setIsEditorOpen(false);
    if (editorImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(editorImageSrc);
    }
    setEditorImageSrc(null);
  };

  const handleRemovePhoto = () => {
    setValue('personalInfo.photoUrl', '', { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[20px] font-bold text-[#7a1f1f] font-['Playfair_Display']">
          Personal Details
        </h3>
      </div>

      {/* Profile Photo Upload — Only displayed when template supports photo */}
      {supportsPhoto && (
        <div className="bg-[#fff8f6] border border-[#ddc0bd] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border-2 border-[#ddc0bd] flex items-center justify-center shrink-0 shadow-inner group">
            {uploading ? (
              <div className="w-full h-full flex items-center justify-center bg-white">
                <IconMapper name="autorenew" className="text-3xl text-[#7a1f1f] animate-spin" />
              </div>
            ) : photoUrl ? (
              <img src={photoUrl} alt="Profile photo" className="w-full h-full object-cover" />
            ) : (
              <IconMapper name="account_circle" className="text-4xl text-[#ddc0bd]" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.heic,.heif"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !resumeId}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7a1f1f] hover:bg-[#5b060c] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconMapper name="add" className="text-sm" />
                {uploading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
              </button>

              {photoUrl && (
                <>
                  <button
                    type="button"
                    onClick={handleEditCurrentPhoto}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-[#fff0eb] text-[#7a1f1f] border border-[#ddc0bd] text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <IconMapper name="edit" className="text-sm" />
                    Adjust
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-[#ffe5e0] text-[#7a1f1f] border border-[#ddc0bd] text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <IconMapper name="delete" className="text-sm" />
                    Remove
                  </button>
                </>
              )}
            </div>
            <p className="text-[12px] text-[#564240]">
              Supports JPG, PNG, WebP, GIF, BMP, TIFF, HEIC up to 10MB. Includes built-in crop &amp;
              rotate editor.
            </p>
          </div>

          <ImageEditorModal
            isOpen={isEditorOpen}
            imageSrc={editorImageSrc || ''}
            onClose={handleEditorClose}
            onSave={handleEditorSave}
            isSaving={uploading}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-6">
        <FormInput
          id="personalInfo-fullName"
          label="Full Name"
          registration={register('personalInfo.fullName')}
          error={errors.personalInfo?.fullName}
          placeholder="Alex Morgan"
        />
        <FormInput
          id="personalInfo-jobTitle"
          label="Professional Title"
          registration={register('personalInfo.jobTitle')}
          placeholder="Senior Product Designer"
        />
        <FormInput
          id="personalInfo-email"
          type="email"
          label="Email Address"
          registration={register('personalInfo.email')}
          error={errors.personalInfo?.email}
          placeholder="alex.morgan@design.co"
        />
        <FormInput
          id="personalInfo-phone"
          label="Phone Number"
          registration={register('personalInfo.phone')}
          placeholder="+1 (555) 019-2834"
        />
        <FormInput
          id="personalInfo-location"
          label="Location"
          registration={register('personalInfo.location')}
          placeholder="San Francisco, CA"
        />
        <FormInput
          id="personalInfo-website"
          label="Portfolio / Website URL"
          registration={register('personalInfo.website')}
          error={errors.personalInfo?.website}
          placeholder="https://alexmorgan.co"
        />
        <FormInput
          id="personalInfo-linkedin"
          label="LinkedIn Profile"
          registration={register('personalInfo.linkedin')}
          placeholder="https://linkedin.com/in/alexmorgan"
        />
        <FormInput
          id="personalInfo-github"
          label="GitHub Profile"
          registration={register('personalInfo.github')}
          placeholder="https://github.com/alexmorgan"
        />
      </div>
    </div>
  );
}
