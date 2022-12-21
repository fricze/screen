import { useState, useCallback, useRef } from 'react'
import { fileOpen } from 'browser-fs-access';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from "@codemirror/lang-javascript"
import { useInterval } from 'usehooks-ts'
import Editor from "@monaco-editor/react";
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

const App = () => {
    const [value, setValue] = useState("console.log('hello world!');")
    const [loading, setLoading] = useState(false);
    const lastModified = useRef(0);
    const [handle, setHandle] = useState<Handle>()

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
            mimeTypes: ['text/*'],
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
                height="70vh"
                width="100vw"
                defaultLanguage="javascript"
                defaultValue="// some comment"
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
