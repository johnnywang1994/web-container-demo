import { snapshot } from '@webcontainer/snapshot'
import express from 'express'
import asyncHandler from 'express-async-handler'
import cors from 'cors'

const app = express()

app.use(cors())

app.get('/api/test', (req, res) => {
  res.send('Hello world!').end()
})

app.get('/api/snapshot', asyncHandler(async (req, res) => {
  console.log(req.query)
  const { folder: SOURCE_CODE_FOLDER } = req.query
  const folderSnapshot = await snapshot(SOURCE_CODE_FOLDER)
  res
    .setHeader('content-type', 'application/octet-stream')
    .send(folderSnapshot)
}))

app.listen(8080, () => console.log('Server running on port 8080'));
