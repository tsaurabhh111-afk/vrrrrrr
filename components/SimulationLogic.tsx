import React, { useEffect, useRef } from 'react';
import { SimulationState, DataPoint } from '../types';

interface Props {
    simState: SimulationState;
    setSimState: React.Dispatch<React.SetStateAction<SimulationState>>;
    isRecording: boolean;
    setData: React.Dispatch<React.SetStateAction<DataPoint[]>>;
}

export const SimulationLogic: React.FC<Props> = ({ simState, setSimState, isRecording, setData }) => {
    const lastTimeRef = useRef<number>(Date.now());
    // Fix: Initialize with 0 because useRef requires an argument
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        const loop = () => {
            const now = Date.now();
            const dt = (now - lastTimeRef.current) / 1000; // seconds
            lastTimeRef.current = now;

            setSimState(prev => {
                let newVoltage = prev.voltage;
                let newTime = prev.time + dt;

                if (prev.switchPosition === 'charge') {
                    // Charging is instant in this simplified model or very fast
                    newVoltage = prev.initialVoltage; 
                } else if (prev.switchPosition === 'discharge') {
                    // V(t) = V0 * e^(-t/RC)
                    // dV/dt = -V / RC
                    // V_new = V_old - (V_old / (R * C)) * dt
                    const RC = prev.resistance * prev.capacitance;
                    const decay = newVoltage / RC * dt;
                    newVoltage = Math.max(0, newVoltage - decay);
                }
                
                // If open switch, ideal capacitor holds charge (no leakage modeled for open switch for simplicity, 
                // or we could assume infinite resistance). Let's assume ideal open switch.
                
                return {
                    ...prev,
                    voltage: newVoltage,
                    time: newTime
                };
            });

            if (isRecording) {
                 // Sample data every 0.5 seconds roughly to avoid flooding
                 if (Math.floor(now / 500) > Math.floor((now - dt * 1000) / 500)) {
                     setSimState(current => {
                         setData(prevData => [...prevData, { time: current.time, voltage: current.voltage }]);
                         return current;
                     })
                 }
            }

            animationFrameRef.current = requestAnimationFrame(loop);
        };

        animationFrameRef.current = requestAnimationFrame(loop);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isRecording, setSimState, setData]);

    return null;
};