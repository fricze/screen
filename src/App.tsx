import { useState, useCallback, useRef } from 'react'
import { fileOpen } from 'browser-fs-access';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from "@codemirror/lang-javascript"
import { debounce } from './debounce'
import { Handle } from './interface'
import './App.css'

const Spinner = () => <div className="container">
    {Array(15).fill(0).map(() => <div className="block"></div>)}
</div>

function App() {
    const [value, setValue] = useState("console.log('hello world!');")
    const [loading, setLoading] = useState(false);
    const handle = useRef<Handle>()

    const onChange = useCallback(debounce(async (value: string) => {
        setLoading(true)

        const writer = await handle?.current?.createWritable();

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

        handle.current = blob.handle as Handle

        setValue(await blob.text());
    }, [])

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
