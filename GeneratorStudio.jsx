import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Box,
  Check,
  CheckSquare,
  ChevronDown,
  Coins,
  Download,
  Eraser,
  FileText,
  GitBranch,
  Globe2,
  HelpCircle,
  Image as ImageIcon,
  LoaderCircle,
  Maximize,
  Paintbrush,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  Square,
  Trash2,
  Upload,
  Volume2,
  Wand2,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import inspirationArtwork from './assets/studio-inspiration.png';
import './GeneratorStudio.css';
import { showUiToast } from './uiActions.js';

const MODELS = [
  {
    id: 'gemini-3.1-flash-image',
    name: 'Nano Banana 2',
    description: 'Найкращий баланс швидкості, якості та вартості.',
    sizes: ['1K', '2K', '4K'],
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Nano Banana 2 Lite',
    description: 'Найшвидша й найдешевша модель для масової генерації.',
    sizes: ['1K'],
  },
  {
    id: 'gemini-3-pro-image',
    name: 'Nano Banana Pro',
    description: 'Професійна модель для складних композицій і точного тексту.',
    sizes: ['1K', '2K', '4K'],
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Nano Banana Legacy',
    description: 'Стабільна модель попереднього покоління з виходом 1K.',
    sizes: ['1K'],
  },
];

const STYLES = [
  { id: 'none', name: 'Без стилю', suffix: '' },
  { id: 'photo', name: 'Фотореалізм', suffix: ', cinematic photorealism, natural light, realistic materials, professional photography' },
  { id: 'white', name: 'На білому фоні', suffix: ', isolated on a pure white background, clean studio lighting, product photography, no distracting elements' },
  { id: 'illustration', name: 'Ілюстрація', suffix: ', premium editorial illustration, expressive composition, refined color palette, crisp details' },
  { id: 'three-d', name: '3D Render', suffix: ', polished 3D render, detailed materials, soft global illumination, premium product visualization' },
  { id: 'infographic', name: 'Інфографіка', suffix: ', clear modern infographic, crisp vector lines, readable layout, strong visual hierarchy' },
];

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'];

const INSPIRATIONS = [
  {
    title: 'Cinematic beauty portrait with bold graphic eyeliner and warm directional light',
    prompt: 'A cinematic close-up beauty portrait with short platinum hair, bold graphic eyeliner, warm hard sunlight and a minimalist taupe background',
    position: '0% 50%',
  },
  {
    title: 'Bengal tiger emerging through oversized tropical leaves and deep green shadows',
    prompt: 'A cinematic Bengal tiger emerging through oversized tropical leaves, dramatic shadows, premium wildlife photography',
    position: '50% 50%',
  },
  {
    title: 'Premium wellness product still life in a sophisticated monochrome green palette',
    prompt: 'Premium olive-green wellness product packaging surrounded by leafy greens and botanical powder, minimalist advertising photography',
    position: '100% 50%',
  },
];

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

async function fetchWithRetry(url, options, maxRetries = 3) {
  let delay = 1200;

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = result?.error?.message || `HTTP ${response.status}`;
        const canRetry = response.status === 429 || response.status >= 500;
        if (canRetry && attempt < maxRetries - 1) {
          await wait(delay);
          delay *= 2;
          continue;
        }
        throw new Error(message);
      }

      return result;
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      if (isNetworkError && attempt < maxRetries - 1) {
        await wait(delay);
        delay *= 2;
        continue;
      }
      throw error;
    }
  }

  throw new Error('Не вдалося отримати відповідь від API.');
}

