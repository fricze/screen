import { useState, useCallback, useRef, useEffect } from 'react'
import { fileOpen } from 'browser-fs-access';
import { useInterval } from 'usehooks-ts'
import {
    MonacoJsxSyntaxHighlight,
    getWorker
} from "monaco-jsx-syntax-highlight";
import Editor, { useMonaco } from "@monaco-editor/react";
import { debounce } from './debounce'
import { Handle } from './interface'
import './App.css'

const Spinner = () => <div className="lds-roller">
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
</div>

const defaultCode = `const test = () => {
  const num: number = 123

  return (
    <div className='test'>
      {num}
      <div render={<div style={'background: red;'}/>}/>
      <div props={num}></div>
    </div>
  )
}
`;

const App = () => {
    const [value, setValue] = useState("console.log('hello world!');")
    const [loading, setLoading] = useState(false);
    const lastModified = useRef(0);
    const [handle, setHandle] = useState<Handle>()

    const monaco = useMonaco();

    const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.Preserve,
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            esModuleInterop: true
        });

        const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(
            getWorker(),
            monaco
        );

        // editor is the result of monaco.editor.create
        const {
            highlighter,
            dispose
        } = monacoJsxSyntaxHighlight.highlighterBuilder({
            editor: editor
        });
        // init highlight
        highlighter();

        editor.onDidChangeModelContent(() => {
            // content change, highlight
            highlighter();
        });

        return dispose;
    }, []);

    const onChange = useCallback(debounce(async (value: string) => {
        setLoading(true)

        const writer = await handle?.createWritable();

        if (!writer) {
            setLoading(false)
            return
        };

        await writer.write(value);
        await writer.close();

        setLoading(false)
    }, 500), []);

    const handleOpen = useCallback(async () => {
        const blob = await fileOpen({
            description: 'Text files',
        });

        lastModified.current = (blob.lastModified);
        setValue(await blob.text());
        setHandle(blob.handle as Handle)
    }, [handle])

    useInterval(async () => {
        const file = await handle?.getFile();
        if (file?.lastModified !== lastModified.current) {
            const text = await file?.text();
            if (text) {
                setLoading(true)
                setValue(text);
                setLoading(false)
            }
        }
    }, handle ? 5000 : null)

    return (
        <div className="App">
            {loading ? <Spinner /> : null}

            <Editor
                height={"70vh"}
                width="100vw"
                className={"editor"}
                onMount={handleEditorDidMount}
                theme={"vs-dark"}
                path={"file:///index.tsx"}
                defaultLanguage="typescript"
                options={{
                    fontSize: 16,
                    lineHeight: 28,
                    automaticLayout: true
                }}
                defaultValue={defaultCode}
                value={value}
            />

            <div className="card">
                <button onClick={() => handleOpen()}>
                    Open a file
                </button>
            </div>
        </div>
    )
}

export default App
