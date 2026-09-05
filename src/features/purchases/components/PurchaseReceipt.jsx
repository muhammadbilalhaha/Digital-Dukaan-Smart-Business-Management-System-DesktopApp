import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, Image as ImageIcon, Loader2, ShieldCheck, Receipt, Fingerprint, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import { invoke } from '../../../tauri/commands';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs';
import { toPng } from 'html-to-image';
import { settingsService } from '../../settings/services/settingsService';

const PurchaseReceipt = ({ purchaseData, isOpen, onClose }) => {
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

    if (!isOpen || !purchaseData) return null;

    // Apply receipt settings
    const showShopName = receiptSettings?.show_shop_name !== false;
    const showOwnerName = receiptSettings?.show_owner_name !== false;
    const showPhone = receiptSettings?.show_phone !== false;
    const showAddress = receiptSettings?.show_address !== false;
    const showSupplier = receiptSettings?.show_customer !== false; // Reuse customer setting for supplier
    const showInvoiceNumber = receiptSettings?.show_invoice_number !== false;
    const showPaymentInfo = receiptSettings?.show_payment_info !== false;
    const footerText = receiptSettings?.footer_text || 'Thank you for your business!';

    const shopName = shopInfo?.shop_name || 'DIGITAL DUKAAN';
    const shopAddress = shopInfo?.address || '';
    const shopPhone = shopInfo?.phone || '';
    const ownerName = shopInfo?.owner_name || '';

    // Print always generates the FULL detailed list
    const handlePrint = () => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const itemsHtml = (purchaseData.items || []).map(item => `
            <tr>
                <td class="desc">${item.product_name}</td>
                <td class="right tabular">${item.quantity}</td>
                <td class="right tabular">${formatCurrency(item.cost_price)}</td>
                <td class="right bold tabular">${formatCurrency(item.total_price)}</td>
            </tr>
        `).join('');

        const formattedDate = new Date(purchaseData.created_at).toLocaleDateString('en-GB');
        const formattedTime = new Date(purchaseData.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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
                    <title>Invoice - ${purchaseData.purchase_number}</title>
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
                            border-bottom: 2px solid #f97316; 
                            margin-bottom: 16px; 
                        }
                        .brand h1 { margin: 0 0 2px 0; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; }
                        .brand p { margin: 0; color: #64748b; font-size: 10px; line-height: 1.4; }
                        .title h2 { margin: 0 0 2px 0; font-size: 18px; font-weight: 800; color: #f97316; letter-spacing: 1px; }
                        .title p { margin: 0; font-size: 11px; font-weight: 600; color: #475569; }

                        .meta-grid { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            background: #f8fafc; 
                            border-left: 3px solid #f97316; 
                            padding: 10px 16px; 
                            border-radius: 4px; 
                            margin-bottom: 20px; 
                        }
                        .meta-col h3 { margin: 0 0 4px 0; font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
                        .meta-col .primary { display: block; font-size: 12px; font-weight: 700; color: #0f172a; }
                        .meta-col .secondary { display: block; font-size: 10px; color: #64748b; font-weight: 500; margin-top: 2px; }
                        
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th { 
                            padding: 6px 8px; 
                            font-size: 9px; 
                            color: #64748b; 
                            text-transform: uppercase; 
                            letter-spacing: 0.5px; 
                            border-bottom: 1px solid #cbd5e1; 
                            text-align: left;
                        }
                        th.right { text-align: right; }
                        td { 
                            padding: 6px 8px; 
                            font-size: 11px; 
                            color: #1e293b; 
                            border-bottom: 1px solid #f1f5f9; 
                            font-weight: 500; 
                        }
                        td.desc { color: #0f172a; font-weight: 600; }

                        .totals-wrapper { display: flex; justify-content: flex-end; margin-bottom: 30px; }
                        .totals-box { width: 240px; position: relative; }
                        
                        .stamp { 
                            position: absolute; 
                            top: 0px; 
                            left: 40px; 
                            transform: rotate(-15deg); 
                            width: 140px; 
                            opacity: 0.30; 
                            pointer-events: none; 
                            z-index: 999; 
                            mix-blend-mode: multiply; 
                        }
                        
                        .row { 
                            display: flex; 
                            justify-content: space-between; 
                            padding: 4px 8px; 
                            font-size: 11px; 
                            color: #475569; 
                            position: relative; 
                            z-index: 1; 
                        }
                        .row.grand { 
                            margin-top: 4px; 
                            padding: 8px; 
                            border-top: 1px solid #cbd5e1; 
                            border-bottom: 1px solid #cbd5e1; 
                            font-size: 13px; 
                            font-weight: 800; 
                            color: #0f172a; 
                            background: #f8fafc;
                        }
                        .row.grand .val { color: #f97316; }
                        .row.paid { margin-top: 4px; }
                        .row.due .val { color: #ef4444; font-weight: 700; }

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
                            ${headerParts.join('') || '<h1>PURCHASE INVOICE</h1>'}
                        </div>
                        ${showInvoiceNumber ? `
                        <div class="title right">
                            <h2>INVOICE</h2>
                            <p>#${purchaseData.purchase_number}</p>
                        </div>` : ''}
                    </div>
                    
                    <div class="meta-grid">
                        ${showSupplier ? `
                        <div class="meta-col">
                            <h3>Supplier</h3>
                            <span class="primary">${purchaseData.supplier_name}</span>
                            <span class="secondary">${purchaseData.supplier_phone || '—'}</span>
                        </div>` : ''}
                        <div class="meta-col right">
                            <h3>Invoice Details</h3>
                            <span class="primary">${formattedDate} ${formattedTime}</span>
                            <span class="secondary">${purchaseData.payment_method} Payment</span>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="right">Qty</th>
                                <th class="right">Rate</th>
                                <th class="right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    ${showPaymentInfo ? `
                    <div class="totals-wrapper">
                        <div class="totals-box">
                            <img src="/images/shop_stamp.png" class="stamp" alt="Official Stamp" />
                            
                            <div class="row tabular">
                                <span>Subtotal</span>
                                <span class="bold">${formatCurrency(purchaseData.subtotal)}</span>
                            </div>
                            ${purchaseData.extra_charges > 0 ? `
                            <div class="row tabular">
                                <span>Extra Charges</span>
                                <span class="bold">${formatCurrency(purchaseData.extra_charges)}</span>
                            </div>` : ''}
                            
                            <div class="row grand tabular">
                                <span>Total</span>
                                <span class="val">${formatCurrency(purchaseData.total_amount)}</span>
                            </div>
                            
                            <div class="row paid tabular">
                                <span>Amount Paid</span>
                                <span class="bold">${formatCurrency(purchaseData.paid_amount)}</span>
                            </div>
                            <div class="row due tabular">
                                <span>Balance Due</span>
                                <span class="val">${formatCurrency(purchaseData.remaining_amount)}</span>
                            </div>
                        </div>
                    </div>` : ''}

                    <div class="footer">
                        <p>${footerText}</p>
                        <p>Served by: <strong>${purchaseData.created_by}</strong></p>
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
            text += '            PURCHASE RECEIPT\n\n';
            
            if (showInvoiceNumber) {
                text += `Receipt #:  ${purchaseData.purchase_number}\n`;
            }
            text += `Date:       ${new Date(purchaseData.created_at).toLocaleString()}\n`;
            
            if (showSupplier) {
                text += `Supplier:   ${purchaseData.supplier_name}\n`;
                text += `Contact:    ${purchaseData.supplier_phone || '—'}\n`;
            }
            
            text += '----------------------------------------\n';
            text += 'Item          Qty    Rate    Amount\n';
            text += '----------------------------------------\n';
            (purchaseData.items || []).forEach(item => {
                text += `${item.product_name.padEnd(14).slice(0, 14)} ${String(item.quantity).padStart(4)} ${String(item.cost_price).padStart(7)} ${String(item.total_price).padStart(9)}\n`;
            });
            text += '----------------------------------------\n';
            
            if (showPaymentInfo) {
                text += `Subtotal:      ${formatCurrency(purchaseData.subtotal).padStart(23)}\n`;
                if (purchaseData.extra_charges > 0) {
                    text += `Extra Charges: ${formatCurrency(purchaseData.extra_charges).padStart(23)}\n`;
                }
                text += `TOTAL:         ${formatCurrency(purchaseData.total_amount).padStart(23)}\n`;
                text += `Paid:          ${formatCurrency(purchaseData.paid_amount).padStart(23)}\n`;
                text += `Due:           ${formatCurrency(purchaseData.remaining_amount).padStart(23)}\n`;
                text += `Method:        ${purchaseData.payment_method.padStart(23)}\n`;
                text += '----------------------------------------\n';
            }
            
            text += `\n      ${footerText}\n`;
            text += `      Served by: ${purchaseData.created_by}\n`;
            text += '========================================\n';

            const filePath = await save({
                title: 'Save Receipt as Text',
                defaultPath: `Receipt_${purchaseData.purchase_number}.txt`,
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
                title: 'Save Receipt as Image',
                defaultPath: `Receipt_${purchaseData.purchase_number}_${date}_${time}.png`,
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

                <div className="flex items-center justify-between px-5 py-4 bg-[#f97316] text-white shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
                            <Receipt size={18} strokeWidth={2} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[14px] font-bold tracking-tight text-white">Transaction Receipt</h2>
                            {showInvoiceNumber && <p className="text-[10px] text-white/80 font-medium tracking-wide uppercase mt-0.5">Ref: {purchaseData.purchase_number}</p>}
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
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#f97316]"></div>

                        <div className="text-center pb-4">
                            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/10 text-[#f97316] text-[9px] font-bold tracking-widest uppercase mb-3 border border-[#f97316]/20">
                                <ShieldCheck size={12} strokeWidth={2} /> Verified
                            </div>
                            
                            {showShopName && <h3 className="text-xl font-black text-zinc-950 tracking-tighter uppercase mb-1">{shopName}</h3>}
                            {showOwnerName && ownerName && <p className="text-[10px] text-zinc-500 font-medium mb-0.5">Owner: {ownerName}</p>}
                            {showAddress && shopAddress && <p className="text-[10px] text-zinc-500 max-w-[240px] mx-auto leading-relaxed">{shopAddress}</p>}
                            {showPhone && shopPhone && <p className="text-[10px] text-zinc-500 font-medium mt-0.5">TEL: {shopPhone}</p>}
                        </div>

                        <div className="h-px w-full bg-[length:6px_1px] bg-[linear-gradient(to_right,#e4e4e7_50%,transparent_50%)] mb-4"></div>

                        {showSupplier && (
                            <div className="grid grid-cols-2 gap-y-2 gap-x-2 mb-4 text-[10px]">
                                {showInvoiceNumber && (
                                    <div>
                                        <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Receipt No.</p>
                                        <p className="font-semibold text-zinc-900">{purchaseData.purchase_number}</p>
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Date & Time</p>
                                    <p className="font-semibold text-zinc-900">{new Date(purchaseData.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Supplier</p>
                                    <p className="font-semibold text-zinc-900">{purchaseData.supplier_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Contact</p>
                                    <p className="font-semibold text-zinc-900">{purchaseData.supplier_phone || '—'}</p>
                                </div>
                            </div>
                        )}

                        {/* Compact Items Summary */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                    <ShoppingCart size={9} /> Items ({purchaseData.items?.length || 0})
                                </span>
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Amount</span>
                            </div>
                            {(purchaseData.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-0.5 border-b border-zinc-50">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-[9px] font-semibold text-zinc-800 truncate">{item.product_name}</p>
                                        <p className="text-[8px] text-zinc-500">
                                            {item.quantity} × {formatCurrency(item.cost_price)}
                                        </p>
                                    </div>
                                    <p className="text-[9px] font-bold text-zinc-900 shrink-0">{formatCurrency(item.total_price)}</p>
                                </div>
                            ))}
                        </div>

                        {showPaymentInfo && (
                            <div className="bg-zinc-50/80 rounded-xl p-3.5 border border-zinc-100 text-[10px] space-y-1.5">
                                <div className="flex justify-between items-center text-zinc-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-zinc-900">{formatCurrency(purchaseData.subtotal)}</span>
                                </div>
                                {purchaseData.extra_charges > 0 && (
                                    <div className="flex justify-between items-center text-zinc-600">
                                        <span>Extra Charges</span>
                                        <span className="font-medium text-zinc-900">+{formatCurrency(purchaseData.extra_charges)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-end pt-2 border-t border-zinc-200/80 mt-1">
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total Amount</span>
                                    <span className="text-base font-black text-zinc-950 tracking-tight leading-none">{formatCurrency(purchaseData.total_amount)}</span>
                                </div>

                                <div className="pt-2 space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500">Amount Paid</span>
                                        <span className="font-bold text-[#f97316]">{formatCurrency(purchaseData.paid_amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500">Due Balance</span>
                                        <span className={`font-bold ${purchaseData.remaining_amount > 0 ? 'text-rose-500' : 'text-zinc-400'}`}>
                                            {formatCurrency(purchaseData.remaining_amount)}
                                        </span>
                                    </div>
                                </div>

                                <img src="/images/shop_stamp.png" className='absolute left-1/4 bottom-30 -rotate-20 w-40 opacity-70' alt="Official Stamp" />

                                <div className="flex justify-between items-center pt-2 border-t border-zinc-200/80 mt-1">
                                    <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-semibold">Payment Mode</span>
                                    <span className="uppercase text-[9px] tracking-wide font-bold text-zinc-800">{purchaseData.payment_method}</span>
                                </div>
                            </div>
                        )}

                        <div className="w-40 h-6 mx-auto mt-4 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(to right, #18181b, #18181b 2px, transparent 2px, transparent 4px, #18181b 4px, #18181b 5px, transparent 5px, transparent 8px, #18181b 8px, #18181b 11px, transparent 11px, transparent 14px)' }}></div>

                        <div className="text-center pt-3 text-[9px] text-zinc-400">
                            <p className="font-medium text-zinc-800 mb-0.5">{footerText}</p>
                            <div className="flex items-center justify-center gap-1 uppercase tracking-wide">
                                <Fingerprint size={10} strokeWidth={1.5} />
                                <span>Served by {purchaseData.created_by}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-white border-t border-zinc-200 shrink-0 grid grid-cols-3 gap-2 rounded-b-[24px]">
                    <button
                        onClick={handlePrint}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#f97315] hover:bg-[#ea580c] text-white text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all duration-200 shadow-md shadow-[#f97315]/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        title="Print / Save as PDF (Full Details)"
                    >
                        <Printer size={14} strokeWidth={2} /> Print PDF
                    </button>

                    <button
                        onClick={handleDownloadImage}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        title="Capture current view as Image"
                    >
                        {isExporting ? <Loader2 size={14} className="animate-spin text-zinc-400" /> : <ImageIcon size={14} strokeWidth={2} className="text-zinc-500" />}
                        Image
                    </button>

                    <button
                        onClick={handleDownloadText}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        title="Export Full Details as Text"
                    >
                        {isExporting ? <Loader2 size={14} className="animate-spin text-zinc-400" /> : <Download size={14} strokeWidth={2} className="text-zinc-500" />}
                        Text
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseReceipt;