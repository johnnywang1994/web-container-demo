import { useState, useRef, useEffect, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { createFile } from '@/lib/webcontainer';

/**
 * Demo1: Run a simple Nodejs server in a web container
 * - Mount index.html and server.js files
 * - Start a Nodejs server
 * - Display the server output in iframe
 * - Print the server process output in DevTools
 * - Update index.html file in real-time
 * - Use WebContainer API to interact with the web container
 * - Kill and Restart server process on file change
 */

// files to be mounted in web containers
const files = {
  'index.html': createFile(`<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demo1</title>
  </head>
  <body>
    <div className="text-red-500">Hello Web Container</div>
  </body>
</html>`),

  'server.js': createFile(`
const { createServer } = require('http');
const fs = require('fs');

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html'});
  const html = fs.readFileSync('./index.html');
  res.end(html);
});

server.listen(3000, '127.0.0.1');
console.log('server listen on port: 3000');
`),
};

const SYNC_DELAY = 500; // ms

let timer = null;

function Demo1() {
  const webContainerRef = useRef();
  const processRef = useRef();
  const [iframeUrl, setIframeUrl] = useState('');
  const [indexHtml, setIndexHtml] = useState(files['index.html'].file.contents);

  const startServer = useCallback(async () => {
    const { current: webContainer } = webContainerRef;

    // kill previous process if exists
    processRef.current?.kill();

    // Run Nodejs server
    const process = await webContainer.spawn('node', ['server.js']);
    processRef.current = process;

    // print process output to console
    process.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }));
  }, []);

  const handleChangeIndexHtml = async (e) => {
    const { current: webContainer } = webContainerRef;
    setIndexHtml(e.target.value);

    clearTimeout(timer);
    timer = setTimeout(async () => {
      // update index.html file to web container
      await webContainer.fs.writeFile('/index.html', e.target.value);
      // restart server
      startServer();
    }, SYNC_DELAY);
  };

  const initApp = useCallback(async () => {
    // Call only once
    const webContainer = await WebContainer.boot();
    webContainerRef.current = webContainer;

    // mount files
    await webContainer.mount(files);

    await startServer();

    // Wait for `server-ready` event
    webContainer.on('server-ready', (port, url) => {
      setIframeUrl(url);
    });
  }, [startServer]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  return (
    <div className="px-6 py-4">
      Below is a HTML:
      <textarea
        className="block w-full border-2"
        value={indexHtml}
        onChange={handleChangeIndexHtml}
        rows="14"
      />
      Below is a iframe:
      {iframeUrl && (
        <iframe src={iframeUrl} className="w-full h-[500px] border-2" />
      )}
    </div>
  );
}

export default Demo1;
