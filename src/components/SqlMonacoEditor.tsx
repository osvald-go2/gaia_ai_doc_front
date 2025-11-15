import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useTheme } from './ThemeProvider';

export default function SqlMonacoEditor({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useTheme();
  const mappedTheme = theme === 'dark' ? 'vs-dark' : 'vs';
  loader.config({ monaco });
  return (
    <Editor
      height="100%"
      defaultLanguage="sql"
      language="sql"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      theme={mappedTheme}
      options={{
        fontFamily: 'Consolas, Monaco, Courier New, monospace',
        fontSize: 12,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'line',
      }}
    />
  );
}
