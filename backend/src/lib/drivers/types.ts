
import { PistonExecuteOptions, PistonResult } from '../../../types/types.js';

export interface DriverConfig {
    mode: 'script' | 'function';
    entryPoint?: string;
    className?: string;
    version?: string;
    timeLimit?: number;
}

export interface ExecutionResult {
    status: 'success' | 'error' | 'timeout';
    output: any;
    logs: string;
    error?: string;
    metrics?: {
        time: number;
        memory: number;
    };
}

export interface CodeAnalysis {
    imports: string[];
    valid: boolean;
}

export interface IDriver {
    setInputs(inputs: any[]): IDriver;
    prepare(): CodeAnalysis;
    generatePayload(): PistonExecuteOptions;
    parseResult(pistonResult: PistonResult): ExecutionResult;
}
