// src/features/receipts/components/PaymentReceipt.jsx
import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, Image as ImageIcon, Loader2, ShieldCheck, Receipt, Fingerprint, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import { invoke } from '../../../tauri/commands';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs';
import { toPng } from 'html-to-image';
import { settingsService } from '../../settings/services/settingsService';

const PaymentReceipt = ({ paymentData, isOpen, onClose }) => {
    const receiptRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [shopInfo, setShopInfo] = useState(null);
    const [receiptSettings, setReceiptSettings] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);

    const loadSettings = async () => {
        try {
            const [settings, receipt] = await Promise.all([
                invoke('get_shop_settings'),
                settingsService.getReceiptSettings(),
            ]);
            setShopInfo(settings);
            setReceiptSettings(receipt || {});
        } catch (err) {
            console.error('Failed to load settings:', err);
        }
    };

    if (!isOpen || !paymentData) return null;

    // Apply receipt settings
    const showShopName = receiptSettings?.show_shop_name !== false;
    const showOwnerName = receiptSettings?.show_owner_name !== false;
    const showPhone = receiptSettings?.show_phone !== false;
    const showAddress = receiptSettings?.show_address !== false;
    const showCustomer = receiptSettings?.show_customer !== false;
    const showInvoiceNumber = receiptSettings?.show_invoice_number !== false;
    const showPaymentInfo = receiptSettings?.show_payment_info !== false;
    const footerText = receiptSettings?.footer_text || 'Thank you for your business!';

    const shopName = shopInfo?.shop_name || 'DIGITAL DUKAAN';
    const shopAddress = shopInfo?.address || '';
    const shopPhone = shopInfo?.phone || '';
    const ownerName = shopInfo?.owner_name || '';

    const isReceived = paymentData.payment_type === 'received' || paymentData.payment_type === 'customer';
    const paymentLabel = isReceived ? 'PAYMENT RECEIVED' : 'PAYMENT MADE';
    const entityLabel = isReceived ? 'Received From' : 'Paid To';
    const amountColor = isReceived ? 'text-emerald-600' : 'text-red-600';
    const amountPrefix = isReceived ? '+' : '-';
    const headerBgColor = isReceived ? 'bg-emerald-600' : 'bg-red-600';
    const headerBorderColor = isReceived ? '#10b981' : '#ef4444';

    // Print - Full detailed invoice with settings applied
    const handlePrint = () => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const formattedDate = new Date(paymentData.payment_date || paymentData.created_at).toLocaleDateString('en-GB');
        const formattedTime = new Date(paymentData.payment_date || paymentData.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Build header parts based on settings
        const headerParts = [];
        if (showShopName) headerParts.push(`<h1>${shopName}</h1>`);
        if (showOwnerName && ownerName) headerParts.push(`<p>Owner: ${ownerName}</p>`);
        if (showAddress && shopAddress) headerParts.push(`<p>${shopAddress}</p>`);
        if (showPhone && shopPhone) headerParts.push(`<p>Tel: ${shopPhone}</p>`);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Payment Receipt - ${paymentData.payment_number}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                        
                        @page { margin: 10mm; size: A4; }
                        
                        body { 
                            font-family: 'Inter', system-ui, sans-serif; 
                            color: #0f172a; 
                            margin: 0; 
                            padding: 0; 
                            background: white; 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact; 
                        }
                        
                        .tabular { font-variant-numeric: tabular-nums; }
                        .right { text-align: right; }
                        .bold { font-weight: 700; color: #0f172a; }

                        .header { 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: flex-start; 
                            padding-bottom: 12px; 
                            border-bottom: 2px solid ${headerBorderColor}; 
                            margin-bottom: 16px; 
                        }
                        .brand h1 { margin: 0 0 2px 0; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; }
                        .brand p { margin: 0; color: #64748b; font-size: 10px; line-height: 1.4; }
                        .title h2 { margin: 0 0 2px 0; font-size: 18px; font-weight: 800; color: ${headerBorderColor}; letter-spacing: 1px; }
                        .title p { margin: 0; font-size: 11px; font-weight: 600; color: #475569; }

                        .meta-grid { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            background: #f8fafc; 
                            border-left: 3px solid ${headerBorderColor}; 
                            padding: 10px 16px; 
                            border-radius: 4px; 
                            margin-bottom: 20px; 
                        }
                        .meta-col h3 { margin: 0 0 4px 0; font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
                        .meta-col .primary { display: block; font-size: 12px; font-weight: 700; color: #0f172a; }
                        .meta-col .secondary { display: block; font-size: 10px; color: #64748b; font-weight: 500; margin-top: 2px; }

                        .payment-amount { 
                            text-align: center; 
                            padding: 30px 20px; 
                            background: ${isReceived ? '#f0fdf4' : '#fef2f2'}; 
                            border-radius: 8px; 
                            margin-bottom: 20px; 
                        }
                        .payment-amount .amount { 
                            font-size: 32px; 
                            font-weight: 800; 
                            color: ${headerBorderColor}; 
                            margin: 0; 
                        }
                        .payment-amount .status { 
                            display: inline-block; 
                            margin-top: 8px; 
                            padding: 4px 12px; 
                            background: ${headerBorderColor}; 
                            color: white; 
                            border-radius: 20px; 
                            font-size: 10px; 
                            font-weight: 600; 
                        }

                        .breakdown { 
                            background: #f8fafc; 
                            border-radius: 8px; 
                            padding: 16px; 
                            margin-bottom: 20px; 
                        }
                        .breakdown-row { 
                            display: flex; 
                            justify-content: space-between; 
                            padding: 6px 0; 
                            font-size: 11px; 
                            color: #475569; 
                        }
                        .breakdown-row.total { 
                            border-top: 1px solid #cbd5e1; 
                            margin-top: 4px; 
                            padding-top: 10px; 
                            font-weight: 700; 
                            color: #0f172a; 
                        }

                        .footer { 
                            text-align: center; 
                            border-top: 1px solid #e2e8f0; 
                            padding-top: 12px; 
                            color: #94a3b8; 
                            font-size: 9px; 
                        }
                        .footer p { margin: 2px 0; }
                        .footer strong { color: #64748b; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="brand">
                            ${headerParts.join('') || '<h1>PAYMENT RECEIPT</h1>'}
                        </div>
                        ${showInvoiceNumber ? `
                        <div class="title right">
                            <h2>${paymentLabel}</h2>
                            <p>#${paymentData.payment_number}</p>
                        </div>` : ''}
                    </div>
                    
                    <div class="meta-grid">
                        ${showCustomer ? `
                        <div class="meta-col">
                            <h3>${entityLabel}</h3>
                            <span class="primary">${paymentData.entity_name || '—'}</span>
                            <span class="secondary">${paymentData.entity_phone || '—'}</span>
                        </div>` : ''}
                        <div class="meta-col right">
                            <h3>Payment Details</h3>
                            <span class="primary">${formattedDate} ${formattedTime}</span>
                            <span class="secondary">${paymentData.payment_method} Payment</span>
                        </div>
                    </div>

                    ${showPaymentInfo ? `
                    <div class="payment-amount">
                        <p class="amount">${amountPrefix} ${formatCurrency(paymentData.amount)}</p>
                        <span class="status">✓ COMPLETED</span>
                    </div>

                    <div class="breakdown">
                        <div class="breakdown-row">
                            <span>Previous Due</span>
                            <span class="bold">${formatCurrency(paymentData.previous_due || 0)}</span>
                        </div>
                        <div class="breakdown-row">
                            <span>Amount Paid</span>
                            <span class="bold" style="color: ${headerBorderColor};">-${formatCurrency(paymentData.amount)}</span>
                        </div>
                        <div class="breakdown-row total">
                            <span>Remaining Due</span>
                            <span style="color: ${(paymentData.remaining_due || 0) > 0 ? '#ef4444' : '#10b981'};">${formatCurrency(paymentData.remaining_due || 0)}</span>
                        </div>
                    </div>` : ''}

                    <div class="footer">
                        <p>${footerText}</p>
                        <p>Recorded by: <strong>${paymentData.created_by || '—'}</strong></p>
                    </div>
                </body>
            </html>
        `;

        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 250);
    };

    // Text export with settings applied
    const handleDownloadText = async () => {
        try {
            setIsExporting(true);

            let text = '';
            text += '========================================\n';
            if (showShopName) text += `        ${shopName.padEnd(32).slice(0, 32)}\n`;
            if (showOwnerName && ownerName) text += `      Owner: ${ownerName.padEnd(25).slice(0, 25)}\n`;
            if (showAddress && shopAddress) text += `      ${shopAddress.padEnd(32).slice(0, 32)}\n`;
            if (showPhone && shopPhone) text += `      Tel: ${shopPhone}\n`;
            text += '========================================\n\n';
            text += `         ${paymentLabel}\n\n`;
            
            if (showInvoiceNumber) {
                text += `Receipt #:  ${paymentData.payment_number}\n`;
            }
            text += `Date:       ${new Date(paymentData.payment_date || paymentData.created_at).toLocaleString()}\n`;
            
            if (showCustomer) {
                text += `${entityLabel}: ${paymentData.entity_name || '—'}\n`;
                text += `Contact:    ${paymentData.entity_phone || '—'}\n`;
            }
            
            if (showPaymentInfo) {
                text += '----------------------------------------\n';
                text += `Previous Due:    ${formatCurrency(paymentData.previous_due || 0).padStart(23)}\n`;
                text += `AMOUNT PAID:     ${amountPrefix}${formatCurrency(paymentData.amount).padStart(22)}\n`;
                text += `Remaining Due:   ${formatCurrency(paymentData.remaining_due || 0).padStart(23)}\n`;
                text += `Method:          ${paymentData.payment_method.padStart(23)}\n`;
                text += '----------------------------------------\n';
            }
            
            text += `\n      ${footerText}\n`;
            text += `      Recorded by: ${paymentData.created_by || '—'}\n`;
            text += '========================================\n';

            const filePath = await save({
                title: 'Save Payment Receipt as Text',
                defaultPath: `Payment_${paymentData.payment_number}.txt`,
                filters: [{ name: 'Text Document', extensions: ['txt'] }]
            });

            if (filePath) {
                await writeTextFile(filePath, text);
            }
        } catch (err) {
            console.error('Failed to download text receipt:', err);
        } finally {
            setIsExporting(false);
        }
    };

    // Image capture (unchanged, uses receiptRef which already respects settings)
    const handleDownloadImage = async () => {
        if (!receiptRef.current) return;

        try {
            setIsExporting(true);
            const dataUrl = await toPng(receiptRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 4,
                style: {
                    boxShadow: 'none',
                    transform: 'none',
                    margin: '0'
                }
            });

            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            const binaryString = window.atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
            let hours = now.getHours();
            const minutes = pad(now.getMinutes());
            const seconds = pad(now.getSeconds());
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const time = `${pad(hours)}-${minutes}-${seconds}-${ampm}`;

            const filePath = await save({
                title: 'Save Payment Receipt as Image',
                defaultPath: `Payment_${paymentData.payment_number}_${date}_${time}.png`,
                filters: [{ name: 'Image', extensions: ['png'] }]
            });

            if (filePath) {
                await writeFile(filePath, bytes);
            }
        } catch (err) {
            console.error('Failed to save image receipt:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
                onClick={onClose}
            />

            <div className="relative bg-zinc-50 rounded-[24px] shadow-[0_0_80px_rgba(0,0,0,0.4)] w-full max-w-[420px] max-h-[95vh] flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 slide-in-from-bottom-4">

                <div className={`flex items-center justify-between px-5 py-4 ${headerBgColor} text-white shrink-0 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
                            {isReceived ? <ArrowUpRight size={18} strokeWidth={2} className="text-white" /> : <ArrowDownRight size={18} strokeWidth={2} className="text-white" />}
                        </div>
                        <div>
                            <h2 className="text-[14px] font-bold tracking-tight text-white">{paymentLabel}</h2>
                            {showInvoiceNumber && <p className="text-[10px] text-white/80 font-medium tracking-wide uppercase mt-0.5">Ref: {paymentData.payment_number}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white/90 hover:text-white flex items-center justify-center transition-all duration-200"
                    >
                        <X size={16} strokeWidth={2} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-100/50 p-4 flex flex-col items-center">

                    <div
                        ref={receiptRef}
                        className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 w-full border border-zinc-200/60 relative overflow-hidden box-border"
                    >
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${headerBgColor}`}></div>

                        <div className="text-center pb-4">
                            <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full ${isReceived ? 'bg-emerald-600/10 text-emerald-600' : 'bg-red-600/10 text-red-600'} text-[9px] font-bold tracking-widest uppercase mb-3 border ${isReceived ? 'border-emerald-600/20' : 'border-red-600/20'}`}>
                                <ShieldCheck size={12} strokeWidth={2} /> Verified
                            </div>
                            
                            {showShopName && <h3 className="text-xl font-black text-zinc-950 tracking-tighter uppercase mb-1">{shopName}</h3>}
                            {showOwnerName && ownerName && <p className="text-[10px] text-zinc-500 font-medium mb-0.5">Owner: {ownerName}</p>}
                            {showAddress && shopAddress && <p className="text-[10px] text-zinc-500 max-w-[240px] mx-auto leading-relaxed">{shopAddress}</p>}
                            {showPhone && shopPhone && <p className="text-[10px] text-zinc-500 font-medium mt-0.5">TEL: {shopPhone}</p>}
                        </div>

                        <div className="h-px w-full bg-[length:6px_1px] bg-[linear-gradient(to_right,#e4e4e7_50%,transparent_50%)] mb-4"></div>

                        {showCustomer && (
                            <div className="grid grid-cols-2 gap-y-2 gap-x-2 mb-4 text-[10px]">
                                {showInvoiceNumber && (
                                    <div>
                                        <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Receipt No.</p>
                                        <p className="font-semibold text-zinc-900">{paymentData.payment_number}</p>
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Date & Time</p>
                                    <p className="font-semibold text-zinc-900">{new Date(paymentData.payment_date || paymentData.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">{entityLabel}</p>
                                    <p className="font-semibold text-zinc-900">{paymentData.entity_name || '—'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Payment Method</p>
                                    <p className="font-semibold text-zinc-900 uppercase">{paymentData.payment_method}</p>
                                </div>
                            </div>
                        )}

                        {showPaymentInfo && (
                            <>
                                {/* Payment Amount Display */}
                                <div className={`mb-4 p-3 rounded-xl text-center ${isReceived ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                                    <p className={`text-xl font-black ${amountColor} tracking-tight`}>
                                        {amountPrefix} {formatCurrency(paymentData.amount)}
                                    </p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${isReceived ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                        ✓ COMPLETED
                                    </span>
                                </div>

                                {/* Payment Breakdown */}
                                <div className="bg-zinc-50/80 rounded-xl p-3.5 border border-zinc-100 text-[10px] space-y-1.5">
                                    <div className="flex justify-between items-center text-zinc-600">
                                        <span>Previous Due</span>
                                        <span className="font-medium text-zinc-900">{formatCurrency(paymentData.previous_due || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-600">Amount Paid</span>
                                        <span className={`font-bold ${amountColor}`}>-{formatCurrency(paymentData.amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2 border-t border-zinc-200/80 mt-1">
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Remaining Due</span>
                                        <span className={`text-sm font-black ${(paymentData.remaining_due || 0) > 0 ? 'text-rose-500' : 'text-emerald-600'} tracking-tight leading-none`}>
                                            {formatCurrency(paymentData.remaining_due || 0)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        <img src="/images/shop_stamp.png" className='absolute left-1/4 bottom-30 -rotate-20 w-40 opacity-70' alt="Official Stamp" />

                        <div className="text-center pt-3 text-[9px] text-zinc-400 mt-4">
                            <p className="font-medium text-zinc-800 mb-0.5">{footerText}</p>
                            <div className="flex items-center justify-center gap-1 uppercase tracking-wide">
                                <Fingerprint size={10} strokeWidth={1.5} />
                                <span>Recorded by {paymentData.created_by || '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-white border-t border-zinc-200 shrink-0 grid grid-cols-3 gap-2 rounded-b-[24px]">
                    <button
                        onClick={handlePrint}
                        disabled={isExporting}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 ${headerBgColor} text-white text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all duration-200 shadow-md ${isReceived ? 'shadow-emerald-600/20' : 'shadow-red-600/20'} hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50`}
                        title="Print / Save as PDF"
                    >
                        <Printer size={14} strokeWidth={2} /> Print PDF
                    </button>

                    <button
                        onClick={handleDownloadImage}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={14} className="animate-spin text-zinc-400" /> : <ImageIcon size={14} strokeWidth={2} className="text-zinc-500" />}
                        Image
                    </button>

                    <button
                        onClick={handleDownloadText}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={14} className="animate-spin text-zinc-400" /> : <Download size={14} strokeWidth={2} className="text-zinc-500" />}
                        Text
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentReceipt;