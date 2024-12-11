import axios from 'axios';

const serverBaseUrl = 'http://localhost:8080';

async function getSnapshot() {
  const url = new URL('/api/snapshot', serverBaseUrl);
  url.searchParams.append('folder', 'snapshots/vite-react');
  console.log('Getting snapshot: %s', url.toString());
  const { data } = await axios.get(url.toString(), {
    responseType: 'arraybuffer',
  });
  return data;
}

function createFile(contents) {
  return {
    file: {
      contents,
    }
  }
}

function createDirectory(files) {
  return {
    directory: files,
  }
}

export {
  getSnapshot,
  createFile,
  createDirectory,
}