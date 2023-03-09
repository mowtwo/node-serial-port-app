declare function getSerialportClient(onSelect: (...ports: string[]) => string | Promise<string>, onBaudRate: () => number | Promise<number>, onMessage?: (message: string) => void | Promise<void>): Promise<{
    close: () => void;
    readDatus: () => AsyncGenerator<BufferSource, void, unknown>;
    readText: () => AsyncGenerator<string, void, unknown>;
}>;

export { getSerialportClient as default };
