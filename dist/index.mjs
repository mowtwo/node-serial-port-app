import { SerialPort } from 'serialport';
import process from 'node:process';

async function getSerialportClient(onSelect, onBaudRate, onMessage) {
  let selectedPort;
  const openPort = (port) => new Promise((resolve, reject) => {
    port.open((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  async function readPortData(port) {
    return new Promise((resolve) => {
      port.once("data", resolve);
    });
  }
  async function* readPortIterater(port) {
    while (true) {
      const data = await readPortData(port);
      yield data;
    }
  }
  process.on("exit", () => {
    if (selectedPort?.opening) {
      selectedPort?.close();
    }
  });
  const ports = await SerialPort.list();
  if (ports.length <= 0) {
    await onMessage?.("\u672A\u8FDE\u63A5\u4EFB\u4F55\u7AEF\u53E3\u8BBE\u5907");
    process.exit(0);
  }
  await onMessage?.(`\u53D1\u73B0${ports.length}\u4E2A\u7AEF\u53E3`);
  const portPath = ports.map((port) => port.path);
  while (true) {
    const path = await onSelect(...portPath);
    if (!portPath.includes(path)) {
      await onMessage?.("\u9009\u62E9\u7684\u7AEF\u53E3\u4E0D\u5B58\u5728");
      continue;
    }
    const baudRate = await onBaudRate();
    selectedPort = new SerialPort({
      path,
      baudRate,
      autoOpen: false
    });
    break;
  }
  await openPort(selectedPort);
  async function* readDatus() {
    for await (const data of readPortIterater(selectedPort)) {
      yield data;
    }
  }
  async function* readText() {
    const textDecode = new TextDecoder();
    for await (const data of readDatus()) {
      yield textDecode.decode(data);
    }
  }
  function close() {
    selectedPort.close();
  }
  return { close, readDatus, readText };
}

export { getSerialportClient as default };
