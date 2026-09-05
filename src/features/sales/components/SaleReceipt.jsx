// src/features/receipts/components/SaleReceipt.jsx
import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, Image as ImageIcon, Loader2, ShieldCheck, Receipt, Fingerprint, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import { invoke } from '../../../tauri/commands';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs';
import { toPng } from 'html-to-image';
import { settingsService } from '../../settings/services/settingsService';

const SaleReceipt = ({ saleData, isOpen, onClose }) => {
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

    if (!isOpen || !saleData) return null;

    // Apply receipt settings
    const showShopName = receiptSettings?.show_shop_name !== false;
    const showOwnerName = receiptSettings?.show_owner_name !== false;
    const showPhone = receiptSettings?.show_phone !== false;
    const showAddress = receiptSettings?.show_address !== false;
    const showCustomer = receiptSettings?.show_customer !== false;
    const showInvoiceNumber = receiptSettings?.show_invoice_number !== false;
    const showPaymentInfo = receiptSettings?.show_payment_info !== false;
    const footerText = receiptSettings?.footer_text || 'Thank you for shopping with us!';

    const shopName = shopInfo?.shop_name || 'DIGITAL DUKAAN';
    const shopAddress = shopInfo?.address || '';
    const shopPhone = shopInfo?.phone || '';
    const ownerName = shopInfo?.owner_name || '';

    // Print - Full detailed invoice with settings applied
    const handlePrint = () => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const itemsHtml = (saleData.items || []).map(item => `
            <tr>
                <td class="desc">${item.product_name}</td>
                <td class="right tabular">${item.quantity}</td>
                <td class="right tabular">${formatCurrency(item.unit_sale_price || item.unit_price)}</td>
                <td class="right bold tabular">${formatCurrency(item.total_price)}</td>
            </tr>
        `).join('');

        const formattedDate = new Date(saleData.created_at).toLocaleDateString('en-GB');
        const formattedTime = new Date(saleData.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const headerParts = [];
        if (showShopName) headerParts.push(`<h1>${shopName}</h1>`);
        if (showOwnerName && ownerName) headerParts.push(`<p>Owner: ${ownerName}</p>`);
        if (showAddress && shopAddress) headerParts.push(`<p>${shopAddress}</p>`);
        if (showPhone && shopPhone) headerParts.push(`<p>Tel: ${shopPhone}</p>`);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Sale Receipt - ${saleData.sale_number}</title>
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
                            ${headerParts.join('') || '<h1>RECEIPT</h1>'}
                        </div>
                        ${showInvoiceNumber ? `
                        <div class="title right">
                            <h2>SALE RECEIPT</h2>
                            <p>#${saleData.sale_number}</p>
                        </div>` : ''}
                    </div>
                    
                    <div class="meta-grid">
                        ${showCustomer ? `
                        <div class="meta-col">
                            <h3>Customer</h3>
                            <span class="primary">${saleData.customer_name || 'Walk-in Customer'}</span>
                            <span class="secondary">${saleData.customer_phone || '—'}</span>
                        </div>` : ''}
                        <div class="meta-col right">
                            <h3>Sale Details</h3>
                            <span class="primary">${formattedDate} ${formattedTime}</span>
                            <span class="secondary">${saleData.payment_method} Payment</span>
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
                                <span class="bold">${formatCurrency(saleData.subtotal)}</span>
                            </div>
                            ${saleData.discount_amount > 0 ? `
                            <div class="row tabular">
                                <span>Discount</span>
                                <span class="bold">-${formatCurrency(saleData.discount_amount)}</span>
                            </div>` : ''}
                            
                            <div class="row grand tabular">
                                <span>Total</span>
                                <span class="val">${formatCurrency(saleData.total_amount)}</span>
                            </div>
                            
                            <div class="row paid tabular">
                                <span>Amount Paid</span>
                                <span class="bold">${formatCurrency(saleData.paid_amount)}</span>
                            </div>
                            <div class="row due tabular">
                                <span>Balance Due</span>
                                <span class="val">${formatCurrency(saleData.remaining_amount)}</span>
                            </div>
                        </div>
                    </div>` : ''}

                    <div class="footer">
                        <p>${footerText}</p>
                        <p>Served by: <strong>${saleData.created_by}</strong></p>
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
            text += '            SALE RECEIPT\n\n';
            
            if (showInvoiceNumber) {
                text += `Receipt #:  ${saleData.sale_number}\n`;
            }
            text += `Date:       ${new Date(saleData.created_at).toLocaleString()}\n`;
            
            if (showCustomer) {
                text += `Customer:   ${saleData.customer_name || 'Walk-in Customer'}\n`;
                text += `Contact:    ${saleData.customer_phone || '—'}\n`;
            }
            
            text += '----------------------------------------\n';
            text += 'Item          Qty    Rate    Amount\n';
            text += '----------------------------------------\n';
            (saleData.items || []).forEach(item => {
                const name = (item.product_name || '').padEnd(14).slice(0, 14);
                const qty = String(item.quantity || 0).padStart(4);
                const rate = String(item.unit_sale_price || item.unit_price || 0).padStart(7);
                const amount = String(item.total_price || 0).padStart(9);
                text += `${name} ${qty} ${rate} ${amount}\n`;
            });
            text += '----------------------------------------\n';
            
            if (showPaymentInfo) {
                text += `Subtotal:      ${formatCurrency(saleData.subtotal).padStart(23)}\n`;
                if (saleData.discount_amount > 0) {
                    text += `Discount:      -${formatCurrency(saleData.discount_amount).padStart(22)}\n`;
                }
                text += `TOTAL:         ${formatCurrency(saleData.total_amount).padStart(23)}\n`;
                text += `Paid:          ${formatCurrency(saleData.paid_amount).padStart(23)}\n`;
                text += `Due:           ${formatCurrency(saleData.remaining_amount).padStart(23)}\n`;
                text += `Method:        ${saleData.payment_method.padStart(23)}\n`;
                text += '----------------------------------------\n';
            }
            
            text += `\n      ${footerText}\n`;
            text += `      Served by: ${saleData.created_by}\n`;
            text += '========================================\n';

            const filePath = await save({
                title: 'Save Receipt as Text',
                defaultPath: `Sale_${saleData.sale_number}.txt`,
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

    // Image capture
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
                defaultPath: `Sale_${saleData.sale_number}_${date}_${time}.png`,
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

                <div className="flex items-center justify-between px-5 py-4 bg-[#f97315] text-white shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
                            <Receipt size={18} strokeWidth={2} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[14px] font-bold tracking-tight text-white">Sale Receipt</h2>
                            {showInvoiceNumber && <p className="text-[10px] text-white/80 font-medium tracking-wide uppercase mt-0.5">Ref: {saleData.sale_number}</p>}
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
                        // Compacted padding here (p-3 instead of p-5)
                        className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-3 w-full border border-zinc-200/60 relative overflow-hidden box-border"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#f97315]"></div>

                        {/* Compacted margins/padding (pb-2 instead of pb-4) */}
                        <div className="text-center pb-2">
                            <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-[#f97315]/10 text-[#f97315] text-[8px] font-bold tracking-widest uppercase mb-1.5 border border-[#f97315]/20">
                                <ShieldCheck size={10} strokeWidth={2} /> Verified
                            </div>
                            
                            {showShopName && <h3 className="text-lg font-black text-zinc-950 tracking-tighter uppercase mb-0.5">{shopName}</h3>}
                            {showOwnerName && ownerName && <p className="text-[10px] text-zinc-500 font-medium mb-0.5">Owner: {ownerName}</p>}
                            {showAddress && shopAddress && <p className="text-[10px] text-zinc-500 max-w-[240px] mx-auto leading-relaxed">{shopAddress}</p>}
                            {showPhone && shopPhone && <p className="text-[10px] text-zinc-500 font-medium mt-0.5">TEL: {shopPhone}</p>}
                        </div>

                        {/* Compacted margin (mb-2) */}
                        <div className="h-px w-full bg-[length:6px_1px] bg-[linear-gradient(to_right,#e4e4e7_50%,transparent_50%)] mb-2"></div>

                        {showCustomer && (
                            // Compacted gap and margin (gap-y-1, mb-2)
                            <div className="grid grid-cols-2 gap-y-1 gap-x-2 mb-2 text-[10px]">
                                {showInvoiceNumber && (
                                    <div>
                                        <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Invoice No.</p>
                                        <p className="font-semibold text-zinc-900">{saleData.sale_number}</p>
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Date & Time</p>
                                    <p className="font-semibold text-zinc-900">{new Date(saleData.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Customer</p>
                                    <p className="font-semibold text-zinc-900">{saleData.customer_name || 'Walk-in Customer'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-400 font-medium uppercase tracking-wider text-[8px] mb-0.5">Contact</p>
                                    <p className="font-semibold text-zinc-900">{saleData.customer_phone || '—'}</p>
                                </div>
                            </div>
                        )}

                        {/* Product List Items - Compacted pt-1, mb-2, py-0.5 */}
                        <div className="mb-2 border-t border-zinc-100 pt-1">
                            <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                    <ShoppingCart size={9} /> Items ({saleData.items?.length || 0})
                                </span>
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Amount</span>
                            </div>
                            {(saleData.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-0.5 border-b border-zinc-50 gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-semibold text-zinc-800 truncate leading-tight">{item.product_name}</p>
                                        <p className="text-[8px] text-zinc-500 leading-tight">
                                            {item.quantity} × {formatCurrency(item.unit_sale_price || item.unit_price)}
                                        </p>
                                    </div>
                                    <p className="text-[9px] font-bold text-zinc-900 shrink-0 whitespace-nowrap">{formatCurrency(item.total_price)}</p>
                                </div>
                            ))}
                        </div>

                        {showPaymentInfo && (
                            // Compacted payment box padding and space (p-2, space-y-0.5)
                            <div className="bg-zinc-50/80 rounded-xl p-2 border border-zinc-100 text-[10px] space-y-0.5 overflow-hidden relative ">
                                <div className="flex justify-between items-center text-zinc-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-zinc-900">{formatCurrency(saleData.subtotal)}</span>
                                </div>
                                {saleData.discount_amount > 0 && (
                                    <div className="flex justify-between items-center text-zinc-600">
                                        <span>Discount</span>
                                        <span className="font-medium text-emerald-600">-{formatCurrency(saleData.discount_amount)}</span>
                                    </div>
                                )}

                                {/* Compacted top border padding (pt-1) */}
                                <div className="flex justify-between items-end pt-1 border-t border-zinc-200/80 mt-0.5">
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total Amount</span>
                                    <span className="text-base font-black text-zinc-950 tracking-tight leading-none">{formatCurrency(saleData.total_amount)}</span>
                                </div>

                                <div className="pt-1 space-y-0.5 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500">Amount Paid</span>
                                        <span className="font-bold text-emerald-600">{formatCurrency(saleData.paid_amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500">Due Balance</span>
                                        <span className={`font-bold ${saleData.remaining_amount > 0 ? 'text-rose-500' : 'text-zinc-400'}`}>
                                            {formatCurrency(saleData.remaining_amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Adjusted Stamp Position so it doesn't overflow a smaller box */}
                                <img src="/images/shop_stamp.png" className='absolute left-1/4 bottom-0 -rotate-20 w-40 z-99 opacity-70 pointer-events-none' alt="Official Stamp" />

                                <div className="flex justify-between items-center pt-1 border-t border-zinc-200/80 mt-0.5 relative z-10">
                                    <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-semibold">Payment Mode</span>
                                    <span className="uppercase text-[9px] tracking-wide font-bold text-zinc-800">{saleData.payment_method}</span>
                                </div>
                            </div>
                        )}

                        {/* Compacted barcode margin and height (mt-2, h-4) */}
                        <div className="w-40 h-4 mx-auto mt-2 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(to right, #18181b, #18181b 2px, transparent 2px, transparent 4px, #18181b 4px, #18181b 5px, transparent 5px, transparent 8px, #18181b 8px, #18181b 11px, transparent 11px, transparent 14px)' }}></div>

                        {/* Compacted footer padding (pt-1.5) */}
                        <div className="text-center pt-1.5 text-[9px] text-zinc-400">
                            <p className="font-medium text-zinc-800 mb-0.5">{footerText}</p>
                            <div className="flex items-center justify-center gap-1 uppercase tracking-wide">
                                <Fingerprint size={10} strokeWidth={1.5} />
                                <span>Served by {saleData.created_by}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Action Buttons */}
                <div className="bg-white border-t border-zinc-200/60 p-4 shrink-0 flex items-center justify-between gap-3">
                    <button
                        onClick={handleDownloadText}
                        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-[13px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                    >
                        <Download size={16} /> Text
                    </button>
                    
                    <button
                        onClick={handleDownloadImage}
                        disabled={isExporting}
                        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-[13px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} 
                        Image
                    </button>
                    
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-[13px] bg-[#f97315] hover:bg-[#ea580c] text-white shadow-sm transition-colors"
                    >
                        <Printer size={16} /> Print
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SaleReceipt;