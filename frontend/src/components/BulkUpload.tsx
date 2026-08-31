import React, { useState, useRef } from 'react';
import { FileSpreadsheet, X, Upload, CheckCircle2, AlertCircle, Loader2, Check } from 'lucide-react';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

export const BulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = ['name', 'sku', 'price', 'original_price', 'category_id', 'stock', 'description', 'features', 'image_url', 'amazon_url', 'flipkart_url', 'myntra_url', 'ajio_url'];
    const example = ['Priority Backpack', 'PB-EXAMPLE-001', '1999', '2499', '', '25', 'Replace this row with the complete product description', 'Padded laptop sleeve|Water-resistant fabric', 'https://', '', '', '', ''];
    const csv = `${headers.join(',')}\n${example.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')}\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'priority-bags-product-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')) {
        setFile(f);
        setStatus('idle');
        setErrorMsg('');
      } else {
        alert('Please select a valid Excel or CSV file.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.bulkUpload(formData);
      setResult({ count: res.count });
      setStatus('success');
      setFile(null);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to process the Excel file. Please ensure columns match the template.');
    }
  };

  return (
    <div className="bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-main)] p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-xl font-black text-[var(--color-text-main)] uppercase tracking-tight">Bulk Product Import</h3>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Upload Excel / CSV to update inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-[10px] font-black uppercase tracking-widest text-priority-blue hover:underline"
            onClick={downloadTemplate}
          >
            Download Template
          </button>
        </div>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-300 ${
          status === 'uploading' ? 'border-priority-blue bg-priority-blue/5' :
          status === 'success' ? 'border-green-500 bg-green-50' :
          status === 'error' ? 'border-red-500 bg-red-50' :
          'border-[var(--color-border-main)] hover:border-priority-blue/50'
        }`}
      >
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400">
                <FileSpreadsheet size={40} />
              </div>
              <div>
                <p className="text-sm font-black text-[var(--color-text-main)]">
                  {file ? file.name : 'Drop your Excel file here'}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Supports .xlsx, .xls, and .csv formats</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => inputRef.current?.click()}
                  className="bg-white border border-[var(--color-border-main)] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Browse File
                </button>
                {file && (
                  <button 
                    onClick={handleUpload}
                    className="bg-priority-blue text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-priority-blue/20 hover:scale-105 transition-all"
                  >
                    Start Upload
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {status === 'uploading' && (
            <motion.div 
              key="uploading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="relative">
                <Loader2 size={60} className="animate-spin text-priority-blue" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload size={20} className="text-priority-blue animate-bounce" />
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-[#14052b]">Processing Data...</p>
                <p className="text-[11px] text-gray-400 mt-1">Syncing with Supabase Inventory</p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <p className="text-sm font-black text-green-900">Success!</p>
                <p className="text-[11px] text-green-700/60 mt-1">{result?.count} products were imported as drafts for review.</p>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="bg-green-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Upload More
              </button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertCircle size={40} />
              </div>
              <div>
                <p className="text-sm font-black text-red-900">Upload Failed</p>
                <p className="text-[11px] text-red-700/60 mt-1 max-w-xs">{errorMsg}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStatus('idle')}
                  className="bg-red-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input 
        ref={inputRef}
        type="file" 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
        onChange={handleFileSelect} 
      />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#14052b] mb-4">Required Columns</p>
          <div className="space-y-2">
            {['name', 'price', 'category_id', 'stock'].map(col => (
              <div key={col} className="flex items-center gap-2">
                <Check size={12} className="text-green-500" />
                <span className="text-xs font-bold text-gray-500">{col}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#14052b] mb-4">Optional Fields</p>
          <div className="grid grid-cols-2 gap-2">
            {['description', 'features', 'image_url', 'amazon_url', 'flipkart_url', 'myntra_url', 'ajio_url', 'is_premium', 'original_price'].map(col => (
               <div key={col} className="flex items-center gap-2">
                 <div className="w-1 h-1 bg-gray-300 rounded-full" />
                 <span className="text-[10px] font-medium text-gray-400">{col}</span>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
