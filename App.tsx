
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageData, ResizeSettings } from './types';
import AdPlaceholder from './components/AdPlaceholder';
import FAQ from './components/FAQ';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<ImageData | null>(null);
  const [settings, setSettings] = useState<ResizeSettings>({
    width: 0,
    height: 0,
    maintainAspectRatio: true,
    unit: 'px',
    percentage: 50,
  });
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setSettings(prev => ({
          ...prev,
          width: img.width,
          height: img.height,
        }));
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

      // Safeguard against 0 dimensions for the final canvas processing
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

  // Automatic Live Preview with debounce
  useEffect(() => {
    if (!fileData || settings.width === 0 || settings.height === 0) return;
    const timeout = setTimeout(performResize, 150);
    return () => clearTimeout(timeout);
  }, [fileData, settings, performResize]);

  const updateWidth = (w: number) => {
    if (!fileData) return;
    const newWidth = isNaN(w) ? 0 : Math.max(0, w);
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
    setSettings(prev => {
      let newWidth = prev.width;
      if (prev.maintainAspectRatio && newHeight > 0) {
        newWidth = Math.round((newHeight / fileData.height) * fileData.width);
      }
      return { ...prev, height: newHeight, width: newWidth };
    });
  };

  const getCurrentDimensions = () => {
    if (settings.unit === 'percent') {
      const w = Math.round((fileData?.width || 0) * settings.percentage / 100);
      const h = Math.round((fileData?.height || 0) * settings.percentage / 100);
      return `${w} × ${h}`;
    }
    return `${settings.width} × ${settings.height}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">QuickImageResizer</span>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-6 text-sm font-medium text-gray-600">
              <li><a href="#how-it-works" className="hover:text-indigo-600">How it Works</a></li>
              <li><a href="#faq" className="hover:text-indigo-600">FAQ</a></li>
              <li><a href="#privacy" className="hover:text-indigo-600">Privacy</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <AdPlaceholder type="banner" className="mb-8" />

          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              QuickImageResizer – Resize Images Online Instantly
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Free, fast, and private. No upload required. Your images never leave your browser.
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              100% Secure & Client-Side
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
                  <p className="text-2xl font-bold text-gray-800 mb-2">Drag and drop your image</p>
                  <p className="text-gray-500 mb-8">Supports JPG, PNG, and WebP formats</p>
                  <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-colors">
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">1. Original Image</h2>
                      <button 
                        onClick={reset}
                        className="text-red-500 font-bold text-sm hover:underline flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Remove
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
                          Original: {fileData.width} × {fileData.height} px
                        </div>
                      </div>
                      
                      <div className="w-full md:w-80 space-y-6">
                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                          <h3 className="font-bold text-indigo-900 mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>
                            2. Resize Options
                          </h3>
                          
                          <div className="space-y-4">
                            <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <button 
                                onClick={() => setSettings(s => ({...s, unit: 'px'}))}
                                className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${settings.unit === 'px' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                              >
                                Pixels
                              </button>
                              <button 
                                onClick={() => setSettings(s => ({...s, unit: 'percent'}))}
                                className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${settings.unit === 'percent' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                              >
                                Percentage
                              </button>
                            </div>

                            {settings.unit === 'px' ? (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Width (px)</label>
                                  <input 
                                    type="number" 
                                    value={settings.width === 0 ? '' : settings.width}
                                    placeholder="e.g. 1920"
                                    onChange={(e) => updateWidth(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Height (px)</label>
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
                                    onChange={(e) => setSettings(s => ({...s, maintainAspectRatio: e.target.checked}))}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                  />
                                  <label htmlFor="ratio" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">Lock Aspect Ratio</label>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Resize Factor</label>
                                  <span className="text-indigo-600 font-bold">{settings.percentage}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="1" 
                                  max="100" 
                                  value={settings.percentage}
                                  onChange={(e) => setSettings(s => ({...s, percentage: parseInt(e.target.value)}))}
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
                                   New Size: {getCurrentDimensions()} px
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
                            3. Live Preview
                            {isResizing && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 animate-pulse">Updating...</span>}
                          </h2>
                          <p className="text-xs text-gray-400 font-medium">Rendered at {getCurrentDimensions()} px</p>
                        </div>
                        <a 
                          href={resizedUrl} 
                          download={`resized-${fileData.name}`}
                          className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 active:scale-95 shadow-lg flex items-center justify-center transition-all"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          Download Resized Image
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
              <AdPlaceholder type="in-content" />
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                   <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   Why QuickImageResizer?
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mt-0.5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span><strong>100% Private:</strong> Your images are processed in your RAM, not on our disk.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mt-0.5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span><strong>No Signup:</strong> We don't need your email or data to help you resize.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mt-0.5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span><strong>Fast Scaling:</strong> Instant preview and download for all major formats.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                <h3 className="font-bold mb-2 flex items-center">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                   Pro Tip!
                </h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  Locking the aspect ratio ensures your photos don't look stretched. Use the percentage slider for the fastest web optimization results.
                </p>
              </div>
            </div>
          </div>
          
          <div id="how-it-works" className="mt-20 py-16 bg-white rounded-3xl border border-gray-200 px-8 text-center max-w-4xl mx-auto shadow-sm">
            <h2 className="text-3xl font-bold mb-12">How To Resize Images Online</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">1</div>
                <h4 className="font-bold text-gray-900">Upload Image</h4>
                <p className="text-gray-500 text-sm">Drag your JPG, PNG, or WebP file into the dropzone or click to browse.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">2</div>
                <h4 className="font-bold text-gray-900">Adjust Settings</h4>
                <p className="text-gray-500 text-sm">Input specific dimensions or use the percentage slider for instant resizing.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">3</div>
                <h4 className="font-bold text-gray-900">Download Result</h4>
                <p className="text-gray-500 text-sm">Check the live preview and download your high-quality resized photo.</p>
              </div>
            </div>
          </div>

          <div id="faq">
            <FAQ />
          </div>
          <AdPlaceholder type="footer" />
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">QuickImageResizer</span>
          </div>
          <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm">
            QuickImageResizer is the world's most private online image resizing tool. We believe your images belong to you, which is why we never upload them anywhere.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-400 mb-8">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact Us</a>
          </div>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} QuickImageResizer. All rights reserved. No cookies, no trackers, just fast resizing.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
