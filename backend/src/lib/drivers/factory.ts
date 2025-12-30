
import { IDriver, DriverConfig } from './types.js';
import { PythonDriver } from './python.js';

export class DriverFactory {
    static getDriver(language: string, code: string, config: DriverConfig): IDriver {
        switch (language.toLowerCase()) {
            case 'python':
            case 'py':
                return new PythonDriver(code, config);
            // Future extensions:
            // case 'javascript':
            //     return new JavascriptDriver(code, config);
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }
}
