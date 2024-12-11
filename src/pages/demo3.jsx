import { useState, useRef, useEffect, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Xterm } from 'xterm-react';
import { getSnapshot } from '@/lib/webcontainer';

/**
 * Demo3: Run a Vite React app in a web container
 * - Get snapshot as arraybuffer from server
 * - Mount snapshot
 * - Sync web container process output to Xterm
 * - Run `npm install`
 * - Run `npm run start`
 * - Bind Xterm command with web container jsh writer
 */

function Demo3() {
  const webContainerRef = useRef();
  const [xterm, setXterm] = useState();
  const [iframeUrl, setIframeUrl] = useState('');

  const handleInitXterm = (term) => {
    setXterm(term);
  };

  const handleDisposeXterm = () => {
    setXterm(null);
  };

  const startShell = useCallback(async () => {
    const { current: webcontainer } = webContainerRef;

    // Start jsh shell in web container
    // print output to xterm
    const shellProcess = await webcontainer.spawn('jsh');
    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          xterm.write(data);
        },
      })
    );

    // Bind xterm command to web container jsh writer
    const jshInput = shellProcess.input.getWriter();
    xterm.onData((data) => {
      jshInput.write(data);
    });
  }, [xterm]);

  const initWebContainer = useCallback(async () => {
    // Get snapshot
    const snapshot = await getSnapshot();

    // Call only once
    const webContainer = await WebContainer.boot();
    webContainerRef.current = webContainer;

    // mount files
    await webContainer.mount(snapshot);

    // Prepare to display iframe after server is ready
    // we will install dependency / start vite server manually inside terminal
    webContainer.on('server-ready', (port, url) => {
      setIframeUrl(url);
    });

    // Start jsh shell for interactivity with terminal
    startShell();
  }, [getSnapshot, startShell]);

  const initApp = useCallback(async () => {
    try {
      await initWebContainer();
    } catch (error) {
      console.error('Error:', error);
    }
  }, [initWebContainer]);

  useEffect(() => {
    if (xterm) {
      initApp();
    }
  }, [xterm, initApp]);

  return (
    <div className="px-6 py-4">
      Below is Xterm:
      <Xterm
        onInit={handleInitXterm}
        onDispose={handleDisposeXterm}
      />
      Below is a iframe:
      {iframeUrl && (
        <iframe src={iframeUrl} className="w-full h-[500px] border-2" />
      )}
    </div>
  );
}

export default Demo3;
