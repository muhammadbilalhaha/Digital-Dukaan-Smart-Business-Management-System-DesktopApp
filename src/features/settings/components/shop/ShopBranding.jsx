// src/features/settings/components/shop/ShopBranding.jsx
import React, { useState, useEffect } from 'react';
import { Image, Trash2, Upload } from 'lucide-react';
import SaveButton from '../SaveButton';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '../../../../tauri/commands';

const ShopBranding = ({ data, onSave, isSaving }) => {
    const [logoPath, setLogoPath] = useState(data?.logo_path || '');
    const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    // Load logo preview when component mounts or logoPath changes
    useEffect(() => {
        let isMounted = true;
        
        const loadPreview = async () => {
            if (logoPath) {
                try {
                    const bytes = await invoke('read_logo_file', { path: logoPath });
                    if (bytes && bytes.length > 0 && isMounted) {
                        const extension = logoPath.split('.').pop().toLowerCase();
                        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
                        const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
                        const url = URL.createObjectURL(blob);
                        setLogoPreviewUrl(url);
                    }
                } catch (err) {
                    console.error('Error reading logo file for preview:', err);
                    if (isMounted) setLogoPreviewUrl(null);
                }
            } else {
                if (isMounted) setLogoPreviewUrl(null);
            }
        };

        loadPreview();

        return () => {
            isMounted = false;
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl);
            }
        };
    }, [logoPath]);

    // Handle logo selection using Tauri dialog
    const handleLogoChange = async () => {
        try {
            setIsUploading(true);
            
            // Open file picker dialog
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'Image',
                    extensions: ['png', 'jpg', 'jpeg']
                }]
            });

            if (selected) {
                // Call Rust command to save the logo permanently to app data directory
                const savedPath = await invoke('save_logo', { sourcePath: selected });
                console.log('Logo saved to:', savedPath);
                setLogoPath(savedPath);
            }
        } catch (error) {
            console.error('Error selecting logo:', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle logo removal
    const handleRemoveLogo = async () => {
        try {
            setIsRemoving(true);
            
            // Revoke preview URL if exists
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl);
            }
            
            // Clear logo path
            setLogoPath('');
            setLogoPreviewUrl(null);
            
            // Save empty logo path to backend
            await onSave?.({ 
                ...data,
                logo_path: null 
            });
        } catch (err) {
            console.error('Error removing logo:', err);
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-base font-bold text-text-primary">Shop Branding</h3>
                <p className="text-xs text-text-muted">Customize how your shop appears</p>
            </div>

            <div className="flex flex-col items-center py-8 bg-app-surface-alt/50 rounded-xl border border-border-light">
                {/* Logo Preview */}
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-border-light bg-card-bg flex items-center justify-center mb-4 overflow-hidden relative">
                    {logoPreviewUrl ? (
                        <>
                            <img 
                                src={logoPreviewUrl} 
                                alt="Shop Logo" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                        </>
                    ) : (
                        <div className="text-center">
                            <Image size={40} className="text-text-muted/40 mx-auto" />
                            <p className="text-[10px] font-medium text-text-muted/50 mt-1">No Logo</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button 
                        onClick={handleLogoChange} 
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#f67315] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-lg transition-all shadow-sm disabled:opacity-50"
                    >
                        <Upload size={14} className={isUploading ? 'animate-spin' : ''} />
                        {isUploading ? 'Uploading...' : logoPath ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    
                    {logoPath && (
                        <button 
                            onClick={handleRemoveLogo} 
                            disabled={isRemoving}
                            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                        >
                            <Trash2 size={14} />
                            {isRemoving ? 'Removing...' : 'Remove'}
                        </button>
                    )}
                </div>

                {/* Helper Text */}
                <p className="text-[10px] text-text-muted mt-3">
                    PNG, JPG or JPEG • Recommended: 512×512px or larger
                </p>
            </div>

            {/* Save Button (only show if there are unsaved changes) */}
            {logoPath !== data?.logo_path && (
                <div className="flex justify-end">
                    <SaveButton 
                        onClick={() => onSave?.({ 
                            ...data,
                            logo_path: logoPath || null 
                        })} 
                        isSaving={isSaving} 
                    />
                </div>
            )}
        </div>
    );
};

export default ShopBranding;