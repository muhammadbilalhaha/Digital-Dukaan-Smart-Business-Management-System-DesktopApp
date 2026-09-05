// src/components/layouts/sidebar/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutGrid,
    Package,
    Users,
    BarChart3,
    CreditCard,
    Wallet,
    FilePieChart,
    WarehouseIcon,
    CreditCardIcon,
    HandCoins,Undo2
} from 'lucide-react';
import { setupService } from '../../../features/shop-setup/services/setupService';
import { invoke } from '../../../tauri/commands';
import { useTheme } from '../../../features/settings/context/ThemeContext';

const Sidebar = () => {
    const { sidebarMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(sidebarMode === 'expanded');
    const [logoUrl, setLogoUrl] = useState(null);
    const [activeItem, setActiveItem] = useState('dashboard');

    const navigate = useNavigate();
    const location = useLocation();

    // Sync sidebar mode from context
    useEffect(() => {
        setIsExpanded(sidebarMode === 'expanded');
    }, [sidebarMode]);

    // Sync active item with current URL
    useEffect(() => {
        const currentPath = location.pathname.replace('/', '') || 'dashboard';
        setActiveItem(currentPath);
    }, [location.pathname]);

    // Load shop logo
    useEffect(() => {
        let isMounted = true;

        const loadLogo = async () => {
            try {
                const settings = await setupService.getShopSettings();

                if (settings && settings.logo_path) {
                    const bytes = await invoke('read_logo_file', {
                        path: settings.logo_path,
                    });

                    if (bytes && bytes.length > 0) {
                        const extension = settings.logo_path
                            .split('.')
                            .pop()
                            .toLowerCase();

                        const mimeType =
                            extension === 'png'
                                ? 'image/png'
                                : 'image/jpeg';

                        const blob = new Blob(
                            [new Uint8Array(bytes)],
                            { type: mimeType }
                        );

                        const url = URL.createObjectURL(blob);

                        if (isMounted) {
                            setLogoUrl(url);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load shop logo in sidebar:', error);
            }
        };

        loadLogo();

        return () => {
            isMounted = false;
        };
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'suppliers', label: 'Suppliers', icon: WarehouseIcon },
        { id: 'purchases', label: 'Purchases', icon: HandCoins},
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'payment-system', label: 'Payment', icon: CreditCardIcon },
        { id: 'sales', label: 'Sales', icon: BarChart3 },
        { id: 'returns', label: 'Returns', icon: Undo2 },
        { id: 'expenses', label: 'Expenses', icon: Wallet },
        { id: 'reports', label: 'Reports', icon: FilePieChart },
    ];

    return (
        <div
            className={`relative h-screen bg-sidebar-bg text-sidebar-text border-r border-gray-700
                        transition-[width] duration-150 ease-in-out group flex flex-col
                        ${isExpanded ? 'w-52' : 'w-16'}`}
        >
            {/* Sidebar Toggle */}
            <div
                className="absolute top-0 -right-15 z-50 flex h-15 w-15 items-center
                            border-r border-b-2 border-gray-600 justify-center
                            rounded-r-full bg-sidebar-bg"
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex h-10 w-10 items-center justify-center rounded-full
                                shadow-md transition-colors"
                    aria-label="Toggle Sidebar"
                >
                    <img
                        src={
                            isExpanded
                                ? './images/sidebar-icons/left_arrow.png'
                                : './images/sidebar-icons/right_arrow.png'
                        }
                        alt="Toggle"
                        className="h-15 w-15 object-contain hover:scale-110
                                    transition-all duration-300 ease-in-out"
                    />
                </button>
            </div>

            {/* Logo Section */}
            <div className="flex h-28 items-center justify-center p-5 my-2">
                {isExpanded ? (
                    <div className="text-center font-bold text-2xl tracking-wider">
                        <span className="flex items-center justify-center">
                            <img
                                src={logoUrl || './images/main_logo.png'}
                                alt="logo"
                                className="max-h-40 w-auto object-contain"
                            />
                        </span>
                    </div>
                ) : (
                    <div className="flex h-full w-full items-center justify-center -rotate-90">
                        <img
                            src={logoUrl || './images/main_logo.png'}
                            alt="logo"
                            className="max-w-none p-2 w-25 object-contain"
                        />
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto select-none cursor-default overflow-x-hidden custom-scrollbar">
                <ul className="flex flex-col gap-1 ">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <a
                                href={`/${item.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveItem(item.id);
                                    navigate(`/${item.id}`); 
                                }}
                                className={`flex items-center py-3 select-none cursor-default transition-all duration-200
                                ${activeItem === item.id
                                        ? 'bg-sidebar-active text-sidebar-text shadow-sm shadow-custom-shadow'
                                        : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                                    }
                                ${isExpanded
                                        ? 'px-6 rounded-none'
                                        : 'px-0 justify-center mx-2 rounded-md'
                                    }`}
                            >
                                <item.icon
                                    size={24}
                                    className="min-w-6"
                                />

                                <span
                                    className={`ml-4 font-semibold whitespace-nowrap
                                    transition-all duration-300
                                    ${isExpanded
                                            ? 'opacity-100 translate-x-0'
                                            : 'opacity-0 -translate-x-4 hidden'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Decorative Footer Graphic */}
            <div className="p-1 flex items-end justify-center relative overflow-hidden">
                <img src="./images/sidebar-icons/shop_relax.gif" alt="" />
            </div>
        </div>
    );
};

export default Sidebar;