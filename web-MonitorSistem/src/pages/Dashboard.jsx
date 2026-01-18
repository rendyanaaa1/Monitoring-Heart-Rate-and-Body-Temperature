import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import {
    Activity,
    Thermometer,
    AlertTriangle,
    Download,
    Heart,
    Clock,
    UserCircle
} from "lucide-react";

export default function Dashboard() {
    const [data, setData] = useState([]);
    const [monitoring, setMonitoring] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const exportCSV = () => {
        if (!data.length) {
            alert("Data belum tersedia");
            return;
        }

        const header = "Waktu,BPM,Suhu\n";
        const rows = data
            .map(d => `${d.time},${d.bpm},${d.suhu}`)
            .join("\n");

        const csvContent = header + rows;
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "monitoring-kesehatan.csv";
        link.click();
    };

    useEffect(() => {
        const monitoringRef = ref(db, "Monitoring");

        onValue(monitoringRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                setMonitoring(val);

                setData((prev) => [
                    ...prev.slice(-19), // Keep last 20 points for smoother charts
                    {
                        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                        bpm: val.bpm,
                        suhu: val.suhu
                    }
                ]);
            }
        });
    }, []);

    // Helper for status colors
    const getStatusColor = (status, type) => {
        if (status === "Normal") return "text-emerald-600 bg-emerald-50 border-emerald-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Activity size={20} />
                        </div>
                        <h1 className="font-bold text-xl tracking-tight text-slate-900">
                            Monitoring <span className="text-slate-400 font-normal">Sistem</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                            <Clock size={16} />
                            <span>{currentTime.toLocaleTimeString()}</span>
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <UserCircle size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header Section with Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Monitoring</h2>
                        <p className="text-slate-500 mt-1">Real-time vital signs for ICU Bed #01</p>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium rounded-lg transition-all shadow-sm active:scale-95"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>

                {/* ALERT */}
                {monitoring && (monitoring.status_jantung !== "Normal" || monitoring.status_suhu !== "Normal") && (
                    <div className="animate-fade-in bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-red-800 text-sm uppercase tracking-wide">Critical Alert</h4>
                            <div className="mt-1 text-red-700 text-sm space-y-1">
                                {monitoring.status_jantung !== "Normal" && (
                                    <p>Abnormal Heart Rate detected: <span className="font-semibold">{monitoring.status_jantung}</span></p>
                                )}
                                {monitoring.status_suhu !== "Normal" && (
                                    <p>Abnormal Body Temperature detected: <span className="font-semibold">{monitoring.status_suhu}</span></p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* KPI CARDS */}
                {monitoring ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Heart Rate Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Heart size={120} className="text-rose-500 -mr-8 -mt-8" />
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                                        <Heart size={20} className="animate-pulse" />
                                    </div>
                                    <span className="font-semibold text-slate-700">Heart Rate</span>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(monitoring.status_jantung, 'bpm')}`}>
                                    {monitoring.status_jantung}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-slate-900 tracking-tight">{monitoring.bpm}</span>
                                <span className="text-slate-500 font-medium text-lg">BPM</span>
                            </div>
                        </div>

                        {/* Temperature Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Thermometer size={120} className="text-blue-500 -mr-8 -mt-8" />
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                        <Thermometer size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-700">Body Temperature</span>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(monitoring.status_suhu, 'suhu')}`}>
                                    {monitoring.status_suhu}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-slate-900 tracking-tight">{monitoring.suhu}</span>
                                <span className="text-slate-500 font-medium text-lg">°C</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Loading State
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-48 animate-pulse">
                                <div className="h-10 w-10 bg-slate-100 rounded-lg mb-4"></div>
                                <div className="h-6 w-32 bg-slate-100 rounded mb-8"></div>
                                <div className="h-12 w-24 bg-slate-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-800">Heart Rate History</h3>
                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Live</div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={['dataMin - 10', 'dataMax + 10']}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                        labelStyle={{ color: '#64748b', marginBottom: '0.25rem', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="bpm"
                                        stroke="#f43f5e"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorBpm)"
                                        name="BPM"
                                        animationDuration={500}
                                        dot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-800">Temperature History</h3>
                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Live</div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorSuhu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[34, 42]} // Common body temp range
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                        labelStyle={{ color: '#64748b', marginBottom: '0.25rem', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="suhu"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSuhu)"
                                        name="Temperature"
                                        animationDuration={500}
                                        dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
