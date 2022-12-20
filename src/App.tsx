import { useState, useCallback, useRef } from 'react'
import { fileOpen } from 'browser-fs-access';
import { javascript } from "@codemirror/lang-javascript"
import CodeMirror from '@uiw/react-codemirror';
import './App.css'

function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
    func: F,
    waitFor: number,
): (...args: Parameters<F>) => void {
    let timeout: number;
    return (...args: Parameters<F>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

interface Writable {
    write(s: string): Promise<void>;
    close(): Promise<void>;
}

interface Handle extends FileSystemFileHandle {
    createWritable: () => Promise<Writable>;
}

const Spinner = () => <div className="container">
    {Array(15).fill(0).map(() => <div className="block"></div>)}
</div>

function App() {
    const [value, setValue] = useState("console.log('hello world!');")
    const handle = useRef<Handle>()
    const writable = useRef<Writable>()
    const [loading, setLoading] = useState(false);

    const onChange = useCallback(debounce(async (value: string) => {
        setLoading(true)

        const contents = value;
        const writer = await handle?.current?.createWritable();

        if (!writer) {
            setLoading(false)
            return
        };
        await writer.write(contents);
        await writer.close();

        setLoading(false)
    }, 500), []);

    const handleOpen = async () => {
        const blob = await fileOpen({
            description: 'Text files',
            mimeTypes: ['text/*'],
        });

        handle.current = blob.handle as Handle
        writable.current = await (blob.handle as Handle).createWritable();

        const text = await blob.text();
        setValue(text);
    }

    return (
        <div className="App">
            {loading ? <Spinner /> : null}

            <CodeMirror
                value={value}
                height="500px"
                width="1000px"
                extensions={[javascript({ jsx: true })]}
                onChange={onChange}
            />

            <div className="card">
                <button onClick={() => {
                    handleOpen()
                }}>
                    open a file!
                </button>
            </div>
        </div>
    )
}

export default App
