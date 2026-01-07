
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageData, ResizeSettings } from './types';
import AdPlaceholder from './components/AdPlaceholder';
import FAQ from './components/FAQ';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [fileData, setFileData] = useState<ImageData | null>(null);
  const [settings, setSettings] = useState<ResizeSettings>({
    width: 0,
    height: 0,
    maintainAspectRatio: true,
    unit: 'px',
    percentage: 50,
  });

  // History state for Undo/Redo
  const [history, setHistory] = useState<ResizeSettings[]>([]);
  const [future, setFuture] = useState<ResizeSettings[]>([]);

  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pushToHistory = (prevSettings: ResizeSettings) => {
    setHistory(prev => [...prev, prevSettings]);
    setFuture([]); // Clear redo stack on new action
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [settings, ...prev]);
    setHistory(prev => prev.slice(0, -1));
    setSettings(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, settings]);
    setFuture(prev => prev.slice(1));
    setSettings(next);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const data: ImageData = {
          originalUrl: e.target?.result as string,
          name: file.name,
          type: file.type,
          width: img.width,
          height: img.height,
        };
        setFileData(data);
        const initialSettings: ResizeSettings = {
          width: img.width,
          height: img.height,
          maintainAspectRatio: true,
          unit: 'px',
          percentage: 50,
        };
        setSettings(initialSettings);
        setHistory([]);
        setFuture([]);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const reset = () => {
    setFileData(null);
    setResizedUrl(null);
    setHistory([]);
    setFuture([]);
    setSettings({
      width: 0,
      height: 0,
      maintainAspectRatio: true,
      unit: 'px',
      percentage: 50,
    });
  };

  const performResize = useCallback(() => {
    if (!fileData) return;
    setIsResizing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let targetWidth = settings.width;
      let targetHeight = settings.height;

      if (settings.unit === 'percent') {
        targetWidth = Math.round((fileData.width * settings.percentage) / 100);
        targetHeight = Math.round((fileData.height * settings.percentage) / 100);
      }

      targetWidth = Math.max(1, targetWidth);
      targetHeight = Math.max(1, targetHeight);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL(fileData.type, 0.9);
        setResizedUrl(dataUrl);
      }
      setIsResizing(false);
    };
    img.src = fileData.originalUrl;
  }, [fileData, settings]);

  useEffect(() => {
    if (!fileData || settings.width === 0 || settings.height === 0) return;
    const timeout = setTimeout(performResize, 150);
    return () => clearTimeout(timeout);
  }, [fileData, settings, performResize]);

  const updateWidth = (w: number) => {
    if (!fileData) return;
    const newWidth = isNaN(w) ? 0 : Math.max(0, w);
    pushToHistory(settings);
    setSettings(prev => {
      let newHeight = prev.height;
      if (prev.maintainAspectRatio && newWidth > 0) {
        newHeight = Math.round((newWidth / fileData.width) * fileData.height);
      }
      return { ...prev, width: newWidth, height: newHeight };
    });
  };

  const updateHeight = (h: number) => {
    if (!fileData) return;
    const newHeight = isNaN(h) ? 0 : Math.max(0, h);
    pushToHistory(settings);
    setSettings(prev => {
      let newWidth = prev.width;
      if (prev.maintainAspectRatio && newHeight > 0) {
        newWidth = Math.round((newHeight / fileData.height) * fileData.width);
      }
      return { ...prev, height: newHeight, width: newWidth };
    });
  };

  const handleUnitChange = (unit: 'px' | 'percent') => {
    if (unit === settings.unit) return;
    pushToHistory(settings);
    setSettings(prev => ({ ...prev, unit }));
  };

  const handleRatioChange = (maintainAspectRatio: boolean) => {
    pushToHistory(settings);
    setSettings(prev => ({ ...prev, maintainAspectRatio }));
  };

  const handlePercentageChange = (percentage: number) => {
    setSettings(prev => ({ ...prev, percentage }));
  };

  const getCurrentDimensions = () => {
    if (settings.unit === 'percent') {
      const w = Math.round((fileData?.width || 0) * settings.percentage / 100);
      const h = Math.round((fileData?.height || 0) * settings.percentage / 100);
      return `${w} × ${h}`;
    }
    return `${settings.width} × ${settings.height}`;
  };

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'nl', name: 'Nederlands' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline">QuickImageResizer</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden lg:block">
              <ul className="flex space-x-6 text-sm font-medium text-gray-600">
                <li><a href="#how-it-works" className="hover:text-indigo-600">{t.howItWorks}</a></li>
                <li><a href="#faq" className="hover:text-indigo-600">{t.faq}</a></li>
                <li><a href="#privacy" className="hover:text-indigo-600">{t.privacyPolicy}</a></li>
              </ul>
            </nav>
            <div className="relative">
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 outline-none cursor-pointer font-bold"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Top Banner Ad - Leaderboard */}
          <AdPlaceholder type="banner" label={t.adText} className="mb-12" />

          <section className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 px-4 leading-tight">
              {t.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              {t.subheading}
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              {t.trustText}
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              {!fileData ? (
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative group border-4 border-dashed border-gray-200 rounded-3xl p-12 transition-all hover:border-indigo-400 bg-white shadow-sm flex flex-col items-center justify-center min-h-[400px]"
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={onFileChange}
                    accept="image/*"
                    ref={fileInputRef}
                  />
                  <div className="bg-indigo-50 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mb-2">{t.dropText}</p>
                  <p className="text-gray-500 mb-8">{t.supportFormats}</p>
                  <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-colors">
                    {t.browseFiles}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">{t.originalImage}</h2>
                      <button 
                        onClick={reset}
                        className="text-red-500 font-bold text-sm hover:underline flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        {t.remove}
                      </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-grow bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[250px] relative border border-gray-200">
                        <img 
                          src={fileData.originalUrl} 
                          alt="To be resized" 
                          className="max-h-[400px] object-contain"
                        />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-xs font-bold uppercase tracking-wider">
                          {t.originalSize}: {fileData.width} × {fileData.height} px
                        </div>
                      </div>
                      
                      <div className="w-full md:w-80 space-y-6">
                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-indigo-900 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>
                              {t.resizeOptions}
                            </h3>
                            <div className="flex gap-2">
                              <button 
                                onClick={handleUndo} 
                                disabled={history.length === 0}
                                title={t.undo}
                                className="p-1.5 rounded-md hover:bg-white text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                              </button>
                              <button 
                                onClick={handleRedo} 
                                disabled={future.length === 0}
                                title={t.redo}
                                className="p-1.5 rounded-md hover:bg-white text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path></svg>
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <button 
                                onClick={() => handleUnitChange('px')}
                                className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${settings.unit === 'px' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                              >
                                {t.pixels}
                              </button>
                              <button 
                                onClick={() => handleUnitChange('percent')}
                                className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${settings.unit === 'percent' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                              >
                                {t.percentage}
                              </button>
                            </div>

                            {settings.unit === 'px' ? (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t.width}</label>
                                  <input 
                                    type="number" 
                                    value={settings.width === 0 ? '' : settings.width}
                                    placeholder="e.g. 1920"
                                    onChange={(e) => updateWidth(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t.height}</label>
                                  <input 
                                    type="number" 
                                    value={settings.height === 0 ? '' : settings.height}
                                    placeholder="e.g. 1080"
                                    onChange={(e) => updateHeight(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                  />
                                </div>
                                <div className="flex items-center">
                                  <input 
                                    type="checkbox" 
                                    id="ratio"
                                    checked={settings.maintainAspectRatio}
                                    onChange={(e) => handleRatioChange(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                  />
                                  <label htmlFor="ratio" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">{t.lockRatio}</label>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{t.resizeFactor}</label>
                                  <span className="text-indigo-600 font-bold">{settings.percentage}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="1" 
                                  max="100" 
                                  value={settings.percentage}
                                  onMouseDown={() => pushToHistory(settings)}
                                  onTouchStart={() => pushToHistory(settings)}
                                  onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
                                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  <span>1%</span>
                                  <span>50%</span>
                                  <span>100%</span>
                                </div>
                              </div>
                            )}

                            <div className="pt-2">
                                <div className={`text-center py-2 px-4 rounded-lg bg-white border border-indigo-100 text-xs font-bold text-indigo-600 transition-opacity ${isResizing ? 'opacity-50' : 'opacity-100'}`}>
                                   {t.newSize}: {getCurrentDimensions()} px
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {resizedUrl && (
                    <div className="bg-white rounded-3xl shadow-xl border-4 border-indigo-500/10 overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            {t.livePreview}
                            {isResizing && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 animate-pulse">{t.updating}</span>}
                          </h2>
                          <p className="text-xs text-gray-400 font-medium">{t.renderedAt} {getCurrentDimensions()} px</p>
                        </div>
                        <a 
                          href={resizedUrl} 
                          download={`resized-${fileData.name}`}
                          className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 active:scale-95 shadow-lg flex items-center justify-center transition-all"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          {t.downloadBtn}
                        </a>
                      </div>
                      <div className="bg-gray-100 rounded-xl overflow-auto flex items-center justify-center p-8 border-2 border-dashed border-gray-200 min-h-[300px]">
                        <img 
                          src={resizedUrl} 
                          alt="Resized preview" 
                          className={`max-w-full shadow-2xl transition-opacity duration-200 ${isResizing ? 'opacity-40' : 'opacity-100'}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Sidebar Ad Placement - Medium Rectangle */}
              <AdPlaceholder type="in-content" label={t.adText} />

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                   <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   {t.whyUs}
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mt-0.5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{t.privateTrust}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mt-0.5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{t.signupTrust}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mt-0.5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{t.fastTrust}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                <h3 className="font-bold mb-2 flex items-center">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                   {t.proTip}
                </h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  {t.proTipText}
                </p>
              </div>

              {/* Second Sidebar Ad Placement */}
              <AdPlaceholder type="in-content" label={t.adText} />
            </div>
          </div>
          
          <div id="how-it-works" className="mt-20 py-16 bg-white rounded-3xl border border-gray-200 px-8 text-center max-w-4xl mx-auto shadow-sm">
            <h2 className="text-3xl font-bold mb-12">{t.howItWorks}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">1</div>
                <h4 className="font-bold text-gray-900">{t.step1}</h4>
                <p className="text-gray-500 text-sm">{t.step1Text}</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">2</div>
                <h4 className="font-bold text-gray-900">{t.step2}</h4>
                <p className="text-gray-500 text-sm">{t.step2Text}</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">3</div>
                <h4 className="font-bold text-gray-900">{t.step3}</h4>
                <p className="text-gray-500 text-sm">{t.step3Text}</p>
              </div>
            </div>
          </div>

          {/* In-Content Ad placement between sections */}
          <div className="my-20">
             <AdPlaceholder type="banner" label={t.adText} />
          </div>

          <div id="faq">
            <FAQ language={lang} />
          </div>

          {/* Large Footer Ad Placement */}
          <AdPlaceholder type="footer" label={t.adText} />
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">QuickImageResizer</span>
          </div>
          <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm">
            {t.footerTrust}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-400 mb-8">
            <a href="#privacy" className="hover:text-white">{t.privacyPolicy}</a>
            <a href="#" className="hover:text-white">{t.terms}</a>
            <a href="#" className="hover:text-white">{t.contact}</a>
          </div>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} QuickImageResizer. {t.rights}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
