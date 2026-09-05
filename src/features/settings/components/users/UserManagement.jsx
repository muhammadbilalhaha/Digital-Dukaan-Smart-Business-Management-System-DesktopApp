// src/features/settings/components/users/UserManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, MoreVertical, Users, Edit, Key, Trash2, Loader2, X, Lock, Shield, ChevronDown } from 'lucide-react';
import AddUserModal from './AddUserModal';
import useUiStore from '../../../../store/ui.store';

// ═══════════════════════════════════════════════════════════
// Owner Verification Modal - Shows owner selection + PIN
// ═══════════════════════════════════════════════════════════
const OwnerVerificationModal = ({ isOpen, onClose, onVerify, onVerified, owners = [], title = 'Owner Verification' }) => {
    const [selectedOwnerId, setSelectedOwnerId] = useState('');
    const [pin, setPin] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError('');
            setIsVerifying(false);
            if (owners.length === 1) {
                setSelectedOwnerId(String(owners[0].id));
            } else {
                setSelectedOwnerId('');
            }
        }
    }, [isOpen, owners]);

    if (!isOpen) return null;

    const selectedOwner = owners.find(o => String(o.id) === String(selectedOwnerId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedOwnerId) {
            setError('Please select an owner');
            return;
        }

        if (pin.length !== 5) {
            setError('PIN must be exactly 5 digits');
            return;
        }

        setIsVerifying(true);
        try {
            const isValid = await onVerify(parseInt(selectedOwnerId), pin);
            if (isValid) {
                onClose();
                if (onVerified) onVerified();
            } else {
                setError('Invalid PIN');
                setPin('');
            }
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-border-light animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-5">
                    <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield size={24} className="text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                    <p className="text-xs text-text-muted mt-1">Owner permission required</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 animate-shake">
                        <p className="text-xs text-red-600 text-center font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {owners.length > 1 && (
                        <div>
                            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                                Select Owner
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedOwnerId}
                                    onChange={(e) => {
                                        setSelectedOwnerId(e.target.value);
                                        setPin('');
                                        setError('');
                                    }}
                                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-text-primary cursor-pointer appearance-none pr-10"
                                >
                                    <option value="">Select Owner...</option>
                                    {owners.map(owner => (
                                        <option key={owner.id} value={owner.id}>
                                            {owner.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {selectedOwner && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium text-center">
                                Verifying: <strong>{selectedOwner.name}</strong>
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 text-center">
                            Owner PIN (5 digits)
                        </label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setPin(value);
                                    if (error) setError('');
                                }
                            }}
                            className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            placeholder="•••••"
                            maxLength={5}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoFocus
                        />
                        {pin && pin.length < 5 && (
                            <p className="text-[10px] text-text-muted mt-1 text-center">
                                {pin.length}/5 digits
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isVerifying}
                            className="flex-1 px-4 py-2.5 border border-border-light text-text-secondary text-sm font-semibold rounded-xl hover:bg-app-surface-alt transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isVerifying || !selectedOwnerId || pin.length !== 5} 
                            className="flex-1 px-4 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm shadow-amber-600/20"
                        >
                            {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
                            {isVerifying ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// Edit User Modal
// ═══════════════════════════════════════════════════════════
const EditUserModal = ({ isOpen, onClose, onSubmit, user }) => {
    const [form, setForm] = useState({ name: '', role: 'worker' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            setForm({ 
                name: user.name || '', 
                role: user.role === 'owner' ? 'owner' : 'worker' 
            });
            setError('');
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name.trim()) {
            setError('Name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit?.(user.id, form);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border-light">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-text-primary">Edit User</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-text-primary cursor-pointer"
                        >
                            <option value="owner">Owner</option>
                            <option value="worker">Worker</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-light text-text-secondary text-sm font-semibold rounded-xl">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#f67315] text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// Change PIN Modal
// ═══════════════════════════════════════════════════════════
const ChangePinModal = ({ isOpen, onClose, onSubmit, user }) => {
    const [form, setForm] = useState({ pin: '', confirm_pin: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({ pin: '', confirm_pin: '' });
            setError('');
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.pin.length !== 5) {
            setError('PIN must be exactly 5 digits');
            return;
        }
        if (!/^\d{5}$/.test(form.pin)) {
            setError('PIN must contain only numbers');
            return;
        }
        if (form.pin !== form.confirm_pin) {
            setError('PINs do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit?.(user.id, form.pin);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to change PIN');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border-light">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-text-primary">Change PIN - {user.name}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">New PIN (5 digits)</label>
                        <input
                            type="password"
                            value={form.pin}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setForm(prev => ({ ...prev, pin: value }));
                                }
                            }}
                            className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-center tracking-[0.3em]"
                            placeholder="•••••"
                            maxLength={5}
                            inputMode="numeric"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Confirm New PIN</label>
                        <input
                            type="password"
                            value={form.confirm_pin}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setForm(prev => ({ ...prev, confirm_pin: value }));
                                }
                            }}
                            className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-center tracking-[0.3em]"
                            placeholder="•••••"
                            maxLength={5}
                            inputMode="numeric"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-light text-text-secondary text-sm font-semibold rounded-xl">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#f67315] text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                            Change PIN
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// Delete Confirmation Modal
// ═══════════════════════════════════════════════════════════
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, user }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !user) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm?.(user.id);
            onClose();
        } catch (err) {
            console.error('Failed to delete user:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-border-light">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Delete User?</h3>
                <p className="text-sm text-text-muted mb-6">
                    Are you sure you want to permanently delete <strong>{user.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-light text-text-secondary text-sm font-semibold rounded-xl">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// Main UserManagement Component
// ═══════════════════════════════════════════════════════════
const UserManagement = ({ 
    data = [], 
    onAddUser, 
    onEditUser, 
    onDeleteUser, 
    onChangePin,
    onVerifyOwnerPin,
}) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showOwnerVerification, setShowOwnerVerification] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const menuButtonRefs = useRef({});
    const { addToast } = useUiStore();
    
    const users = Array.isArray(data) ? data : [];
    
    // Get all active owners
    const owners = users.filter(u => u.role === 'owner' && u.is_active);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const menuButton = menuButtonRefs.current[menuOpen];
            const dropdown = document.getElementById(`user-menu-${menuOpen}`);
            
            if (menuButton && menuButton.contains(event.target)) return;
            if (dropdown && dropdown.contains(event.target)) return;
            
            setMenuOpen(null);
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const getRoleBadge = (role) => {
        if (role === 'owner') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    };

    const toggleMenu = (user, event) => {
        event.stopPropagation();
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        
        if (menuOpen === user.id) {
            setMenuOpen(null);
        } else {
            const menuWidth = 160;
            const menuHeight = 120;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let left = rect.right - menuWidth;
            let top = rect.bottom + 8;
            
            if (left < 0) left = 8;
            if (left + menuWidth > viewportWidth) left = viewportWidth - menuWidth - 8;
            if (top + menuHeight > viewportHeight) top = rect.top - menuHeight - 8;
            
            setMenuPosition({ top, left });
            setMenuOpen(user.id);
        }
    };

    // Owner Verification Flow
    const verifyOwnerPin = async (ownerId, pin) => {
        try {
            if (onVerifyOwnerPin) {
                const isValid = await onVerifyOwnerPin(ownerId, pin);
                return isValid;
            }
            return false;
        } catch (err) {
            console.error('Owner verification failed:', err);
            return false;
        }
    };

    const handleOwnerVerified = () => {
        setShowOwnerVerification(false);
        
        setTimeout(() => {
            if (pendingAction === 'add') {
                setShowAddModal(true);
            } else if (pendingAction === 'edit') {
                setShowEditModal(true);
            } else if (pendingAction === 'pin') {
                setShowPinModal(true);
            } else if (pendingAction === 'delete') {
                setShowDeleteModal(true);
            }
        }, 100);
    };

    // Action handlers - All require owner verification
    const handleAddClick = () => {
        setPendingAction('add');
        setShowOwnerVerification(true);
    };

    const handleEditUser = (user) => {
        setMenuOpen(null);
        setSelectedUser(user);
        setPendingAction('edit');
        setShowOwnerVerification(true);
    };

    const handleChangePin = (user) => {
        setMenuOpen(null);
        setSelectedUser(user);
        setPendingAction('pin');
        setShowOwnerVerification(true);
    };

    const handleDeleteUser = (user) => {
        setMenuOpen(null);
        setSelectedUser(user);
        setPendingAction('delete');
        setShowOwnerVerification(true);
    };

    // Submit handlers
    const handleAddUser = async (userData) => {
        try {
            if (onAddUser) {
                await onAddUser(userData);
                addToast({ type: 'success', title: 'User Created', message: `${userData.name} added successfully` });
            }
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to create user' });
            throw err;
        }
    };

    const handleEditSubmit = async (userId, formData) => {
        try {
            if (onEditUser) {
                await onEditUser(userId, formData);
                addToast({ type: 'success', title: 'User Updated', message: `${formData.name} updated successfully` });
            }
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to update user' });
            throw err;
        }
    };

    const handlePinSubmit = async (userId, newPin) => {
        try {
            if (onChangePin) {
                await onChangePin(userId, newPin);
                addToast({ type: 'success', title: 'PIN Changed', message: 'PIN updated successfully' });
            }
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to change PIN' });
            throw err;
        }
    };

    const handleDeleteConfirm = async (userId) => {
        try {
            if (onDeleteUser) {
                await onDeleteUser(userId);
                addToast({ type: 'success', title: 'User Deleted', message: 'User has been permanently deleted' });
                setShowDeleteModal(false);
                setSelectedUser(null);
            }
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to delete user' });
            throw err;
        }
    };

    const renderDropdown = (user) => {
        if (menuOpen !== user.id) return null;
        
        return createPortal(
            <div
                id={`user-menu-${user.id}`}
                className="fixed z-[100] bg-card-bg border border-border-light rounded-lg shadow-xl py-1 min-w-[160px]"
                style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={() => handleEditUser(user)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-app-surface-alt transition-colors">
                    <Edit size={12} /> Edit User
                </button>
                <button onClick={() => handleChangePin(user)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-app-surface-alt transition-colors">
                    <Key size={12} /> Change PIN
                </button>
                <div className="my-1 border-t border-border-light" />
                <button 
                    onClick={() => handleDeleteUser(user)} 
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={12} /> Delete User
                </button>
            </div>,
            document.body
        );
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-text-primary">Users</h3>
                    <p className="text-xs text-text-muted">Manage people who can access Digital Dukaan</p>
                </div>
                <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-[#f67315] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-xl transition-all shadow-sm">
                    <Plus size={14} /> Add User
                </button>
            </div>

            <div className="bg-app-surface-alt/50 rounded-xl border border-border-light">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-app-surface-alt text-text-muted uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">User</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Last Login</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-app-surface-alt/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-app-surface-alt flex items-center justify-center text-text-secondary font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-text-primary">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-text-muted">
                                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button ref={(el) => menuButtonRefs.current[user.id] = el} onClick={(e) => toggleMenu(user, e)} className="p-1.5 rounded-lg hover:bg-app-surface-alt text-text-muted transition-colors">
                                            <MoreVertical size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {users.length === 0 && (
                    <div className="text-center py-10">
                        <Users size={32} className="text-text-muted/30 mx-auto mb-2" />
                        <p className="text-xs text-text-muted">No users found</p>
                    </div>
                )}
            </div>

            {/* Owner Verification Modal */}
            <OwnerVerificationModal 
                isOpen={showOwnerVerification} 
                onClose={() => {
                    setShowOwnerVerification(false);
                    setPendingAction(null);
                }} 
                onVerify={verifyOwnerPin}
                onVerified={handleOwnerVerified}
                owners={owners}
                title={
                    pendingAction === 'add' ? 'Owner Verification - Add User' :
                    pendingAction === 'edit' ? 'Owner Verification - Edit User' :
                    pendingAction === 'pin' ? 'Owner Verification - Change PIN' :
                    pendingAction === 'delete' ? 'Owner Verification - Delete User' : 'Owner Verification'
                }
            />

            {/* Action Modals */}
            <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddUser} />
            
            <EditUserModal 
                isOpen={showEditModal} 
                onClose={() => setShowEditModal(false)} 
                onSubmit={handleEditSubmit} 
                user={selectedUser} 
            />
            
            <ChangePinModal 
                isOpen={showPinModal} 
                onClose={() => setShowPinModal(false)} 
                onSubmit={handlePinSubmit} 
                user={selectedUser} 
            />
            
            <DeleteConfirmModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
                onConfirm={handleDeleteConfirm} 
                user={selectedUser} 
            />

            {/* Dropdowns */}
            {users.map(user => renderDropdown(user))}
        </div>
    );
};

export default UserManagement;