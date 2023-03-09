import { SerialPort } from "serialport";
// import R from "node:readline"
import process from "node:process"

export default async function getSerialportClient(
  onSelect: (...ports: string[]) => string | Promise<string>,
  onBaudRate: () => number | Promise<number>,
  onMessage?: (message: string) => void | Promise<void>
) {
  let selectedPort: SerialPort

  // const question = (msg: string) => new Promise<string>(
  //   resolve => readline.question(msg, resolve))
  const openPort = (port: SerialPort) => new Promise<void>((resolve, reject) => {
    port.open((err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })

  async function readPortData(port: SerialPort) {
    return new Promise(resolve => {
      port.once('data', resolve)
    })
  }

  async function* readPortIterater(port: SerialPort) {
    while (true) {
      const data = await readPortData(port)
      yield data
    }
  }

  // const readline = R.createInterface(process.stdin, process.stdout)

  process.on('exit', () => {
    // readline.close()
    if (selectedPort?.opening) {
      selectedPort?.close()
    }
  })

  const ports = await SerialPort.list()

  if (ports.length <= 0) {
    await onMessage?.('未连接任何端口设备')
    process.exit(0)
  }

  await onMessage?.(`发现${ports.length}个端口`)

  const portPath = ports.map(port => port.path)



  while (true) {
    const path = await onSelect(...portPath)
    if (!portPath.includes(path)) {
      await onMessage?.('选择的端口不存在')
      continue
    }

    const baudRate = await onBaudRate()

    selectedPort = new SerialPort({
      path,
      baudRate,
      autoOpen: false
    })
    break
  }

  await openPort(selectedPort)



  async function* readDatus() {
    for await (const data of readPortIterater(selectedPort)) {
      yield data as BufferSource
    }
  }

  async function* readText() {
    const textDecode = new TextDecoder()
    for await (const data of readDatus()) {
      yield textDecode.decode(data)
    }
  }

  function close() {
    selectedPort.close()
    // readline.close()
  }

  return { close, readDatus, readText }
}
