import React, { useState } from 'react';
import { LabScene } from './components/LabScene';
import { DataPanel } from './components/DataPanel';
import { Assistant } from './components/Assistant';
import { SimulationLogic } from './components/SimulationLogic';
import { SimulationState, DataPoint } from './types';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';

const INITIAL_STATE: SimulationState = {
  voltage: 0,
  time: 0,
  isCharging: false,
  isDischarging: false,
  switchPosition: 'open',
  capacitance: 10e-6, // 10 microFarad
  resistance: 5e6,    // 5 MegaOhm (The "High" resistance)
  initialVoltage: 10,
};

export default function App() {
  const [simState, setSimState] = useState<SimulationState>(INITIAL_STATE);
  const [recordedData, setRecordedData] = useState<DataPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleReset = () => {
    setSimState({
        ...INITIAL_STATE, 
        // Keep random resistance slightly varied on reset if we wanted, 
        // but for consistency let's keep it fixed or randomize only on full reload.
        resistance: INITIAL_STATE.resistance
    });
    setRecordedData([]);
    setIsRecording(false);
  };

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col relative overflow-hidden font-sans">
      {/* Physics Engine */}
      <SimulationLogic 
        simState={simState} 
        setSimState={setSimState} 
        isRecording={isRecording}
        setData={setRecordedData}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="container mx-auto flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-3">
             <div className="bg-cyan-500 p-2 rounded-lg">
                <Activity className="text-white" size={24} />
             </div>
             <div>
                 <h1 className="text-2xl font-bold text-white tracking-tight">Virtual Physics Lab</h1>
                 <p className="text-cyan-400 text-sm">High Resistance Measurement: Loss of Charge Method</p>
             </div>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 block">Voltage</span>
                <span className="text-xl font-mono text-red-400">{simState.voltage.toFixed(3)} V</span>
             </div>
             <div className="bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 block">Time</span>
                <span className="text-xl font-mono text-cyan-400">{simState.time.toFixed(1)} s</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex relative">
        {/* 3D Viewport - Takes full space */}
        <div className="absolute inset-0 z-0">
             <LabScene simState={simState} setSimState={setSimState} />
        </div>

        {/* Sidebar Overlay - Left (Data) */}
        <div className="absolute left-4 top-24 bottom-4 w-96 z-10 pointer-events-none">
            <div className="h-full pointer-events-auto">
                 <DataPanel data={recordedData} clearData={() => setRecordedData([])} />
            </div>
        </div>

        {/* Sidebar Overlay - Right (Assistant & Controls) */}
        <div className="absolute right-4 top-24 bottom-4 w-80 z-10 flex flex-col gap-4 pointer-events-none">
            
            {/* Quick Controls */}
            <div className="bg-slate-900/90 p-4 rounded-lg pointer-events-auto border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Simulation Controls</h3>
                <div className="flex gap-2 mb-4">
                     <button 
                        onClick={() => setIsRecording(!isRecording)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-medium transition ${isRecording ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                     >
                        {isRecording ? <><Pause size={16}/> Stop Rec</> : <><Play size={16}/> Record Data</>}
                     </button>
                     <button 
                        onClick={handleReset}
                        className="px-3 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
                        title="Reset Experiment"
                     >
                        <RotateCcw size={18} />
                     </button>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between">
                        <span>Capacitance (C):</span>
                        <span className="text-slate-200">10.0 µF</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Source Voltage (V0):</span>
                        <span className="text-slate-200">10.0 V</span>
                    </div>
                </div>
            </div>

            {/* Chat Assistant */}
            <div className="flex-1 min-h-0 pointer-events-auto">
                <Assistant simState={simState} />
            </div>
        </div>
      </main>
    </div>
  );
}
