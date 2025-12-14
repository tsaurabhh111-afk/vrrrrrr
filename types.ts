export interface SimulationState {
  voltage: number;
  time: number;
  isCharging: boolean;
  isDischarging: boolean;
  switchPosition: 'charge' | 'discharge' | 'open';
  capacitance: number; // in Farads
  resistance: number; // in Ohms
  initialVoltage: number; // in Volts
}

export interface DataPoint {
  time: number;
  voltage: number;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
}
