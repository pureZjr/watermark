const express = require('express')
const path = require('path')
const multer = require('multer')
const child_process = require('child_process')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')

const app = express()

//跨域请求cors
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
)
app.use(express.static('template'))

// 自定义 multer 的 diskStorage 的存储目录与文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'imgs')
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}_${file.fieldname}`)
  },
})

const upload = multer({ storage: storage })

// 页面渲染
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'view/upload.html'))
})

// 加水印
app.post('/upload', upload.any(), async function (req, res) {
  const { path: filePath, filename } = req.files[0]
  const embedPath = `embed/${filename}`
  await exec('embed', req.query, filePath, embedPath)
  const fileData = fs.readFileSync(embedPath)
  fs.unlinkSync(filePath)
  fs.unlinkSync(embedPath)
  res.send({
    fileData,
    fileName: `water_mark_${filename}`,
  })
})

// 获取水印信息
app.post('/get-info', upload.any(), async (req, res) => {
  const { path: filePath, filename } = req.files[0]
  const extractPath = `imgs/${filename}`
  const info = await exec('extract', req.query, filePath, extractPath)
  fs.unlinkSync(extractPath)
  console.log(info, req.data)
})

// 执行python命令
const exec = (type, params, inputFilePath, embedFile) => {
  return new Promise((resolve, reject) => {
    let order = ''
    if (type === 'embed') {
      order += 'blind_watermark --embed '
      order += `--pwd ${params.pwd} `
      order += `"${inputFilePath}" `
      order += `${params.info} `
      order += `"${embedFile}"`
    } else {
      order += 'blind_watermark --extract --wm_shape 111 '
      order += `--pwd ${params.pwd} `
      order += `"${inputFilePath}"`
    }
    console.log(order)
    child_process.exec(order, function (error, stdout, stderr) {
      if (error) {
        console.log(error)
        reject({})
      }
      resolve({
        stdout,
        stderr,
      })
    })
  })
}

app.listen(3002, '127.0.0.1', function () {})
