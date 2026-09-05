// src/features/shop-setup/components/ShopInfoForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, ArrowRight } from 'lucide-react';
import { shopSchemaWithRefinements } from '../validations/setupSchemas';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '../../../tauri/commands';

const CURRENCIES = [
  { value: 'PKR', label: 'PKR - Pakistani Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
];

const ShopInfoForm = ({ defaultValues, onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(shopSchemaWithRefinements),
    defaultValues: {
      shopName: defaultValues.shopName || '',
      ownerName: defaultValues.ownerName || '',
      phone: defaultValues.phone || '',
      address: defaultValues.address || '',
      currency: defaultValues.currency || 'PKR',
      logoPath: defaultValues.logoPath || '',
    },
  });

  const logoPath = watch('logoPath');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (logoPath) {
      invoke('read_logo_file', { path: logoPath })
        .then((bytes) => {
          if (bytes && bytes.length > 0) {
            const extension = logoPath.split('.').pop().toLowerCase();
            const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
            const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
            const url = URL.createObjectURL(blob);
            if (isMounted) {
              setLogoPreviewUrl(url);
            }
          }
        })
        .catch((err) => {
          console.error('Error reading logo file for preview:', err);
        });
    } else {
      setLogoPreviewUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [logoPath]);

  const handleLogoPick = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Image',
          extensions: ['png', 'jpg', 'jpeg']
        }]
      });

      if (selected) {
        // Call Rust command to save the logo permanently to the app data directory
        const savedPath = await invoke('save_logo', { sourcePath: selected });
        setValue('logoPath', savedPath);
      }
    } catch (error) {
      console.error('Error selecting logo:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-2 rounded-lg">
          <Store className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Shop Information</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Shop Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Shop Name *
          </label>
          <input
            type="text"
            {...register('shopName')}
            placeholder="e.g. Muhammad's Store"
            className={`w-full bg-slate-50 border text-slate-900 placeholder-slate-400 
              text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 
              transition-all
              ${errors.shopName
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            autoFocus
          />
          {errors.shopName && (
            <p className="text-red-500 text-[11px] mt-1">{errors.shopName.message}</p>
          )}
        </div>

        {/* Owner Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Owner Name *
          </label>
          <input
            type="text"
            {...register('ownerName')}
            placeholder="Full legal name"
            className={`w-full bg-slate-50 border text-slate-900 placeholder-slate-400 
              text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 
              transition-all
              ${errors.ownerName
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
          />
          {errors.ownerName && (
            <p className="text-red-500 text-[11px] mt-1">{errors.ownerName.message}</p>
          )}
        </div>
      </div>

      {/* Address - Full Width */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Address
        </label>
        <input
          type="text"
          {...register('address')}
          placeholder="Shop address (optional)"
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 
            placeholder-slate-400 text-sm rounded-xl px-4 py-3 
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Phone
          </label>
          <input
            type="text"
            {...register('phone')}
            placeholder="0300-1234567"
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 
              placeholder-slate-400 text-sm rounded-xl px-4 py-3 
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Currency
          </label>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 
                  text-sm rounded-xl px-4 py-3 cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      {/* Shop Logo */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-tight">
          Shop Logo
        </label>

        <div className="group relative flex items-center gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-orange-200">
          {/* Preview */}
          <div className="relative flex-shrink-0">
            {logoPreviewUrl ? (
              <div className="relative">
                <img
                  src={logoPreviewUrl}
                  alt="Shop Logo Preview"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-orange-100 shadow-sm"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-orange-300 text-3xl mb-1">🖼️</div>
                  <span className="text-[10px] font-medium text-orange-400 tracking-widest uppercase">LOGO</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={handleLogoPick}
              className="px-6 py-3 bg-[#f97316] hover:bg-orange-600 text-white font-semibold text-sm rounded-2xl transition-all duration-200 active:scale-[0.985] shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {logoPath ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v-4m0 0v-4m0 4h16" />
                  </svg>
                  Change Logo
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Logo
                </>
              )}
            </button>

            <p className="text-slate-400 text-xs mt-2.5">
              PNG, JPG or JPEG • Recommended: 512×512px or larger
            </p>
          </div>

          {/* Status Badge */}
          {logoPreviewUrl && (
            <div className="absolute top-5 right-5 text-xs font-medium px-3 py-1 bg-orange-50 text-[#f97316] rounded-full ring-1 ring-orange-100/80">
              ✓ Ready
            </div>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold 
          py-3.5 rounded-2xl flex items-center justify-center gap-2 
          shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
};

export default ShopInfoForm;