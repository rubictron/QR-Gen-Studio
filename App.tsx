import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { 
  Link as LinkIcon, FileText, UserSquare, Wifi, Mail, MessageSquare, Phone, 
  Download, Share2, Sparkles, Plus, Image as ImageIcon,
  Palette, RefreshCcw, Check, Copy, ArrowLeft, ChevronRight, Code,
  Calendar, Globe, Shield, Heart, ShoppingBag, Sliders, AlertCircle,
  CheckCircle2, X, Lock, KeyRound
} from 'lucide-react';
import { QRType, QRConfig } from './types';
import { formatVCard, formatWiFi, formatEmail, formatSMS, formatWhatsApp, formatEvent } from './services/qrUtils';
import { generateBio, generateMarketingSMS } from './services/geminiService';

// Built-in logo presets encoded as SVG data URLs for instant zero-dependency usage
const PRESET_LOGOS = [
  {
    id: 'web',
    name: 'Website',
    color: '#2563eb',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20"/></svg>`
  },
  {
    id: 'vcard',
    name: 'Contact',
    color: '#059669',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    color: '#4f46e5',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%234f46e5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20" stroke-width="3"/></svg>`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    color: '#16a34a',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2316a34a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
  },
  {
    id: 'mail',
    name: 'Email',
    color: '#ea580c',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`
  },
  {
    id: 'heart',
    name: 'Favorite',
    color: '#e11d48',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f43f5e" stroke="%23e11d48" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
  },
  {
    id: 'security',
    name: 'Verified',
    color: '#0891b2',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%230891b2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`
  },
  {
    id: 'shop',
    name: 'Store',
    color: '#9333ea',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239333ea" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
  }
];

const COLOR_PRESETS = [
  { name: 'Classic Obsidian', fg: '#000000', bg: '#ffffff' },
  { name: 'Indigo Brand', fg: '#3730a3', bg: '#ffffff' },
  { name: 'Emerald Forest', fg: '#065f46', bg: '#ffffff' },
  { name: 'Ruby Sunset', fg: '#9f1239', bg: '#ffffff' },
  { name: 'Ocean Navy', fg: '#075985', bg: '#ffffff' },
  { name: 'Deep Violet', fg: '#581c87', bg: '#ffffff' },
  { name: 'Dark Theme', fg: '#f8fafc', bg: '#0f172a' },
];

