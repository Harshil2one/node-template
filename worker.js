const { parentPort, workerData } = require('worker_threads');

console.log('Worker received:', workerData);

function performCPUIntensiveTask() {
  let result = 0;
  for (let i = 0; i < 1_000_000; i++) {
    result += i;
  }
  return result;
}

const result = performCPUIntensiveTask();

parentPort.postMessage({
  receivedData: workerData,
  calculatedSum: result
});
