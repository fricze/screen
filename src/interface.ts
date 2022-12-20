interface Writable {
    write(s: string): Promise<void>;
    close(): Promise<void>;
}

export interface Handle extends FileSystemFileHandle {
    createWritable: () => Promise<Writable>;
}
