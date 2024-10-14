export class FileP{

    constructor(
        public url: string,
        public name: string,
        public size: number,
        public type: string,
        public lastModified: number,
        public webkitRelativePath: string,
        public slice: (start?: number, end?: number, contentType?: string) => Blob,
        public stream: () => ReadableStream<Uint8Array>,
        public text: () => Promise<string>,
        public arrayBuffer: () => Promise<ArrayBuffer> 
    ){}
}