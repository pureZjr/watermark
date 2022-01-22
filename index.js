const express = require('express');
const path = require('path');
const multer = require('multer');
const child_process = require('child_process');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();

//跨域请求cors
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.static('template'));

// 自定义 multer 的 diskStorage 的存储目录与文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'imgs');
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}_${file.fieldname}`);
  },
});

const upload = multer({ storage: storage });

// 页面渲染
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'view/upload.html'));
});

// 上传文件
app.post('/upload', upload.any(), async function (req, res) {
  const { path: filePath, filename } = req.files[0];
  const successInfo = await exec(
    'embed',
    req.query,
    filePath,
    `output/${filename}`,
  );
  fs.unlinkSync(filePath);
  res.send({ message: '上传成功' });
});

// 加密
app.post('');

// 解密

// 执行python命令
const exec = (type, params, inputFilePath, outputFile) => {
  return new Promise((resolve, reject) => {
    let order = '';
    if (type === 'embed') {
      order += 'blind_watermark --embed ';
      if (params.pwd) {
        order += `--pwd "${params.pwd}" `;
      }
      order += `"${inputFilePath}" `;
      if (params.info) {
        order += `"${params.info}" `;
      }
      order += `"${outputFile}"`;
    }
    child_process.exec(order, function (error, stdout, stderr) {
      if (error) {
        reject({});
      }
      resolve({
        stdout,
        stderr,
      });
    });
  });
};

app.listen(3002, '127.0.0.1', function () {});
