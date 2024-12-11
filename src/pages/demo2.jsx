import { useState, useRef, useEffect, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { getSnapshot } from '@/lib/webcontainer';

/**
 * Demo2: Run a Vite server in a web container
 * - Get snapshot as arraybuffer from server
 * - Mount snapshot
 * - Sync file contents from web container
 * - Run `npm install`
 * - Run `npm run start`
 * - Update App.tsx in web container
 */

const printProcess = (process) => {
  process.output.pipeTo(new WritableStream({
    write(data) {
      console.log(data);
    }
  }));
};

function Demo2() {
  const webContainerRef = useRef();
  const [iframeUrl, setIframeUrl] = useState('');
  const [appContents, setAppContents] = useState('');

  const syncFileApp = useCallback(async () => {
    const { current: webContainer } = webContainerRef;
    // read App.tsx from web container
    const contents = await webContainer.fs.readFile('/src/App.tsx', {
      encoding: 'utf-8',
    });
    setAppContents(contents);
  }, []);

  const handleChangeFileApp = async (e) => {
    const { current: webContainer } = webContainerRef;
    setAppContents(e.target.value);

    // update App.tsx to web container
    // this will trigger Vite to hot reload the app
    await webContainer.fs.writeFile('/src/App.tsx', e.target.value);
  };

  const initApp = useCallback(async () => {
    // Get snapshot
    const snapshot = await getSnapshot();

    // Call only once
    const webContainer = await WebContainer.boot();
    webContainerRef.current = webContainer;

    // mount files
    await webContainer.mount(snapshot);

    // sync file app contents
    await syncFileApp();

    // `npm install`
    console.log('Installing...');
    const installProcess = await webContainer.spawn('npm', ['install']);
    // print process output to console
    printProcess(installProcess);

    // wait for install process to exit
    const installExitCode = await installProcess.exit;
    if (installExitCode !== 0) {
      throw new Error('Unable to run npm install');
    }

    // `npm run start`
    console.log('Starting dev Server...');
    const startProcess = await webContainer.spawn('npm', ['run', 'start']);
    printProcess(startProcess);

    // Wait for `server-ready` event
    webContainer.on('server-ready', (port, url) => {
      setIframeUrl(url);
    });
  }, [getSnapshot, syncFileApp, ]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  return (
    <div className="px-6 py-4">
      Below is App.tsx:
      <textarea
        className="block w-full border-2"
        value={appContents}
        onChange={handleChangeFileApp}
        rows="14"
      />
      Below is a iframe:
      {iframeUrl && (
        <iframe src={iframeUrl} className="w-full h-[500px] border-2" />
      )}
    </div>
  );
}

export default Demo2;
