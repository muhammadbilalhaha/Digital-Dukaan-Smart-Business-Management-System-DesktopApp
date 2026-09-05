// src/features/auth/pages/Login.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import useAuthStore from '../../../store/authStore';
import LoginLayout from '../components/LoginLayout';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const Login = () => {
    const navigate = useNavigate();
    const { loginSuccess, error: storeError, clearError } = useAuthStore();

    const [step, setStep] = useState('select-user');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setErrorLocal] = useState(null);

    const loadUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const userList = await authService.getUsers();
            setUsers(userList);
            if (userList.length === 1) {
                setSelectedUser(userList[0]);
                setStep('enter-pin');
            }
        } catch (err) {
            setErrorLocal('Failed to load users');
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setStep('enter-pin');
        setErrorLocal(null);
        clearError();
    };

    const handleBack = () => {
        setStep('select-user');
        setSelectedUser(null);
        setErrorLocal(null);
        clearError();
    };

    const handleLogin = async (pin) => {
        if (!selectedUser || isLoggingIn) return;
        setIsLoggingIn(true);
        setErrorLocal(null);
        try {
            const response = await authService.login(selectedUser.id, pin);
            loginSuccess(response.user, response.session);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setErrorLocal(err.message || 'Invalid PIN');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const displayError = error || storeError;

    // ═══════ LOADING STATE ═══════
    if (isLoadingUsers) {
        return <LoadingState />;
    }

    // ═══════ EMPTY STATE ═══════
    if (!isLoadingUsers && users.length === 0) {
        return <EmptyState onNavigateToSetup={() => navigate('/setup', { replace: true })} />;
    }

    // ═══════ MAIN LOGIN ═══════
    return (
        <LoginLayout
            step={step}
            displayError={displayError}
            selectedUser={selectedUser}
            isLoggingIn={isLoggingIn}
            users={users}
            onBack={handleBack}
            onLogin={handleLogin}
            onUserSelect={handleUserSelect}
        />
    );
};

export default Login;