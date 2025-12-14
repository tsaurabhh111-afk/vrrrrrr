import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { DataPoint } from '../types';
import { Download, Trash2 } from 'lucide-react';

interface Props {
    data: DataPoint[];
    clearData: () => void;
}

export const DataPanel: React.FC<Props> = ({ data, clearData }) => {
    // Calculate ln(V) for the second graph
    const logData = data
        .filter(d => d.voltage > 0.01)
        .map(d => ({
            ...d,
            lnV: Math.log(d.voltage)
        }));

    const handleDownload = () => {
        if (data.length === 0) return;

        // Header
        let csvContent = "Time (s),Voltage (V),ln(V)\n";

        // Rows
        logData.forEach(row => {
            csvContent += `${row.time.toFixed(4)},${row.voltage.toFixed(4)},${row.lnV.toFixed(4)}\n`;
        });

        // Create Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "experiment_data.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/90 rounded-lg p-4 text-slate-100 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-400">Data Logger</h2>
                <div className="flex gap-2">
                    <button onClick={clearData} className="p-2 hover:bg-red-900/50 rounded text-red-400 transition" title="Clear Data">
                        <Trash2 size={18} />
                    </button>
                    <button 
                        onClick={handleDownload} 
                        className={`p-2 rounded transition ${data.length > 0 ? 'hover:bg-slate-700 text-slate-400 cursor-pointer' : 'opacity-50 cursor-not-allowed text-slate-600'}`}
                        title="Download CSV"
                        disabled={data.length === 0}
                    >
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* V vs t */}
                <div className="h-64 bg-slate-800/50 rounded p-2">
                    <h3 className="text-sm font-semibold mb-2 text-center text-slate-300">Voltage Decay: V(t) vs t</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="time" stroke="#94a3b8" tickFormatter={(val) => val.toFixed(0)}>
                                <Label value="Time (s)" offset={-5} position="insideBottom" />
                            </XAxis>
                            <YAxis stroke="#94a3b8">
                                <Label value="Voltage (V)" angle={-90} position="insideLeft" />
                            </YAxis>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Line type="monotone" dataKey="voltage" stroke="#22d3ee" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* ln(V) vs t */}
                <div className="h-64 bg-slate-800/50 rounded p-2">
                    <h3 className="text-sm font-semibold mb-2 text-center text-slate-300">Analysis: ln(V) vs t</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={logData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="time" stroke="#94a3b8" tickFormatter={(val) => val.toFixed(0)}>
                                <Label value="Time (s)" offset={-5} position="insideBottom" />
                            </XAxis>
                            <YAxis stroke="#94a3b8" domain={['auto', 'auto']}>
                                <Label value="ln(V)" angle={-90} position="insideLeft" />
                            </YAxis>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Line type="monotone" dataKey="lnV" stroke="#f472b6" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table Preview */}
            <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">Recorded Points (Last 10)</h3>
                <div className="bg-slate-800 rounded overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-slate-700 text-slate-300">
                            <tr>
                                <th className="px-4 py-2">Time (s)</th>
                                <th className="px-4 py-2">Voltage (V)</th>
                                <th className="px-4 py-2">ln(V)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logData.slice(-10).reverse().map((row, i) => (
                                <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-4 py-2">{row.time.toFixed(2)}</td>
                                    <td className="px-4 py-2">{row.voltage.toFixed(3)}</td>
                                    <td className="px-4 py-2">{row.lnV.toFixed(3)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};