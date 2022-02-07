const express = require('express');
const path = require('path');
const multer = require('multer');
const child_process = require('child_process');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const JSZip = require('jszip');

const app = express();

//跨域请求cors
// app.use(
//   cors({
//     origin: '*',
//     credentials: true,
//   }),
// );
app.use('/water-mark-server', express.static('template'));

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

// 加水印
app.post('/water-mark-server/upload', upload.any(), async function (req, res) {
  const { path: filePath, filename } = req.files[0];
  const embedPath = `embed/${filename}`;
  const delFile = () => {
    fs.unlinkSync(filePath);
    fs.unlinkSync(embedPath);
  };
  try {
    // 保存水印图片路径
    const { stdout } = await exec('embed', req.query, filePath, embedPath);
    // 水印形状
    const watermarkSize = parseFloat(
      stdout.split('Put down watermark size: ')[1],
    );
    const zip = new JSZip();
    const folder = zip.folder('watermark');
    folder.file(
      `size_${uuidv4()}.txt`,
      `你的水印密码是：${req.query.pwd}；
      你的水印形状是：${watermarkSize}；
      解密的时候需要填写此参数`,
    );
    folder.file(filename, fs.readFileSync(embedPath));
    zip
      .generateAsync({ type: 'base64' })
      .then((content) => {
        delFile();
        res.status(200).send({ fileData: content, fileName: 'watermark.zip' });
      })
      .catch((err) => {
        delFile();
        console.log(err);
        res.status(500).send({});
      });
  } catch (err) {
    fs.unlinkSync(filePath);
    console.log(err);
    res.status(500).send({});
  }
});

// 获取水印信息
app.post('/water-mark-server/get-info', upload.any(), async (req, res) => {
  const { path: filePath, filename } = req.files[0];
  const extractPath = `imgs/${filename}`;
  try {
    const { stdout } = await exec('extract', req.query, filePath, extractPath);
    const txt = stdout.split('Extract succeed! watermark is:\n')[1];
    const watermarkInfo = txt.replace('\n', '');
    fs.unlinkSync(extractPath);
    res.send({
      watermarkInfo,
    });
  } catch {
    fs.unlinkSync(extractPath);
    res.status(500).send({
      err: '获取信息失败',
    });
  }
});

// 执行python命令
const exec = (type, params, inputFilePath, embedFile) => {
  return new Promise((resolve, reject) => {
    let order = '';
    if (type === 'embed') {
      order += 'blind_watermark --embed ';
      order += `--pwd ${params.pwd} `;
      order += `"${inputFilePath}" `;
      order += `${params.info} `;
      order += `"${embedFile}"`;
    } else {
      order += `blind_watermark --extract --wm_shape ${params.size} `;
      order += `--pwd ${params.pwd} `;
      order += `"${inputFilePath}"`;
    }
    child_process.exec(order, function (error, stdout, stderr) {
      if (error) {
        console.log(error);
        reject({});
      }
      resolve({
        stdout,
        stderr,
      });
    });
  });
};

app.listen(3002, '0.0.0.0', function () {});