function buildPayload(item, model, aspectRatio, imageSize) {
  const image = { aspectRatio };
  if (model.sizes.length > 1) image.imageSize = imageSize;

  return {
    contents: [{ role: 'user', parts: [{ text: item.fullPrompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: image,
    },
  };
}

function extractGeneratedImage(result) {
  const candidates = result?.candidates || [];
  for (const candidate of candidates) {
    const imagePart = candidate?.content?.parts?.find((part) => part.inlineData?.data);
    if (imagePart) {
      return {
        data: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType || 'image/png',
      };
    }
  }

  const blockReason = result?.promptFeedback?.blockReason;
  const finishReason = candidates[0]?.finishReason;
  if (blockReason || finishReason === 'SAFETY') {
    throw new Error('Запит заблоковано фільтром безпеки. Спробуйте змінити формулювання.');
  }
  throw new Error('Модель не повернула зображення. Спробуйте ще раз або оберіть іншу модель.');
}

export default function GeneratorStudio({ initialPrompt = '', initialTab = 'image', onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [apiReady, setApiReady] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(!import.meta.env.VITE_GEMINI_API_KEY);
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [selectedStyleId, setSelectedStyleId] = useState('none');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [numGenerations, setNumGenerations] = useState(1);
  const [isIsolatedBackground, setIsIsolatedBackground] = useState(false);
  const [isInfographicClear, setIsInfographicClear] = useState(false);
  const [disabledSlideIndices, setDisabledSlideIndices] = useState(new Set());
  const [imagesHistory, setImagesHistory] = useState([]);
  const [globalError, setGlobalError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editorMode, setEditorMode] = useState('none');
  const [brushSize, setBrushSize] = useState(24);
  const [editedImageUrl, setEditedImageUrl] = useState(null);
  const [historyStates, setHistoryStates] = useState([]);
  
  // Video tab specific states
  const [videoModel, setVideoModel] = useState('Hailuo 2.3');
  const [videoDuration, setVideoDuration] = useState('6s');
  const [videoDimensions, setVideoDimensions] = useState('16:9');
  const [videoQuality, setVideoQuality] = useState('Quality 1376x768');
  const [videoPrivate, setVideoPrivate] = useState(false);
  const [videoCollection, setVideoCollection] = useState('No collection');
  const [videoFeedback, setVideoFeedback] = useState('');

  // 3D tab specific states
  const [threeDModel, setThreeDModel] = useState('Rodin V2');
  const [meshType, setMeshType] = useState('Triangle');
  const [meshQuality, setMeshQuality] = useState('500k');
  const [material, setMaterial] = useState('All');
  const [threeDPrivate, setThreeDPrivate] = useState(false);
  const [threeDCollection, setThreeDCollection] = useState('No collection');
  const [threeDAdvanced, setThreeDAdvanced] = useState(false);
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [threeDJobs, setThreeDJobs] = useState(0);

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  const fileInputRef = useRef(null);
  const referenceInputRef = useRef(null);

  const selectedModel = MODELS.find((model) => model.id === selectedModelId) || MODELS[0];
  const selectedStyle = STYLES.find((style) => style.id === selectedStyleId) || STYLES[0];

  const parsedSlides = useMemo(
    () => prompt.split(/\n\s*\n|\r?\n/).map((item) => item.trim()).filter((item) => item.length > 2),
    [prompt],
  );

  const selectedSlideCount = parsedSlides.filter((_, index) => !disabledSlideIndices.has(index)).length;
  const isGenerating = imagesHistory.some((item) => item.status === 'loading');

  const enhancePrompt = () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setPrompt('A cinematic product scene with dramatic lighting, refined materials, balanced composition, and rich detail');
      showUiToast('Added an example prompt.', 'success');
      return;
    }
    if (/balanced composition/i.test(cleanPrompt)) {
      showUiToast('Prompt is already enhanced.');
      return;
    }
    setPrompt(`${cleanPrompt}, balanced composition, cinematic lighting, refined materials, rich detail, high visual clarity`);
    showUiToast('Prompt enhanced.', 'success');
  };

  const selectReferenceFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/')).slice(0, 6);
    setReferenceFiles(files);
    if (files.length) showUiToast(`${files.length} reference image${files.length > 1 ? 's' : ''} attached.`, 'success');
  };

  useEffect(() => {
    fetch('/api/gemini/status')
      .then((response) => response.json())
      .then((result) => setApiReady(Boolean(result.configured)))
      .catch(() => setApiReady(false));
  }, []);

  useEffect(() => {
    if (!selectedModel.sizes.includes(imageSize)) setImageSize(selectedModel.sizes[0]);
  }, [selectedModel, imageSize]);

  useEffect(() => {
    if (!selectedImage) return;
    setEditorMode('none');
    setEditedImageUrl(null);
    setHistoryStates([]);
  }, [selectedImage]);

  const updateGeneration = (id, patch) => {
    setImagesHistory((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const runGeneration = async (item) => {
    try {
      const result = await fetchWithRetry('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: item.modelId,
          payload: buildPayload(item, item.model, item.aspectRatio, item.imageSize),
        }),
      });
      const image = extractGeneratedImage(result);
      updateGeneration(item.id, {
        status: 'success',
        url: `data:${image.mimeType};base64,${image.data}`,
      });
    } catch (error) {
      updateGeneration(item.id, {
        status: 'error',
        error: error?.message || 'Невідома помилка генерації.',
      });
    }
  };

  const handleGenerate = () => {
    setGlobalError('');
    if (apiReady === false) {
      setGlobalError('Gemini API key не знайдено. Додайте GEMINI_API_KEY до файлу .env.local і перезапустіть Vite.');
      return;
    }
    if (!parsedSlides.length || !selectedSlideCount) {
      setGlobalError('Введіть хоча б один промпт і виберіть його для генерації.');
      return;
    }

    const qualityModifier = ', high quality, highly detailed, sharp focus, professional composition';
    const backgroundModifier = isIsolatedBackground
      ? ', strictly isolated subject on a pure white background, no shadows, clean cutout composition'
      : '';
    const infographicModifier = isInfographicClear
      ? ', crisp infographic design, clear visual hierarchy, readable typography, clean separated elements'
      : '';
    const timestamp = Date.now();

    const generations = parsedSlides
      .map((text, slideIndex) => ({ text, slideIndex }))
      .filter(({ slideIndex }) => !disabledSlideIndices.has(slideIndex))
      .flatMap(({ text, slideIndex }) =>
        Array.from({ length: numGenerations }, (_, variantIndex) => ({
          id: `${timestamp}-${slideIndex}-${variantIndex}-${Math.random().toString(36).slice(2)}`,
          status: 'loading',
          prompt: text,
          fullPrompt: `${text}${selectedStyle.suffix}${qualityModifier}${backgroundModifier}${infographicModifier}`,
          modelId: selectedModel.id,
          model: selectedModel,
          modelName: selectedModel.name,
          aspectRatio,
          imageSize,
          slideNumber: slideIndex + 1,
          date: new Date().toLocaleString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        })),
      );

    setImagesHistory((items) => [...generations, ...items]);
    generations.forEach(runGeneration);
  };

  const retryGeneration = (item) => {
    updateGeneration(item.id, { status: 'loading', error: '' });
    runGeneration({ ...item, status: 'loading' });
  };

  const loadMammoth = () => new Promise((resolve, reject) => {
    if (window.mammoth) {
      resolve(window.mammoth);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
    script.onload = () => resolve(window.mammoth);
    script.onerror = () => reject(new Error('Не вдалося завантажити модуль читання DOCX.'));
    document.body.appendChild(script);
  });

  const processFile = async (file) => {
    if (!file) return;
    setIsParsingFile(true);
    setGlobalError('');

    try {
      if (file.name.toLowerCase().endsWith('.docx')) {
        const mammoth = await loadMammoth();
        const buffer = await file.arrayBuffer();
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buffer });
        const documentNode = new DOMParser().parseFromString(htmlResult.value, 'text/html');
        const rows = Array.from(documentNode.querySelectorAll('table tr'));
        const extracted = [];

        if (rows.length > 1) {
          const headers = Array.from(rows[0].querySelectorAll('td, th')).map((cell) => cell.textContent.toLowerCase());
          let targetIndex = headers.findIndex((header) => ['диктор', 'до слайду', 'чуємо', 'текст'].some((key) => header.includes(key)));
          if (targetIndex < 0) targetIndex = headers.length > 1 ? 1 : 0;
          rows.slice(1).forEach((row) => {
            const cells = row.querySelectorAll('td, th');
            const value = cells[targetIndex]?.textContent?.trim();
            if (value?.length > 2) extracted.push(value);
          });
        }

        if (!extracted.length) {
          const rawResult = await mammoth.extractRawText({ arrayBuffer: buffer });
          extracted.push(rawResult.value);
        }
        setPrompt(extracted.join('\n\n').trim());
      } else {
        setPrompt(await file.text());
      }
      setDisabledSlideIndices(new Set());
    } catch (error) {
      setGlobalError(error?.message || 'Не вдалося прочитати файл. Використовуйте .txt або .docx.');
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const toggleSlide = (index) => {
    setDisabledSlideIndices((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const initCanvas = (url) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const image = new Image();
    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      contextRef.current = context;
      setHistoryStates([canvas.toDataURL('image/png')]);
    };
    image.src = url;
  };

  const activateEditor = (mode) => {
    setEditorMode(mode);
    if (!historyStates.length) window.setTimeout(() => initCanvas(editedImageUrl || selectedImage.url), 0);
  };

  const canvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor((event.clientX - rect.left) * (canvas.width / rect.width)),
      y: Math.floor((event.clientY - rect.top) * (canvas.height / rect.height)),
    };
  };

  const saveCanvasHistory = () => {
    if (canvasRef.current) setHistoryStates((items) => [...items, canvasRef.current.toDataURL('image/png')]);
  };

  const drawOnCanvas = (event) => {
    if (!contextRef.current || !['eraser', 'brush'].includes(editorMode)) return;
    const { x, y } = canvasPoint(event);
    const context = contextRef.current;
    context.beginPath();
    context.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    context.globalCompositeOperation = editorMode === 'eraser' ? 'destination-out' : 'source-over';
    context.fillStyle = '#ffffff';
    context.fill();
    context.globalCompositeOperation = 'source-over';
  };

  const applyMagicWand = (event) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    const start = canvasPoint(event);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const startIndex = (start.y * canvas.width + start.x) * 4;
    const target = [data[startIndex], data[startIndex + 1], data[startIndex + 2]];
    const tolerance = 40;
    const stack = [[start.x, start.y]];
    const visited = new Uint8Array(canvas.width * canvas.height);

    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      const pixel = y * canvas.width + x;
      if (visited[pixel]) continue;
      visited[pixel] = 1;
      const index = pixel * 4;
      if (!data[index + 3]) continue;
      const matches = target.every((channel, channelIndex) => Math.abs(data[index + channelIndex] - channel) <= tolerance);
      if (!matches) continue;
      data[index + 3] = 0;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    context.putImageData(imageData, 0, 0);
    saveCanvasHistory();
  };

  const handleCanvasDown = (event) => {
    if (editorMode === 'wand') {
      applyMagicWand(event);
      return;
    }
    if (!['eraser', 'brush'].includes(editorMode)) return;
    isDrawingRef.current = true;
    drawOnCanvas(event);
  };

  const handleCanvasUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    saveCanvasHistory();
  };

  const undoCanvas = () => {
    if (historyStates.length <= 1) return;
    const nextHistory = historyStates.slice(0, -1);
    const image = new Image();
    image.onload = () => {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      contextRef.current.drawImage(image, 0, 0);
    };
    image.src = nextHistory[nextHistory.length - 1];
    setHistoryStates(nextHistory);
  };

  const saveEdit = () => {
    const url = canvasRef.current?.toDataURL('image/png');
    if (!url) return;
    setEditedImageUrl(url);
    updateGeneration(selectedImage.id, { url });
    setSelectedImage((item) => ({ ...item, url }));
    setEditorMode('none');
  };

  return (
    <div className="studio-app">
      <header className="creation-topbar">
        <div className="creation-brand">
          <button onClick={onBack} aria-label="Назад на головну"><ArrowLeft size={18} /></button>
          <span>LUMINA.AI</span>
        </div>
        <div className="creation-title">AI Creation <HelpCircle size={14} /></div>
        <div className="creation-account">
          <span className="credit-pill"><Coins size={14} /> 150</span>
          <button className="upgrade-pill" onClick={() => onNavigate?.('plans')}><Zap size={13} /> Upgrade</button>
          <span className={`api-status ${apiReady ? 'api-status--ready' : ''}`}><i />{apiReady === null ? 'API check' : apiReady ? 'API secured' : 'API unavailable'}</span>
          <button className="top-settings" aria-label="Open generation settings" onClick={() => setSettingsOpen(true)}><Settings2 size={16} /></button>
        </div>
      </header>

      <div className="creation-layout">
        <aside className={`studio-settings ${settingsOpen ? 'studio-settings--open' : ''}`}>
          <div className="mobile-panel-title"><strong>Generation settings</strong><button onClick={() => setSettingsOpen(false)}><X size={18} /></button></div>

          {activeTab === 'image' ? (
            <>
              <label className="select-card">
                <span className="select-icon model-icon" />
                <span><small>Model</small><strong>{selectedModel.name}</strong></span>
                <select value={selectedModelId} onChange={(event) => setSelectedModelId(event.target.value)}>{MODELS.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select>
                <ChevronDown size={14} />
              </label>

              <label className="select-card">
                <span className="select-icon style-icon"><Wand2 size={15} /></span>
                <span><small>Style</small><strong>{selectedStyle.name}</strong></span>
                <select value={selectedStyleId} onChange={(event) => setSelectedStyleId(event.target.value)}>{STYLES.map((style) => <option key={style.id} value={style.id}>{style.name}</option>)}</select>
                <ChevronDown size={14} />
              </label>

              <div className="sidebar-section">
                <div className="sidebar-label">Image Dimensions <HelpCircle size={12} /></div>
                <div className="dimension-grid">{ASPECT_RATIOS.map((ratio) => {
                  const [width, height] = ratio.split(':').map(Number);
                  return <button key={ratio} className={aspectRatio === ratio ? 'is-active' : ''} onClick={() => setAspectRatio(ratio)}><i style={{ aspectRatio: `${width}/${height}` }} /><span>{ratio}</span></button>;
                })}</div>
                <div className="resolution-row">{selectedModel.sizes.map((size) => <button key={size} className={imageSize === size ? 'is-active' : ''} onClick={() => setImageSize(size)}>{size === '1K' ? '1024×1024' : size}</button>)}</div>
              </div>

              <div className="sidebar-section">
                <div className="sidebar-label">Number of Generations <HelpCircle size={12} /></div>
                <div className="generation-count">{[1, 2, 3, 4].map((count) => <button key={count} className={numGenerations === count ? 'is-active' : ''} onClick={() => setNumGenerations(count)}>{count}</button>)}</div>
              </div>

              <div className="sidebar-section compact-options">
                <button className={`sidebar-switch ${isIsolatedBackground ? 'is-active' : ''}`} onClick={() => setIsIsolatedBackground((value) => !value)}><span>Clean Background <HelpCircle size={12} /></span><i /></button>
                <button className={`sidebar-switch ${isInfographicClear ? 'is-active' : ''}`} onClick={() => setIsInfographicClear((value) => !value)}><span>Clear Infographic <HelpCircle size={12} /></span><i /></button>
              </div>

              <button className="import-file" onClick={() => fileInputRef.current?.click()} disabled={isParsingFile}>{isParsingFile ? <LoaderCircle className="spin" size={15} /> : <Upload size={15} />} Import .txt / .docx</button>
              <input ref={fileInputRef} hidden type="file" accept=".txt,.docx,text/plain" onChange={(event) => processFile(event.target.files?.[0])} />

              <button className="reset-settings" onClick={() => { setSelectedModelId(MODELS[0].id); setSelectedStyleId('none'); setAspectRatio('16:9'); setImageSize('1K'); setNumGenerations(1); setIsIsolatedBackground(false); setIsInfographicClear(false); }}><RotateCcw size={14} /> Reset to Defaults</button>
            </>
          ) : activeTab === 'video' ? (
            <div className="video-settings">
              <label className="select-card video-select-card">
                <span className="select-icon video-model-icon"><Play size={12} fill="currentColor" /></span>
                <span><small>Model</small><strong>{videoModel}</strong></span>
                <select value={videoModel} onChange={(e) => setVideoModel(e.target.value)}><option value="Hailuo 2.3">Hailuo 2.3</option></select>
                <ChevronDown size={14} />
              </label>

              <div className="sidebar-section video-styles-section">
                <div className="sidebar-label">Styles <button className="clear-all" onClick={() => showUiToast('Video style randomizers cleared.', 'success')}>Clear all</button></div>
                <div className="video-style-cards">
                  <div className="video-style-card">
                    <div className="vs-icon"><FileText size={16} /></div>
                    <div><small>Vibe</small><strong>Randomize</strong></div>
                  </div>
                  <div className="video-style-card">
                    <div className="vs-icon"><Zap size={16} /></div>
                    <div><small>Lighting</small><strong>Randomize</strong></div>
                  </div>
                  <div className="video-style-card">
                    <div className="vs-icon"><div className="circles-icon"></div></div>
                    <div><small>Color</small><strong>Randomize</strong></div>
                  </div>
                </div>
              </div>

              <div className="sidebar-section">
                <div className="sidebar-label">Duration <HelpCircle size={12} /></div>
                <div className="video-row-buttons duration-buttons">
                  {['6s', '10s'].map(val => (
                    <button key={val} className={videoDuration === val ? 'is-active' : ''} onClick={() => setVideoDuration(val)}>{val}</button>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <div className="sidebar-label">Video Dimensions <HelpCircle size={12} /><button className="auto-btn" onClick={() => {
                  const automatic = window.innerWidth < 700 ? '9:16' : '16:9';
                  setVideoDimensions(automatic);
                  showUiToast(`Auto dimensions set to ${automatic}.`, 'success');
                }}><Maximize size={10} /> Auto</button></div>
                <div className="dimension-grid video-dims">
                  {['1:1', '16:9', '9:16'].map(val => {
                    const [w, h] = val.split(':');
                    return (
                      <button key={val} className={videoDimensions === val ? 'is-active' : ''} onClick={() => setVideoDimensions(val)}>
                        <i style={{ aspectRatio: `${w}/${h}` }}></i>
                        <span>{val}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="sidebar-section">
                <div className="video-row-buttons quality-buttons">
                  {['Quality 1376x768', 'High Quality 1920x1080'].map(val => {
                    const lines = val.split(' ');
                    return (
                      <button key={val} className={videoQuality === val ? 'is-active' : ''} onClick={() => setVideoQuality(val)}>
                        <span>{lines[0]}{lines.length > 2 ? ' ' + lines[1] : ''}</span>
                        <small>{lines[lines.length - 1]}</small>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="sidebar-section compact-options">
                <button className={`sidebar-switch video-switch ${videoPrivate ? 'is-active' : ''}`} onClick={() => setVideoPrivate(v => !v)}>
                  <span>Private Mode <HelpCircle size={12} /></span><i></i>
                </button>
              </div>
              
              <div className="sidebar-section">
                <button className="sidebar-switch collection-dropdown" onClick={() => setVideoCollection((value) => value === 'No collection' ? 'Campaign videos' : 'No collection')}>
                  <span>{videoCollection === 'No collection' ? 'Add to Collection' : videoCollection} <HelpCircle size={12} /></span>
                  <ChevronDown size={14} />
                </button>
              </div>

              <button className="reset-settings" onClick={() => { setVideoModel('Hailuo 2.3'); setVideoDuration('6s'); setVideoDimensions('16:9'); setVideoQuality('Quality 1376x768'); setVideoPrivate(false); }}><RotateCcw size={14} /> Reset to Defaults</button>
            </div>
          ) : activeTab === '3d' ? (
            <div className="three-d-settings">
              <label className="select-card video-select-card">
                <span className="select-icon three-d-model-icon"><Box size={14} /></span>
                <span><small>Model</small><strong>{threeDModel}</strong></span>
                <select value={threeDModel} onChange={(e) => setThreeDModel(e.target.value)}><option value="Rodin V2">Rodin V2</option></select>
                <ChevronDown size={14} />
              </label>

              <div className="sidebar-section">
                <div className="sidebar-label">Mesh Type <HelpCircle size={12} /></div>
                <div className="video-row-buttons">
                  {['Triangle', 'Quad'].map(val => (
                    <button key={val} className={meshType === val ? 'is-active' : ''} onClick={() => setMeshType(val)}>{val}</button>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <div className="sidebar-label">Mesh Quality <HelpCircle size={12} /></div>
                <div className="dimension-grid">
                  {['2k', '20k', '150k', '500k'].map(val => (
                    <button key={val} className={meshQuality === val ? 'is-active' : ''} onClick={() => setMeshQuality(val)} style={{ height: '32px', display: 'grid', placeItems: 'center' }}>
                      <span style={{ fontSize: '10px' }}>{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <div className="sidebar-label">Material <HelpCircle size={12} /></div>
                <div className="video-row-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {['PBR', 'Shaded', 'All'].map(val => (
                    <button key={val} className={material === val ? 'is-active' : ''} onClick={() => setMaterial(val)}>{val}</button>
                  ))}
                </div>
              </div>

              <div className="sidebar-section compact-options" style={{ marginTop: '24px' }}>
                <button className={`sidebar-switch video-switch ${threeDPrivate ? 'is-active' : ''}`} onClick={() => setThreeDPrivate(v => !v)}>
                  <span>Private Mode <HelpCircle size={12} /></span><i></i>
                </button>
              </div>

              <div className="sidebar-section">
                <button className={`sidebar-switch collection-dropdown ${threeDAdvanced ? 'is-active' : ''}`} onClick={() => setThreeDAdvanced((value) => !value)}>
                  <span>Advanced Settings <HelpCircle size={12} /></span>
                  <ChevronDown size={14} />
                </button>
                {threeDAdvanced && <div className="studio-inline-panel">Texture baking and topology cleanup will use the selected mesh quality.</div>}
              </div>

              <div className="sidebar-section" style={{ marginTop: '0' }}>
                <button className="sidebar-switch collection-dropdown" onClick={() => setThreeDCollection((value) => value === 'No collection' ? '3D concepts' : 'No collection')}>
                  <span>{threeDCollection === 'No collection' ? 'Add to Collection' : threeDCollection} <HelpCircle size={12} /></span>
                  <ChevronDown size={14} />
                </button>
              </div>

              <button className="reset-settings" onClick={() => { setThreeDModel('Rodin V2'); setMeshType('Triangle'); setMeshQuality('500k'); setMaterial('All'); setThreeDPrivate(false); }}><RotateCcw size={14} /> Reset to Defaults</button>
            </div>
          ) : null}
        </aside>

        <main className="creation-main">
          <section className={`prompt-workspace ${isDragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
            {activeTab === '3d' ? (
              <div className="three-d-prompt-bar">
                <button className="prompt-attach" onClick={() => referenceInputRef.current?.click()} aria-label="Attach 3D reference images">
                  <ImageIcon size={18} />
                  {referenceFiles.length > 0 && <small className="reference-count">{referenceFiles.length}</small>}
                </button>
                <div className="three-d-tip">
                  <HelpCircle size={14} /> Tip: All images should show the same character or object from different angles. <a href="#" onClick={(event) => {
                    event.preventDefault();
                    onNavigate?.('blueprints');
                  }}>Use This Blueprint</a> to create your reference views.
                </div>
                <button
                  className="prompt-generate three-d-generate"
                  disabled={!referenceFiles.length}
                  onClick={() => {
                    setThreeDJobs((count) => count + 1);
                    showUiToast('3D generation added to the queue.', 'success');
                  }}
                >
                  Generate <span>{threeDJobs ? `#${threeDJobs + 1}` : '400'}</span>
                </button>
                <input ref={referenceInputRef} hidden multiple type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectReferenceFiles(event.target.files)} />
              </div>
            ) : (
              <div className="prompt-bar">
                <button className="prompt-attach" aria-label="Attach prompt reference" onClick={() => fileInputRef.current?.click()}><ImageIcon size={18} /></button>
                <textarea rows="1" value={prompt} onChange={(event) => { setPrompt(event.target.value); setDisabledSlideIndices(new Set()); }} placeholder="Type a prompt..." />
                <button className="prompt-magic" onClick={enhancePrompt} aria-label="Enhance prompt"><Sparkles size={17} /></button>
                <button className="prompt-generate" onClick={handleGenerate} disabled={!prompt.trim()}>{isGenerating ? <LoaderCircle className="spin" size={16} /> : <Sparkles size={15} />} Generate <span>{selectedSlideCount * numGenerations || ''}</span></button>
              </div>
            )}
            <div className="creation-tabs">
              <button className={activeTab === 'image' ? 'is-active' : ''} onClick={() => setActiveTab('image')}><ImageIcon size={15} /> Image</button>
              <button className={activeTab === 'video' ? 'is-active' : ''} onClick={() => setActiveTab('video')}><Play size={14} /> Video</button>
              <button className={activeTab === '3d' ? 'is-active' : ''} onClick={() => setActiveTab('3d')}><Globe2 size={14} /> 3D</button>
              <button onClick={() => onNavigate?.('audio')}><Volume2 size={14} /> Audio <small>New</small></button>
              <button onClick={() => onNavigate?.('flow')}><Workflow size={14} /> Flow State</button>
              <button onClick={() => onNavigate?.('blueprints')}><GitBranch size={14} /> Blueprints</button>
              <button className="mobile-settings" onClick={() => setSettingsOpen(true)}><Settings2 size={14} /> Settings</button>
            </div>
          </section>

          {globalError && <div className="global-error"><AlertCircle size={18} /><span>{globalError}</span><button onClick={() => setGlobalError('')}><X size={16} /></button></div>}

          {activeTab === 'image' && (
            <>
              {parsedSlides.length > 0 && (
                <section className="prompt-queue">
                  <div className="queue-top"><span>Prompt Queue · {selectedSlideCount}/{parsedSlides.length}</span><div><button onClick={() => setDisabledSlideIndices(new Set())}>Select all</button><button onClick={() => setDisabledSlideIndices(new Set(parsedSlides.map((_, index) => index)))}>Clear</button></div></div>
                  <div className="prompt-chips">{parsedSlides.map((slide, index) => { const enabled = !disabledSlideIndices.has(index); return <button key={`${index}-${slide.slice(0, 15)}`} className={enabled ? 'is-selected' : ''} onClick={() => toggleSlide(index)}>{enabled ? <CheckSquare size={15} /> : <Square size={15} />}<span><strong>#{index + 1}</strong>{slide}</span></button>; })}</div>
                </section>
              )}

              {!imagesHistory.length ? (
                <section className="inspiration-section">
                  <h1>LOOKING FOR INSPIRATION?</h1>
                  <div className="inspiration-grid">{INSPIRATIONS.map((item) => <article key={item.title} className="inspiration-card"><div style={{ backgroundImage: `url(${inspirationArtwork})`, backgroundPosition: item.position }} /><footer><p>{item.title}</p><button onClick={() => setPrompt(item.prompt)}>Use Prompt</button></footer></article>)}</div>
                </section>
              ) : (
                <section className="results-section">
                  <div className="results-heading"><h2>Your Creations <em>{imagesHistory.length}</em></h2><button className="clear-results" onClick={() => setImagesHistory([])}><Trash2 size={14} /> Clear</button></div>
                  <div className="generated-grid">{imagesHistory.map((item) => (
                    <article className="generated-card" key={item.id}>
                      <div className="generated-preview">
                        {item.status === 'loading' && <div className="loading-preview"><LoaderCircle className="spin" size={27} /><strong>Створюємо зображення</strong><span>{item.modelName}</span></div>}
                        {item.status === 'error' && <div className="error-preview"><AlertCircle size={25} /><strong>Не вдалося згенерувати</strong><span>{item.error}</span><button onClick={() => retryGeneration(item)}><RefreshCw size={14} /> Повторити</button></div>}
                        {item.status === 'success' && <><img src={item.url} alt={item.prompt} /><div className="image-actions"><button onClick={() => setSelectedImage(item)}><Maximize size={17} /></button><a href={item.url} download={`lumina-${item.slideNumber}.png`}><Download size={17} /></a></div></>}
                      </div>
                      <div className="generated-info"><div><span>#{item.slideNumber}</span><small>{item.date}</small></div><p>{item.prompt}</p><footer><span>{item.modelName}</span><span>{item.aspectRatio} · {item.imageSize}</span></footer></div>
                    </article>
                  ))}</div>
                </section>
              )}
            </>
          )}

          {activeTab === 'video' && (
            <section className="video-results-section">
              <div className="video-results-date">Wednesday, 1 October 2025</div>
              
              <div className="video-prompt-block">
                <div className="video-prompt-text">{prompt || 'fire bg'}</div>
                <div className="video-prompt-actions">
                  <div className="video-pa-left">
                    <button className="vp-btn iterate-btn" onClick={() => {
                      setPrompt((current) => current || 'fire bg');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      showUiToast('Prompt restored for another iteration.', 'success');
                    }}><Sparkles size={14}/> Iterate</button>
                    <button className="vp-btn dots-btn" onClick={() => showUiToast('Video actions: iterate, download, or report output.')}>...</button>
                    <div className="vp-tags">
                      <span className="vp-tag">Illustrative Albedo</span>
                      <span className="vp-tag">1280×720</span>
                      <span className="vp-tag">Graphic Design 2D</span>
                      <span className="vp-tag">Fast</span>
                    </div>
                  </div>
                  <div className="video-pa-right">
                    <span className="how-was-it">How was this output?</span>
                    <button className={`vp-btn ${videoFeedback === 'up' ? 'is-active' : ''}`} aria-label="Like video output" aria-pressed={videoFeedback === 'up'} onClick={() => {
                      setVideoFeedback('up');
                      showUiToast('Thanks for the feedback.', 'success');
                    }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></button>
                    <button className={`vp-btn ${videoFeedback === 'down' ? 'is-active' : ''}`} aria-label="Dislike video output" aria-pressed={videoFeedback === 'down'} onClick={() => {
                      setVideoFeedback('down');
                      showUiToast('Feedback recorded. We will improve this output.', 'success');
                    }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg></button>
                  </div>
                </div>

                <div className="video-generated-grid">
                  {[1,2,3,4].map(idx => (
                    <div key={idx} className="video-card-explicit">
                      <AlertCircle size={20} />
                      <span>This image might be explicit</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="video-results-date">Tuesday, 23 September 2025</div>
              <div className="video-prompt-block">
                <div className="video-prompt-text">dog play pc game tanks</div>
                <div className="video-prompt-actions">
                  {/* Mock content below cutoff in screenshot */}
                </div>
              </div>

            </section>
          )}

          {activeTab === '3d' && (
            <section className="video-results-section three-d-results-section">
              <div className="video-results-date">Wednesday, 1 October 2025</div>
              <div className="three-d-results-layout">
                <div className="three-d-generated-grid">
                  {[1,2,3,4].map(idx => (
                    <div key={idx} className="video-card-explicit">
                      <AlertCircle size={20} />
                      <span>This image might be explicit</span>
                    </div>
                  ))}
                </div>
                <div className="three-d-results-info">
                  <div className="video-prompt-text">fire bg</div>
                  <div className="vp-tags three-d-tags">
                    <span className="vp-tag">Illustrative Albedo</span>
                    <span className="vp-tag">1280×720</span>
                    <span className="vp-tag">Graphic Design 2D</span>
                    <span className="vp-tag">Fast</span>
                  </div>
                  <div className="three-d-actions-row">
                    <button className="vp-btn dots-btn" onClick={() => showUiToast('3D actions: preview, download, or remove generation.')}>...</button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {selectedImage && (
        <div className="image-modal" onMouseUp={handleCanvasUp} onMouseLeave={handleCanvasUp}>
          <div className="modal-top"><div><button onClick={() => setSelectedImage(null)}><ArrowLeft size={18} /></button><div><strong>Редактор зображення</strong><small>{selectedImage.modelName} · {selectedImage.aspectRatio}</small></div></div><div className="editor-tools"><button className={editorMode === 'wand' ? 'is-active' : ''} onClick={() => activateEditor('wand')}><Wand2 size={16} /> Фон</button><button className={editorMode === 'eraser' ? 'is-active' : ''} onClick={() => activateEditor('eraser')}><Eraser size={16} /> Гумка</button><button className={editorMode === 'brush' ? 'is-active' : ''} onClick={() => activateEditor('brush')}><Paintbrush size={16} /> Пензель</button>{editorMode !== 'none' && <><label>Розмір <input type="range" min="5" max="120" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} /></label><button onClick={undoCanvas} disabled={historyStates.length <= 1}><RotateCcw size={16} /></button><button className="save-edit" onClick={saveEdit}><Save size={16} /> Зберегти</button></>}<a href={editedImageUrl || selectedImage.url} download={`lumina-${selectedImage.slideNumber}.png`}><Download size={16} /> Завантажити</a><button onClick={() => setSelectedImage(null)}><X size={18} /></button></div></div>
          <div className={`modal-canvas ${editorMode !== 'none' ? 'is-editing' : ''}`}>{editorMode === 'none' ? <img src={editedImageUrl || selectedImage.url} alt={selectedImage.prompt} /> : <canvas ref={canvasRef} onMouseDown={handleCanvasDown} onMouseMove={(event) => isDrawingRef.current && drawOnCanvas(event)} />}</div>
        </div>
      )}
    </div>
  );
}

const legacyStudioStyles = `
  html, body, #root { min-height: 100%; margin: 0; background: #070707; }
  .studio-app { min-height: 100vh; background: #070707; color: #fff; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .studio-app * { box-sizing: border-box; }
  .studio-app button, .studio-app input, .studio-app textarea, .studio-app select { font: inherit; }
  .studio-header { height: 68px; position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 0 24px; border-bottom: 1px solid rgba(255,255,255,.09); background: rgba(8,8,8,.88); backdrop-filter: blur(22px); }
  .studio-header-left, .studio-header-actions, .studio-brand, .studio-brand > div, .studio-header-left { display: flex; align-items: center; }
  .studio-header-left { gap: 14px; }
  .studio-icon-button { width: 38px; height: 38px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; background: #121212; color: #ccc; cursor: pointer; }
  .studio-brand { gap: 9px; }
  .studio-brand > span { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; background: linear-gradient(145deg,#8265ff,#4c32d1); }
  .studio-brand > div { align-items: flex-start; flex-direction: column; line-height: 1; }
  .studio-brand strong { font-size: 13px; letter-spacing: .15em; }
  .studio-brand small { margin-top: 5px; color: #6f6f6f; font-size: 7px; letter-spacing: .2em; }
  .studio-header-actions { gap: 9px; }
  .api-status { display: flex; align-items: center; gap: 7px; margin-right: 8px; color: #8b8b8b; font-size: 10px; font-weight: 700; }
  .api-status i { width: 7px; height: 7px; border-radius: 50%; background: #7b3434; box-shadow: 0 0 9px #7b3434; }
  .api-status--ready { color: #9ccbaa; }
  .api-status--ready i { background: #50b76d; box-shadow: 0 0 9px #50b76d; }
  .studio-secondary, .studio-generate, .upload-button { height: 39px; border-radius: 12px; padding: 0 14px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid rgba(255,255,255,.1); background: #151515; color: #d0d0d0; font-size: 11px; font-weight: 720; cursor: pointer; }
  .studio-generate { border: 0; background: linear-gradient(135deg,#8568ff,#593be0); color: #fff; box-shadow: 0 8px 22px rgba(91,59,224,.25); }
  .studio-generate:disabled { opacity: .5; cursor: not-allowed; }
  .studio-layout { min-height: calc(100vh - 68px); display: grid; grid-template-columns: 300px minmax(0,1fr); }
  .studio-settings { position: sticky; top: 68px; height: calc(100vh - 68px); padding: 24px 20px; overflow-y: auto; border-right: 1px solid rgba(255,255,255,.08); background: #0b0b0b; }
  .settings-title { margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
  .settings-title small, .studio-kicker { color: #735af0; font-size: 8px; font-weight: 850; letter-spacing: .18em; }
  .settings-title h2 { margin: 4px 0 0; font-size: 20px; }
  .settings-title > button { display: none; border: 0; background: none; color: #aaa; }
  .studio-field { margin-bottom: 20px; display: grid; gap: 8px; }
  .studio-field > span { display: flex; align-items: center; gap: 6px; color: #c8c8c8; font-size: 10px; font-weight: 750; }
  .studio-field > small { color: #666; font-size: 9px; line-height: 1.45; }
  .studio-field select, .key-input { width: 100%; height: 42px; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; background: #151515; color: #eee; outline: none; }
  .studio-field select { padding: 0 10px; font-size: 11px; }
  .key-input { display: flex; align-items: center; overflow: hidden; }
  .key-input input { min-width: 0; flex: 1; border: 0; outline: 0; padding: 0 11px; background: transparent; color: #fff; font-size: 11px; }
  .key-input button { width: 38px; height: 100%; border: 0; background: transparent; color: #777; display: grid; place-items: center; }
  .ratio-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 5px; }
  .ratio-grid button, .size-grid button { height: 34px; border: 1px solid rgba(255,255,255,.09); border-radius: 9px; background: #141414; color: #838383; font-size: 9px; cursor: pointer; }
  .ratio-grid button.is-active, .size-grid button.is-active { border-color: #765cf1; color: #fff; background: rgba(116,87,241,.18); }
  .size-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 5px; }
  .studio-toggle { width: 100%; margin-bottom: 8px; padding: 11px; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; background: #121212; color: #777; display: flex; align-items: center; justify-content: space-between; cursor: pointer; text-align: left; }
  .studio-toggle > span { display: flex; align-items: center; gap: 9px; }
  .studio-toggle div { display: grid; gap: 2px; }
  .studio-toggle strong { color: #bbb; font-size: 10px; }
  .studio-toggle small { color: #5f5f5f; font-size: 8px; }
  .studio-toggle > i { width: 28px; height: 16px; border-radius: 10px; background: #2a2a2a; position: relative; }
  .studio-toggle > i::after { content:''; position:absolute; top:3px; left:3px; width:10px; height:10px; border-radius:50%; background:#777; transition:.2s; }
  .studio-toggle.is-active { border-color: rgba(118,92,241,.45); color: #856cff; }
  .studio-toggle.is-active > i { background: #654bd9; }
  .studio-toggle.is-active > i::after { left: 15px; background: #fff; }
  .studio-main { min-width: 0; padding: 32px clamp(22px,4vw,64px) 70px; }
  .composer-card { max-width: 1160px; margin: 0 auto; padding: 24px; border: 1px solid rgba(255,255,255,.1); border-radius: 20px; background: linear-gradient(145deg,#111,#0d0d0d); box-shadow: 0 25px 70px rgba(0,0,0,.2); transition:.2s; }
  .composer-card--dragging { border-color: #8064fa; box-shadow: 0 0 0 4px rgba(128,100,250,.1); }
  .composer-top, .composer-bottom, .results-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
  .composer-top h1 { margin: 4px 0 0; font-size: 23px; letter-spacing: -.025em; }
  .upload-button { background: #181818; color: #aaa; }
  .composer-card textarea { width: 100%; min-height: 160px; margin: 20px 0 13px; padding: 16px; resize: vertical; border: 1px solid rgba(255,255,255,.09); border-radius: 15px; outline: none; background: #090909; color: #eee; font-size: 13px; line-height: 1.65; }
  .composer-card textarea:focus { border-color: rgba(126,98,247,.68); box-shadow: 0 0 0 3px rgba(126,98,247,.08); }
  .composer-card textarea::placeholder { color: #505050; }
  .composer-bottom > span { color: #656565; font-size: 9px; }
  .composer-bottom > div { display: flex; gap: 8px; }
  .mobile-settings { display: none; }
  .global-error { max-width:1160px; margin:14px auto 0; padding:12px 14px; border:1px solid rgba(235,91,91,.26); border-radius:12px; background:rgba(125,35,35,.12); color:#eaa; display:flex; align-items:center; gap:9px; font-size:11px; }
  .global-error span { flex:1; }
  .global-error button { border:0; background:none; color:#b77; }
  .prompt-list-section, .results-section { max-width: 1160px; margin: 36px auto 0; }
  .results-heading { margin-bottom: 14px; align-items: end; }
  .results-heading h2 { margin: 4px 0 0; font-size: 19px; }
  .results-heading h2 em { margin-left: 5px; color: #5d5d5d; font-style: normal; font-size: 12px; }
  .results-heading > div:last-child { display: flex; gap: 5px; }
  .results-heading > div:last-child button, .clear-results { border:1px solid rgba(255,255,255,.08); border-radius:9px; padding:7px 9px; background:#111; color:#777; font-size:9px; cursor:pointer; }
  .prompt-chips { display: grid; gap: 6px; }
  .prompt-chips > button { width:100%; min-height:45px; padding:9px 12px; display:flex; align-items:flex-start; gap:9px; border:1px solid rgba(255,255,255,.07); border-radius:11px; background:#0e0e0e; color:#545454; text-align:left; cursor:pointer; }
  .prompt-chips > button.is-selected { border-color:rgba(119,91,240,.35); color:#8067eb; background:rgba(103,75,222,.07); }
  .prompt-chips span { min-width:0; display:flex; gap:9px; color:#888; font-size:10px; line-height:1.45; }
  .prompt-chips strong { color:#7259dc; }
  .empty-results { min-height:260px; border:1px dashed rgba(255,255,255,.1); border-radius:18px; display:grid; place-content:center; justify-items:center; text-align:center; }
  .empty-results > span { width:60px; height:60px; display:grid; place-items:center; border-radius:19px; background:#121212; color:#484848; }
  .empty-results h3 { margin:13px 0 4px; font-size:14px; color:#aaa; }
  .empty-results p { margin:0; color:#555; font-size:10px; }
  .generated-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
  .generated-card { min-width:0; border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden; background:#0e0e0e; }
  .generated-preview { position:relative; aspect-ratio:1/1; overflow:hidden; background:#090909; }
  .generated-preview > img { width:100%; height:100%; object-fit:cover; display:block; }
  .loading-preview, .error-preview { position:absolute; inset:0; padding:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; text-align:center; color:#775de7; background:radial-gradient(circle at 50% 40%,rgba(101,73,220,.12),transparent 55%); }
  .loading-preview strong, .error-preview strong { color:#aaa; font-size:11px; }
  .loading-preview span, .error-preview span { color:#5c5c5c; font-size:9px; line-height:1.4; }
  .error-preview { color:#c56565; }
  .error-preview button { margin-top:5px; padding:7px 10px; border:1px solid rgba(255,255,255,.1); border-radius:9px; background:#171717; color:#bbb; font-size:9px; display:flex; align-items:center; gap:5px; }
  .spin { animation: studio-spin 1s linear infinite; }
  @keyframes studio-spin { to { transform:rotate(360deg); } }
  .image-actions { position:absolute; inset:10px 10px auto auto; display:flex; gap:5px; opacity:0; transition:.2s; }
  .generated-preview:hover .image-actions { opacity:1; }
  .image-actions button, .image-actions a { width:34px; height:34px; border:1px solid rgba(255,255,255,.18); border-radius:10px; background:rgba(8,8,8,.7); backdrop-filter:blur(12px); color:#fff; display:grid; place-items:center; }
  .generated-info { padding:12px; }
  .generated-info > div, .generated-info footer { display:flex; justify-content:space-between; align-items:center; }
  .generated-info > div span { color:#7d63eb; font-size:9px; font-weight:800; }
  .generated-info > div small, .generated-info footer { color:#555; font-size:8px; }
  .generated-info p { height:32px; margin:8px 0 11px; overflow:hidden; color:#aaa; font-size:10px; line-height:1.55; }
  .generated-info footer { margin:0; padding:9px 0 0; border-top:1px solid rgba(255,255,255,.06); }
  .image-modal { position:fixed; inset:0; z-index:100; display:grid; grid-template-rows:64px minmax(0,1fr); background:#050505; }
  .modal-top { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:0 17px; border-bottom:1px solid rgba(255,255,255,.09); background:#0c0c0c; }
  .modal-top > div, .editor-tools { display:flex; align-items:center; gap:8px; }
  .modal-top > div:first-child > button, .editor-tools button, .editor-tools a { height:35px; padding:0 10px; border:1px solid rgba(255,255,255,.1); border-radius:10px; background:#151515; color:#aaa; display:flex; align-items:center; justify-content:center; gap:5px; font-size:9px; text-decoration:none; cursor:pointer; }
  .modal-top > div:first-child > div { display:grid; gap:2px; }
  .modal-top strong { font-size:11px; }
  .modal-top small { color:#666; font-size:8px; }
  .editor-tools button.is-active { border-color:#7659ec; color:#fff; background:rgba(107,78,226,.22); }
  .editor-tools button.save-edit { background:#6649df; color:#fff; border:0; }
  .editor-tools label { display:flex; align-items:center; gap:5px; color:#777; font-size:8px; }
  .editor-tools input { width:75px; accent-color:#7458ec; }
  .modal-canvas { min-height:0; padding:20px; display:grid; place-items:center; overflow:auto; background-image:linear-gradient(45deg,#101010 25%,transparent 25%),linear-gradient(-45deg,#101010 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#101010 75%),linear-gradient(-45deg,transparent 75%,#101010 75%); background-size:20px 20px; background-position:0 0,0 10px,10px -10px,-10px 0; }
  .modal-canvas img, .modal-canvas canvas { display:block; max-width:100%; max-height:100%; object-fit:contain; box-shadow:0 20px 70px rgba(0,0,0,.5); }
  .modal-canvas.is-editing canvas { cursor:crosshair; }
  @media(max-width:1000px){ .generated-grid{grid-template-columns:repeat(2,minmax(0,1fr));} }
  @media(max-width:800px){
    .studio-header{padding:0 12px}.api-status,.studio-header-actions .studio-secondary{display:none}.studio-layout{display:block}.studio-settings{position:fixed;inset:0 auto 0 0;z-index:60;width:min(320px,88vw);height:100vh;transform:translateX(-105%);transition:.25s;box-shadow:20px 0 70px rgba(0,0,0,.6)}.studio-settings--open{transform:translateX(0)}.settings-title>button{display:grid}.studio-main{padding:22px 13px 55px}.mobile-settings{display:inline-flex}.composer-card{padding:17px}.composer-top{align-items:flex-start}.composer-top .upload-button{font-size:0;width:39px;padding:0}.generated-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.modal-top{height:auto;min-height:64px;align-items:flex-start;padding:10px}.editor-tools{flex-wrap:wrap;justify-content:flex-end}.editor-tools button{font-size:0;width:34px;padding:0}.editor-tools a{font-size:0;width:34px;padding:0}
  }
  @media(max-width:560px){ .studio-brand small{display:none}.studio-header-actions .studio-generate{font-size:0;width:39px;padding:0}.composer-top h1{font-size:19px}.composer-bottom{align-items:flex-end}.composer-bottom>span{max-width:90px}.generated-grid{grid-template-columns:1fr}.generated-preview{aspect-ratio:4/3}.prompt-chips span{display:block}.prompt-chips strong{margin-right:7px}.image-modal{grid-template-rows:auto minmax(0,1fr)} }
`;
