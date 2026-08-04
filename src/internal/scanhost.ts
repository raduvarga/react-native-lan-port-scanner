import type { LSSingleScanResult } from './types';
const net = require('react-native-tcp');

const scanHost = (
  hostIP: string,
  hostPort: number,
  timeout: number,
  logging: boolean
): Promise<LSSingleScanResult> => {

  const scanResult: LSSingleScanResult = {
    ip: hostIP,
    port: hostPort,
  };

  return new Promise<LSSingleScanResult>((resolve, reject) => {
    // var connectingTimeout: any;

    function stop() {
      let disconnectMessage = "disconnect\0";
      try {
        client.write(disconnectMessage);
        if (logging) {
          console.log(
            `scanHost->createConnection->stop: disconnect`
          );
        }
      } catch (error: any) {
        if (logging) {
          console.log(
            `scanHost->createConnection->stop error: ${error}`
          );
        }
      }
      client.end();
    }

    let connected = false;

    const client = net.createConnection(
      { host: hostIP, port: hostPort },
      () => {
        if (logging) {
          console.log(
            `scanHost->createConnection->host: ${hostIP} port: ${hostPort}`
          );
        }

        connected = true;
      }
    );

    // wait for data if available
    client.on('data', (data: any) => {
      if (logging) {
        console.log(
          `scanHost->createConnection->data`
        );
      }
      scanResult.data = data;
      stop();
      resolve(scanResult);
    });

    client.on('error', (error: any) => {
      if (logging) {
        console.log(
          'scanHost->on error->host: ${hostIP} port: ${hostPort} error:',
          error
        );
      }

      client.end();
      reject();
    });

    client.on('close', () => {
      if (logging) {
        console.log(`scanHost->on close->host: ${hostIP} port: ${hostPort}`);
      }
      // reject();
    });

    setTimeout(() => {
      if (connected) {
        stop();
        resolve(scanResult);
      } else {
        if (logging) {
          console.log(
            `scanHost->force timeout->host: ${hostIP} port: ${hostPort}`
          );
        }
        client.destroy();
        reject();
      }

    }, timeout + 10);
  });
};

export default scanHost;
