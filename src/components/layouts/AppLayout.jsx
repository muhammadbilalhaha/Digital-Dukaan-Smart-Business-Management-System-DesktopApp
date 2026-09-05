import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './topbar/Topbar';
import Sidebar from './sidebar/Sidebar';

const AppLayout = () => {
    return (
        <div className="flex h-screen w-full bg-app-bg font-sans overflow-hidden transition-colors duration-300">
            {/* Sidebar remains fixed on the left */}
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden relative">
                {/* Topbar remains fixed at the top */}
                <Topbar />

                {/* Scrollable Main Area */}
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;