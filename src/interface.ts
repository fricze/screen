interface Writable {
    write(s: string): Promise<void>;
    close(): Promise<void>;
}

export interface Handle extends FileSystemFileHandle {
    createWritable: () => Promise<Writable>;
}


type T1 = Extract<string | number | (() => void) | ((a: number) => number), Function>;

type T2 = Parameters<(s: string, b: number, ...args: Function[]) => void>;


const ppl = {
    one: 1,
    two: 2,
};

type People<T = string> = {
    [N in keyof typeof ppl]: T;
}

type Getters<Type> = {
    [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
};

interface Person {
    name: string;
    age: number;
    location: string;
}

type LazyPerson = Getters<Person>;

type RemoveKindField<Type> = {
    [Property in keyof Type as Exclude<Property, "kind">]: Type[Property]
};

interface Circle {
    kind: "circle";
    radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;
