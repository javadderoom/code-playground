
import { PistonExecuteOptions, PistonResult } from '../../../types/types.js';
import { IDriver, DriverConfig, ExecutionResult, CodeAnalysis } from './types.js';

export class PythonDriver implements IDriver {
  private code: string;
  private inputs: any[] = [];
  private config: DriverConfig;

  private static readonly WRAPPER_TEMPLATE = `
import sys
import json
import time
import io
import traceback
import os

# --- USER CODE START ---
{{USER_CODE}}
# --- USER CODE END ---

def _serialize(obj):
    # Custom serializer if needed
    return obj

def _driver_main():
    # Read inputs from a specific file or stdin
    # We will use a known file 'inputs.json' for better reliability than stdin mixing
    try:
        with open('inputs.json', 'r') as f:
            cases = json.load(f)
    except FileNotFoundError:
        # Fallback to stdin if file not found
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return
        cases = json.loads(input_data)

    results = []
    user_stdout = io.StringIO()
    original_stdout = sys.stdout
    sys.stdout = user_stdout
    
    overall_success = True
    
    try:
        # Check if we are in function mode
        entry_point = "{{ENTRY_POINT}}"
        class_name = "{{CLASS_NAME}}"
        
        instance = None
        if class_name and class_name in globals():
            Cls = globals()[class_name]
            instance = Cls()
        
        func = None
        if instance and hasattr(instance, entry_point):
            func = getattr(instance, entry_point)
        elif entry_point in globals():
            func = globals()[entry_point]
            
        if not func:
            raise Exception(f"Entry point '{entry_point}' not found")

        for case in cases:
            args = case.get('args', [])
            case_id = case.get('id')
            
            start_time = time.time()
            try:
                # Execute user function
                ret = func(*args)
                duration = (time.time() - start_time) * 1000
                results.append({
                    'id': case_id,
                    'result': ret,
                    'time': duration,
                    'status': 'executed'
                })
            except Exception as e:
                results.append({
                    'id': case_id,
                    'error': str(e),
                    'traceback': traceback.format_exc(),
                    'status': 'error'
                })
                overall_success = False

    except Exception as e:
        results = [{"error": "Driver Error: " + str(e), "traceback": traceback.format_exc()}]
        overall_success = False
    finally:
        sys.stdout = original_stdout

    # Prepare final output
    final_output = {
        "results": results,
        "logs": user_stdout.getvalue(),
        "success": overall_success
    }
    
    # Print delimiter and result
    print("\\n---PISTON_DRIVER_OUTPUT---")
    print(json.dumps(final_output, default=str))

if __name__ == "__main__":
    _driver_main()
`;

  constructor(code: string, config: DriverConfig = { mode: 'script' }) {
    this.code = code;
    this.config = {
      version: '3.10.0',
      className: 'Solution',
      ...config
    };
  }

  public setInputs(inputs: any[]): IDriver {
    this.inputs = inputs;
    return this;
  }

  public prepare(): CodeAnalysis {
    // 1. Analyze imports (simple regex)
    const importRegex = /^(?:from\s+(\w+)|import\s+(\w+))/gm;
    const imports = new Set<string>();
    let match;
    while ((match = importRegex.exec(this.code)) !== null) {
      imports.add(match[1] || match[2]);
    }

    // 2. "Format" - ensure newline at end, maybe strip trailing spaces
    const formatted = this.code.trimEnd() + '\n';
    
    return {
      imports: Array.from(imports),
      valid: true // In a real scenario, run a syntax checker here
    };
  }

  public generatePayload(): PistonExecuteOptions {
    const { formatted } = { formatted: this.code.trimEnd() + '\n' };
    
    let fullCode = formatted;
    let files = [];

    if (this.config.mode === 'function') {
      // Inject code into wrapper
      fullCode = PythonDriver.WRAPPER_TEMPLATE
        .replace('{{USER_CODE}}', formatted)
        .replace('{{ENTRY_POINT}}', this.config.entryPoint || 'solution')
        .replace('{{CLASS_NAME}}', this.config.className || '');
        
      files = [
        { name: 'main.py', content: fullCode },
        { name: 'inputs.json', content: JSON.stringify(this.inputs) }
      ];
    } else {
      // Script mode: Just run the file
      files = [
        { name: 'main.py', content: formatted }
      ];
    }

    return {
      language: 'python',
      version: this.config.version || '3.10.0',
      files: files,
    };
  }

  public parseResult(pistonResult: PistonResult): ExecutionResult {
    // If we used the wrapper, we look for ---PISTON_DRIVER_OUTPUT---
    const stdout = pistonResult.run.stdout;
    const delimiter = "\n---PISTON_DRIVER_OUTPUT---\n";
    
    if (this.config.mode === 'function') {
      const parts = stdout.split(delimiter);
      if (parts.length < 2) {
        // Did not find delimiter - probably a syntax error or runtime crash before driver finished
        return {
          status: 'error',
          output: [],
          logs: stdout,
          error: pistonResult.run.stderr || 'Runtime Error (No driver output)',
        };
      }

      const logs = parts[0];
      const jsonStr = parts[1];
      
      try {
        const data = JSON.parse(jsonStr);
        return {
          status: data.success ? 'success' : 'error',
          output: data.results,
          logs: logs + (data.logs || ''), // Combine logs
          error: data.results.find((r: any) => r.status === 'error')?.error
        };
      } catch (e) {
        return {
          status: 'error',
          output: [],
          logs: logs,
          error: 'Failed to parse driver output'
        };
      }
    } else {
      // Script mode
      return {
        status: pistonResult.run.code === 0 ? 'success' : 'error',
        output: stdout ? [{ id: 0, result: stdout, time: 0, status: pistonResult.run.code === 0 ? 'success' : 'error' }] : [],
        logs: stdout,
        error: pistonResult.run.stderr
      };
    }
  }
}
