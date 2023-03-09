import getSerialPortClient from "../dist/index.mjs"
import R from "readline/promises"

const readline = R.createInterface(process.stdin, process.stdout)

const {
  close,
  readText
} = await getSerialPortClient(
  () => readline.question('select port:'),
  () => 11520
)

for await (const text of readText()) {
  process.stdout.write(text)
}

close()
