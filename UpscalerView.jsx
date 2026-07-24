import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Coins,
  Download,
  Image as ImageIcon,
  ImagePlus,
  LoaderCircle,
  Plus,
  ScanLine,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import './UpscalerView.css';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatFileSize(size) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UpscalerView({ onBack }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [scale, setScale] = useState(2);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const reset = () => {
    setFile(null);
    setPreviewUrl('');
    setResultUrl('');
    setError('');
    setProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectFile = (nextFile) => {
    if (!nextFile) return;
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError('Choose a PNG, JPG, or WEBP image.');
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setError('The image must be 5MB or smaller.');
      return;
    }

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setResultUrl('');
    setError('');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const upscaleImage = async () => {
    if (!file || !previewUrl) return;
    setProcessing(true);
    setError('');

    try {
      const image = new Image();
      image.src = previewUrl;
      await image.decode();

      const targetWidth = image.naturalWidth * scale;
      const targetHeight = image.naturalHeight * scale;
      const totalPixels = targetWidth * targetHeight;

      if (totalPixels > 36_000_000) {
        throw new Error('The resulting image is too large for browser processing. Try 2×.');
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', .96));
      if (!blob) throw new Error('Could not prepare the upscaled image.');

      setResultUrl(URL.createObjectURL(blob));
    } catch (upscaleError) {
      setError(upscaleError.message || 'Could not upscale this image.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="upscaler-view">
      <header className="upscaler-topbar">
        <button type="button" className="upscaler-brand" onClick={onBack} aria-label="Back to home">
          <ArrowLeft size={17} />
          <strong>LUMINA.AI</strong>
        </button>

        <div className="upscaler-title-cluster">
          <strong>Upscaler</strong>
          <span><Coins size={12} /> 150</span>
          <button type="button"><Shield size={12} /> Upgrade</button>
        </div>
      </header>

      <aside className="upscaler-history" aria-label="Upscale history">
        <button type="button" className="upscaler-new" onClick={reset}>
          <Plus size={17} />
          <span>New</span>
        </button>

        {Array.from({ length: 8 }, (_, index) => (
          <button
            type="button"
            key={index}
            className={`upscaler-history-item ${file && index === 0 ? 'has-image' : ''}`}
            aria-label={file && index === 0 ? `Open ${file.name}` : `Empty history slot ${index + 1}`}
            onClick={() => file && index === 0 && setResultUrl('')}
          >
            {file && index === 0 && <img src={previewUrl} alt="" />}
          </button>
        ))}
      </aside>

      <main
        className={`upscaler-canvas ${dragging ? 'is-dragging' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={handleDrop}
      >
        {!file ? (
          <button
            type="button"
            className="upscaler-empty"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Add an image to upscale"
          >
            <span className="upscaler-drop-tile">
              <span className="upscaler-drop-icon">
                <ImageIcon size={35} />
                <ImagePlus size={36} />
                <ScanLine size={54} />
                <Sparkles size={24} />
              </span>
            </span>
            <strong>{dragging ? 'Drop your image here' : 'Add or drop an image to upscale'}</strong>
            <small>PNG, JPG, or WEBP up to 5MB</small>
          </button>
        ) : (
          <section className="upscaler-workspace">
            <div className="upscaler-preview-shell">
              <img src={resultUrl || previewUrl} alt={`Preview of ${file.name}`} />
              {resultUrl && <span className="upscaler-ready"><Check size={13} /> Upscaled {scale}×</span>}
              <button type="button" className="upscaler-remove" onClick={reset} aria-label="Remove image">
                <X size={16} />
              </button>
            </div>

            <div className="upscaler-file-meta">
              <div>
                <strong>{file.name}</strong>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()}>Replace</button>
            </div>

            <div className="upscaler-actions">
              <div className="upscaler-scale" aria-label="Upscale size">
                {[2, 4].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={scale === value ? 'is-active' : ''}
                    onClick={() => {
                      setScale(value);
                      setResultUrl('');
                    }}
                  >
                    {value}×
                  </button>
                ))}
              </div>

              {!resultUrl ? (
                <button
                  type="button"
                  className="upscaler-run"
                  onClick={upscaleImage}
                  disabled={processing}
                >
                  {processing ? <LoaderCircle className="upscaler-spin" size={16} /> : <Sparkles size={15} />}
                  {processing ? 'Upscaling...' : 'Upscale image'}
                </button>
              ) : (
                <a className="upscaler-download" href={resultUrl} download={`upscaled-${file.name.replace(/\.[^.]+$/, '')}.png`}>
                  <Download size={15} />
                  Download
                </a>
              )}
            </div>
          </section>
        )}

        {error && <div className="upscaler-error" role="alert">{error}</div>}

        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          onChange={(event) => selectFile(event.target.files?.[0])}
          hidden
        />
      </main>
    </div>
  );
}
