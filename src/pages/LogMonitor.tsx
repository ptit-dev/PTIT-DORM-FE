import React, { useEffect, useRef, useState } from "react";
import { getAdminSocket, connectAdminSocket, disconnectAdminSocket } from "@/features/socket/adminSocket";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const LogMonitorPage: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [connected, setConnected] = useState(false);
    const logEndRef = useRef<HTMLDivElement>(null);
    const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

    useEffect(() => {
        const token = localStorage.getItem("ptit_access_token");
        if (!token) return;
        setLogs([]);
        let ws = getAdminSocket();
        if (!ws || ws.readyState !== 1) {
            ws = connectAdminSocket((event) => {
                setLogs((prev) => [...prev, event.data]);
            });
        } else {
            ws.onmessage = (event) => setLogs((prev) => [...prev, event.data]);
        }
        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);
        return () => {
            disconnectAdminSocket();
        };
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header user={user} />
            <div className="flex flex-1">
                <Sidebar roles={user?.roles} />
                <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-gray-900">Giám sát Log hệ thống Backend</h1>
                            <span className={`text-sm font-semibold px-3 py-1 rounded ${connected ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                                {connected ? 'Đã kết nối WebSocket' : 'Mất kết nối'}
                            </span>
                        </div>

                        <div className="flex justify-center">
                            <div className="bg-black rounded-lg shadow-lg p-5 h-[600px] w-full max-w-6xl overflow-y-auto overflow-x-auto font-mono text-sm text-green-300">
                                {logs.length === 0 ? (
                                    <div className="text-gray-400 italic">Chưa có log nào...</div>
                                ) : (
                                    logs.map((line, idx) => (
                                        <div key={idx} className="whitespace-pre-wrap break-words">{line}</div>
                                    ))
                                )}
                                <div ref={logEndRef} />
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default LogMonitorPage;
