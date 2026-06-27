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
    var connectingTimeout;
    var alreadyConnectedTimeout;

    const client = net.createConnection(
      { host: hostIP, port: hostPort },
      () => {
        if (logging) {
          console.log(
            `scanHost->createConnection->host: ${hostIP} port: ${hostPort}`
          );
        }

        clearTimeout(connectingTimeout);
        // wait a few millisec to get an initialisation message
        alreadyConnectedTimeout = setTimeout(() => {
            resolve(scanResult);
            client.end();
          }, 100);
      }
    );

    // wait for data if available
    client.on('data', (data: any) => {
        scanResult.data = data;
        clearTimeout(alreadyConnectedTimeout);
        resolve(scanResult);
        client.end();
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
      reject();
    });

    connectingTimeout = setTimeout(() => {
      if (logging) {
        console.log(
          `scanHost->force timeout->host: ${hostIP} port: ${hostPort}`
        );
      }

      client.destroy();
      reject();
    }, timeout + 10);
  });
};

export default scanHost;