export const App: React.FC = () => {
  // Active QR type (defaults to URL for immediate visual preview)
  const [activeType, setActiveType] = useState<QRType>(QRType.URL);
  
  const [config, setConfig] = useState<QRConfig>({
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'H', // High error correction recommended for logos in the middle
    size: 320,
    margin: true,
    logoSize: 64,
    excavateLogo: true,
    logoUrl: PRESET_LOGOS[0].svg, // Default logo preview
  });
  
  const [fields, setFields] = useState<any>({
    url: 'https://github.com',
    text: 'Welcome to QR Gen Studio! Scan to explore.',
    firstName: 'Alex',
    lastName: 'Morgan',
    organization: 'Acme Technologies',
    title: 'Lead Architect',
    phone: '+1 (555) 234-5678',
    email: 'alex.morgan@example.com',
    address: '100 Innovation Way, Suite 400',
    ssid: 'Studio_Guest_WiFi',
    password: 'ConnectNow2026',
    encryption: 'WPA',
    hidden: false,
    subject: 'Partnership Inquiry',
    body: 'Hello! I am reaching out regarding your innovative services.',
    message: 'Hey there! Checking out your new QR code.',
    eventTitle: 'Product Launch 2026',
    eventLocation: 'Convention Center, Main Hall',
    eventStart: '2026-11-15 09:00',
    eventEnd: '2026-11-15 17:00',
    eventDesc: 'Join us for the keynote unveiling of next-generation tools.'
  });

  const [qrValue, setQrValue] = useState<string>('https://github.com');
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    updateQrValue();
  }, [fields, activeType]);

  const updateQrValue = () => {
    let value = '';
    switch (activeType) {
      case QRType.URL:
        value = fields.url ? (fields.url.startsWith('http') ? fields.url : `https://${fields.url}`) : 'https://example.com';
        break;
      case QRType.TEXT:
        value = fields.text || 'Sample Text';
        break;
      case QRType.VCARD:
        value = formatVCard({
          firstName: fields.firstName,
          lastName: fields.lastName,
          organization: fields.organization,
          title: fields.title,
          phone: fields.phone,
          email: fields.email,
          url: fields.url,
          address: fields.address,
        });
        break;
      case QRType.WIFI:
        value = formatWiFi({
          ssid: fields.ssid,
          password: fields.password,
          encryption: fields.encryption,
          hidden: fields.hidden,
        });
        break;
      case QRType.EMAIL:
        value = formatEmail({
          address: fields.email || fields.address,
          subject: fields.subject,
          body: fields.body,
        });
        break;
      case QRType.SMS:
        value = formatSMS({
          phone: fields.phone,
          message: fields.message,
        });
        break;
      case QRType.WHATSAPP:
        value = formatWhatsApp({
          phone: fields.phone,
          message: fields.message,
        });
        break;
      case QRType.PHONE:
        value = `tel:${fields.phone || ''}`;
        break;
      case QRType.EVENT:
        value = formatEvent({
          title: fields.eventTitle,
          location: fields.eventLocation,
          startDate: fields.eventStart,
          endDate: fields.eventEnd,
          description: fields.eventDesc,
        });
        break;
      default:
        value = fields.url || 'https://example.com';
    }
    setQrValue(value);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFields((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, logoUrl: reader.result as string }));
        showToast('Middle logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setConfig(prev => ({ ...prev, logoUrl: undefined }));
    showToast('Middle logo removed', 'info');
  };

  const downloadPNG = (scale: number = 2) => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) {
      showToast('QR code preview not ready', 'error');
      return;
    }

    // High resolution render
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width * scale;
    offscreenCanvas.height = canvas.height * scale;
    const ctx = offscreenCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
      const url = offscreenCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode-${activeType.toLowerCase()}-${Date.now()}.png`;
      link.href = url;
      link.click();
      showToast(`High-Res PNG (${offscreenCanvas.width}x${offscreenCanvas.height}px) downloaded!`);
    } else {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode-${activeType.toLowerCase()}.png`;
      link.href = url;
      link.click();
      showToast('PNG downloaded!');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      showToast('QR payload text copied to clipboard!');
    } catch {
      showToast('Failed to copy text', 'error');
    }
  };

  const copyImageToClipboard = async () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast('QR code image copied to clipboard!');
        } catch {
          // Fallback to text copy if browser security blocks blob write
          await navigator.clipboard.writeText(qrValue);
          showToast('Image copy restricted, copied raw QR data instead', 'info');
        }
      });
    } catch {
      showToast('Image clipboard not supported in this browser', 'info');
    }
  };

  const handleAiBio = async () => {
    setAiLoading(true);
    showToast('AI is crafting your executive bio...', 'info');
    const bio = await generateBio(fields.firstName, fields.title, fields.organization);
    if (bio) {
      setFields((prev: any) => ({ ...prev, address: bio }));
      showToast('Executive bio updated!');
    }
    setAiLoading(false);
  };

  const handleAiSMS = async () => {
    setAiLoading(true);
    showToast('AI is generating compelling copy...', 'info');
    const msg = await generateMarketingSMS(fields.organization || "Our Services", "Exclusive Welcome Offer");
    if (msg) {
      setFields((prev: any) => ({ ...prev, message: msg }));
      showToast('Marketing message generated!');
    }
    setAiLoading(false);
  };

  const generateWiFiPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFields((prev: any) => ({ ...prev, password: res }));
    showToast('Generated strong random WiFi password!');
  };

  const types = [
    { id: QRType.URL, label: 'Website URL', desc: 'Link to website, app, or portfolio', icon: <LinkIcon size={20} /> },
    { id: QRType.VCARD, label: 'Contact (vCard)', desc: 'Full profile with one scan', icon: <UserSquare size={20} /> },
    { id: QRType.WIFI, label: 'Wi-Fi Network', desc: 'Auto-join password & encryption', icon: <Wifi size={20} /> },
    { id: QRType.TEXT, label: 'Plain Text', desc: 'Notes, serials, instructions', icon: <FileText size={20} /> },
    { id: QRType.EMAIL, label: 'Email Draft', desc: 'Recipient, subject, and body', icon: <Mail size={20} /> },
    { id: QRType.WHATSAPP, label: 'WhatsApp', desc: 'Direct chat with prefilled text', icon: <Phone size={20} className="text-emerald-500" /> },
    { id: QRType.SMS, label: 'SMS Message', desc: 'Send text to a mobile number', icon: <MessageSquare size={20} /> },
    { id: QRType.PHONE, label: 'Phone Call', desc: 'Instant one-tap phone dialer', icon: <Phone size={20} /> },
    { id: QRType.EVENT, label: 'Calendar Event', desc: 'vCalendar meeting or event', icon: <Calendar size={20} /> },
  ];

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium text-sm";
  const labelClasses = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 antialiased font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce transition-all duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${
            toast.type === 'error' ? 'bg-rose-600' : toast.type === 'info' ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80 p-0.5">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-10 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-100">
            Q
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">QR Gen Studio</h1>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                Logo Engine v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Custom branding • Center logos • Multi-format QR</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => downloadPNG(3)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <Download size={15} />
            <span>Download PNG</span>
          </button>
        </div>
      </header>

      {/* Category Type Selector Strip */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 overflow-x-auto scrollbar-none sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 min-w-max">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
            <Sliders size={13} />
            Type:
          </span>
          {types.map((t) => {
            const isSelected = activeType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-slate-500'}>
                  {t.icon}
                </span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Input Forms & Customization */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Type Data Input Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    {types.find(t => t.id === activeType)?.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      {types.find(t => t.id === activeType)?.label}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {types.find(t => t.id === activeType)?.desc}
                    </p>
                  </div>
                </div>

                {/* AI / Action shortcut */}
                {activeType === QRType.VCARD && (
                  <button
                    onClick={handleAiBio}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={14} className={aiLoading ? 'animate-spin' : ''} />
                    {aiLoading ? 'Drafting...' : 'AI Bio Polish'}
                  </button>
                )}

                {activeType === QRType.SMS && (
                  <button
                    onClick={handleAiSMS}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={14} className={aiLoading ? 'animate-spin' : ''} />
                    {aiLoading ? 'Writing...' : 'AI Promo Text'}
                  </button>
                )}

                {activeType === QRType.WIFI && (
                  <button
                    onClick={generateWiFiPassword}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-all cursor-pointer"
                  >
                    <KeyRound size={14} />
                    Auto Password
                  </button>
                )}
              </div>

              {/* Dynamic Form Content */}
              <div className="space-y-4">
                
                {/* 1. URL */}
                {activeType === QRType.URL && (
                  <div>
                    <label className={labelClasses}>Destination URL</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <Globe size={16} />
                      </span>
                      <input
                        type="url"
                        name="url"
                        value={fields.url}
                        onChange={handleFieldChange}
                        placeholder="https://example.com"
                        className={`${inputClasses} pl-10`}
                      />
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                      <span className="text-slate-400 font-semibold self-center">Presets:</span>
                      {['https://github.com', 'https://linkedin.com', 'https://youtube.com', 'https://portfolio.me'].map(preset => (
                        <button
                          key={preset}
                          onClick={() => setFields((prev: any) => ({ ...prev, url: preset }))}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition-colors cursor-pointer"
                        >
                          {preset.replace('https://', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. VCARD */}
                {activeType === QRType.VCARD && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>First Name</label>
                      <input type="text" name="firstName" value={fields.firstName} onChange={handleFieldChange} className={inputClasses} placeholder="Alex" />
                    </div>
                    <div>
                      <label className={labelClasses}>Last Name</label>
                      <input type="text" name="lastName" value={fields.lastName} onChange={handleFieldChange} className={inputClasses} placeholder="Morgan" />
                    </div>
                    <div>
                      <label className={labelClasses}>Job Title</label>
                      <input type="text" name="title" value={fields.title} onChange={handleFieldChange} className={inputClasses} placeholder="Product Lead" />
                    </div>
                    <div>
                      <label className={labelClasses}>Company / Organization</label>
                      <input type="text" name="organization" value={fields.organization} onChange={handleFieldChange} className={inputClasses} placeholder="Acme Studio" />
                    </div>
                    <div>
                      <label className={labelClasses}>Phone Number</label>
                      <input type="tel" name="phone" value={fields.phone} onChange={handleFieldChange} className={inputClasses} placeholder="+1 555-0199" />
                    </div>
                    <div>
                      <label className={labelClasses}>Email Address</label>
                      <input type="email" name="email" value={fields.email} onChange={handleFieldChange} className={inputClasses} placeholder="alex@acme.com" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClasses}>Website / Portfolio</label>
                      <input type="url" name="url" value={fields.url} onChange={handleFieldChange} className={inputClasses} placeholder="https://portfolio.com" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClasses}>Bio / Address / Notes</label>
                      <textarea
                        name="address"
                        value={fields.address}
                        onChange={handleFieldChange}
                        rows={3}
                        className={inputClasses}
                        placeholder="Professional summary or physical office address..."
                      />
                    </div>
                  </div>
                )}

                {/* 3. WIFI */}
                {activeType === QRType.WIFI && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>Network Name (SSID)</label>
                      <input type="text" name="ssid" value={fields.ssid} onChange={handleFieldChange} className={inputClasses} placeholder="My_Home_WiFi" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Security Encryption</label>
                        <select name="encryption" value={fields.encryption} onChange={handleFieldChange} className={inputClasses}>
                          <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                          <option value="WEP">WEP (Legacy)</option>
                          <option value="nopass">None (Open Network)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>Network Password</label>
                        <input
                          type="text"
                          name="password"
                          value={fields.password}
                          onChange={handleFieldChange}
                          disabled={fields.encryption === 'nopass'}
                          className={inputClasses}
                          placeholder="Passphrase"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hidden"
                        checked={fields.hidden}
                        onChange={handleFieldChange}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-xs font-semibold text-slate-700">This is a hidden network (SSID not broadcasting)</span>
                    </label>
                  </div>
                )}

                {/* 4. PLAIN TEXT */}
                {activeType === QRType.TEXT && (
                  <div>
                    <label className={labelClasses}>Text Content</label>
                    <textarea
                      name="text"
                      value={fields.text}
                      onChange={handleFieldChange}
                      rows={5}
                      className={inputClasses}
                      placeholder="Type or paste any text or codes here..."
                    />
                    <p className="mt-1.5 text-[11px] text-slate-400 font-medium">Characters: {fields.text?.length || 0}</p>
                  </div>
                )}

                {/* 5. EMAIL */}
                {activeType === QRType.EMAIL && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>Recipient Email</label>
                      <input type="email" name="email" value={fields.email} onChange={handleFieldChange} className={inputClasses} placeholder="support@brand.com" />
                    </div>
                    <div>
                      <label className={labelClasses}>Pre-filled Subject</label>
                      <input type="text" name="subject" value={fields.subject} onChange={handleFieldChange} className={inputClasses} placeholder="Inquiry from QR Code" />
                    </div>
                    <div>
                      <label className={labelClasses}>Message Body</label>
                      <textarea name="body" value={fields.body} onChange={handleFieldChange} rows={4} className={inputClasses} placeholder="Hello, I would like to inquire about..." />
                    </div>
                  </div>
                )}

                {/* 6. WHATSAPP */}
                {activeType === QRType.WHATSAPP && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>Phone Number (Include Country Code)</label>
                      <input type="tel" name="phone" value={fields.phone} onChange={handleFieldChange} className={inputClasses} placeholder="+1234567890" />
                      <p className="mt-1 text-[11px] text-slate-400 font-medium">Example: +14155552671 (No dashes or spaces required)</p>
                    </div>
                    <div>
                      <label className={labelClasses}>Pre-filled Message</label>
                      <textarea name="message" value={fields.message} onChange={handleFieldChange} rows={3} className={inputClasses} placeholder="Hello! I found your QR code..." />
                    </div>
                  </div>
                )}

                {/* 7. SMS */}
                {activeType === QRType.SMS && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>Phone Number</label>
                      <input type="tel" name="phone" value={fields.phone} onChange={handleFieldChange} className={inputClasses} placeholder="+1234567890" />
                    </div>
                    <div>
                      <label className={labelClasses}>Text Message</label>
                      <textarea name="message" value={fields.message} onChange={handleFieldChange} rows={3} className={inputClasses} placeholder="Type your SMS message..." />
                    </div>
                  </div>
                )}

                {/* 8. PHONE */}
                {activeType === QRType.PHONE && (
                  <div>
                    <label className={labelClasses}>Phone Number to Dial</label>
                    <input type="tel" name="phone" value={fields.phone} onChange={handleFieldChange} className={inputClasses} placeholder="+1 (800) 555-0199" />
                    <p className="mt-1 text-[11px] text-slate-400 font-medium">When scanned, this will immediately prompt the user's phone to dial this number.</p>
                  </div>
                )}

                {/* 9. EVENT */}
                {activeType === QRType.EVENT && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>Event Title</label>
                      <input type="text" name="eventTitle" value={fields.eventTitle} onChange={handleFieldChange} className={inputClasses} placeholder="Grand Opening Party" />
                    </div>
                    <div>
                      <label className={labelClasses}>Location</label>
                      <input type="text" name="eventLocation" value={fields.eventLocation} onChange={handleFieldChange} className={inputClasses} placeholder="123 Market St, San Francisco, CA" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Start Time</label>
                        <input type="text" name="eventStart" value={fields.eventStart} onChange={handleFieldChange} className={inputClasses} placeholder="2026-11-15 09:00" />
                      </div>
                      <div>
                        <label className={labelClasses}>End Time</label>
                        <input type="text" name="eventEnd" value={fields.eventEnd} onChange={handleFieldChange} className={inputClasses} placeholder="2026-11-15 17:00" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Description</label>
                      <textarea name="eventDesc" value={fields.eventDesc} onChange={handleFieldChange} rows={2} className={inputClasses} placeholder="Event details and RSVP info..." />
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Section 2: Logo in Middle Customization */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <ImageIcon size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Logo in Middle</h3>
                    <p className="text-xs text-slate-500 font-medium">Embed your custom brand or choose a preset logo in the QR center</p>
                  </div>
                </div>

                {config.logoUrl && (
                  <button
                    onClick={handleRemoveLogo}
                    className="flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <X size={14} />
                    Remove Logo
                  </button>
                )}
              </div>

              {/* Upload & Current Logo Preview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="relative group shrink-0">
                  {config.logoUrl ? (
                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-indigo-200 p-2.5 flex items-center justify-center shadow-md shadow-indigo-50">
                      <img src={config.logoUrl} alt="Middle Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon size={24} />
                      <span className="text-[10px] font-bold mt-1">No Logo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5">
                      <Plus size={15} />
                      <span>Upload Custom Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <span className="text-[11px] text-slate-400">PNG, SVG, JPG, WebP (up to 5MB)</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    The logo is seamlessly placed in the center. Error correction level is set to High (H) to ensure 100% scan reliability.
                  </p>
                </div>
              </div>

              {/* Preset Quick Logos */}
              <div>
                <label className={labelClasses}>Or Pick a Ready-to-Use Icon Preset:</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 pt-1">
                  {PRESET_LOGOS.map((preset) => {
                    const isSelected = config.logoUrl === preset.svg;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setConfig(prev => ({ ...prev, logoUrl: preset.svg }));
                          showToast(`Set "${preset.name}" as middle logo`);
                        }}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                        title={preset.name}
                      >
                        <div className="w-7 h-7 flex items-center justify-center">
                          <img src={preset.svg} alt={preset.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-full">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logo Settings Controls */}
              {config.logoUrl && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Logo Size: {config.logoSize}px</label>
                      <span className="text-[11px] font-semibold text-slate-400">({Math.round((config.logoSize / 300) * 100)}% of QR)</span>
                    </div>
                    <input
                      type="range"
                      min="36"
                      max="96"
                      step="4"
                      value={config.logoSize}
                      onChange={(e) => setConfig(prev => ({ ...prev, logoSize: Number(e.target.value) }))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={config.excavateLogo}
                        onChange={(e) => setConfig(prev => ({ ...prev, excavateLogo: e.target.checked }))}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Excavate Modules</span>
                        <span className="text-[11px] text-slate-500">Clears background dots behind the logo for clarity</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Colors, Correction & Margin Styling */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Palette size={19} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Color & Styling</h3>
                  <p className="text-xs text-slate-500 font-medium">Fine-tune QR code appearance, contrast, and error correction</p>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className={labelClasses}>Curated Color Palettes</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {COLOR_PRESETS.map((p) => {
                    const isSelected = config.fgColor.toLowerCase() === p.fg.toLowerCase() && config.bgColor.toLowerCase() === p.bg.toLowerCase();
                    return (
                      <button
                        key={p.name}
                        onClick={() => setConfig(prev => ({ ...prev, fgColor: p.fg, bgColor: p.bg }))}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-lg border border-slate-200 shrink-0" style={{ backgroundColor: p.fg }} />
                        <span className="text-xs font-bold text-slate-700 truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>QR Dots (Foreground)</label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="color"
                      value={config.fgColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, fgColor: e.target.value }))}
                      className="w-9 h-9 rounded-lg border-none cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.fgColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, fgColor: e.target.value }))}
                      className="w-full text-xs font-mono font-bold uppercase bg-transparent outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Background Color</label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="color"
                      value={config.bgColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, bgColor: e.target.value }))}
                      className="w-9 h-9 rounded-lg border-none cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.bgColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, bgColor: e.target.value }))}
                      className="w-full text-xs font-mono font-bold uppercase bg-transparent outline-none text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Error Correction & Margin Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className={labelClasses}>Error Correction Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['L', 'M', 'Q', 'H'] as const).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setConfig(prev => ({ ...prev, level: lvl }))}
                        className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          config.level === lvl
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {lvl} {lvl === 'H' && '★'}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400 font-medium">
                    {config.level === 'H' ? 'Level H (30%) - Best for center logos' : `Level ${config.level} error correction`}
                  </p>
                </div>

                <div>
                  <label className={labelClasses}>Quiet Zone (Margin)</label>
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer h-[38px]">
                    <input
                      type="checkbox"
                      checked={config.margin}
                      onChange={(e) => setConfig(prev => ({ ...prev, margin: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700">Include outer margin for scan reliability</span>
                  </label>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Sticky Live Preview & Action Hub */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md flex flex-col items-center">
                
                {/* Header of Preview */}
                <div className="w-full flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Live Preview</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                      title="Copy QR raw payload"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setConfig({
                          fgColor: '#000000',
                          bgColor: '#ffffff',
                          level: 'H',
                          size: 320,
                          margin: true,
                          logoSize: 64,
                          excavateLogo: true,
                          logoUrl: PRESET_LOGOS[0].svg,
                        });
                        showToast('Reset styling to default', 'info');
                      }}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                      title="Reset Styling"
                    >
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                </div>

                {/* QR Canvas Display Container */}
                <div 
                  ref={qrRef}
                  className="p-6 rounded-3xl border border-slate-200/90 shadow-inner flex items-center justify-center aspect-square w-full max-w-[320px] transition-colors"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <QRCodeCanvas
                    value={qrValue || ' '}
                    size={config.size}
                    level={config.level}
                    bgColor={config.bgColor}
                    fgColor={config.fgColor}
                    includeMargin={config.margin}
                    imageSettings={config.logoUrl ? {
                      src: config.logoUrl,
                      height: config.logoSize,
                      width: config.logoSize,
                      excavate: config.excavateLogo,
                    } : undefined}
                  />
                </div>

                {/* Logo badge indicator */}
                {config.logoUrl && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[11px] font-bold text-indigo-700">
                    <Check size={13} className="text-indigo-600" />
                    <span>Logo centered with 30% error recovery</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="w-full space-y-3 mt-6">
                  <button
                    onClick={() => downloadPNG(3)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl font-black text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
                  >
                    <Download size={18} />
                    Download High-Res PNG (1000px+)
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={copyImageToClipboard}
                      className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-2xl font-bold text-xs transition-all cursor-pointer"
                    >
                      <Copy size={15} />
                      Copy Image
                    </button>

                    <button
                      onClick={() => downloadPNG(1)}
                      className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-2xl font-bold text-xs transition-all cursor-pointer"
                    >
                      <Download size={15} />
                      Standard PNG
                    </button>
                  </div>
                </div>

                {/* Scanned Payload Diagnostic */}
                <div className="w-full mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Scanned Payload</span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">{activeType}</span>
                  </div>
                  <p className="text-xs font-mono text-slate-700 break-all line-clamp-3 leading-relaxed">
                    {qrValue || '(Waiting for input...)'}
                  </p>
                </div>

              </div>

              {/* Scan tips card */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={14} />
                </div>
                <div className="text-xs text-indigo-950 leading-relaxed">
                  <span className="font-bold block text-indigo-900 mb-0.5">Ready for Print & Screen</span>
                  All generated QR codes adhere to ISO/IEC 18004 standards and can be scanned by iOS Camera, Android Google Lens, and barcode readers.
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 px-6 lg:px-10 text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">QR Gen Studio</span>
            <span>•</span>
            <span>Multiple QR types with center logos</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client-side secure rendering</span>
            <span>•</span>
            <span>High-resolution export</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
