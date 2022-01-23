$('#file').on('change', (e) => {
  const reads = new FileReader()
  const f = $('#file')[0].files[0]
  reads.readAsDataURL(f)
  reads.onload = function () {
    document.getElementById('preview').src = this.result
    $('#preview').css('display', 'block')
  }
})

// 加水印
$('.btns span')
  .eq(0)
  .on('click', () => {
    try {
      const file = $('#file')[0].files[0]

      const formData = new FormData()
      formData.append(file.name, file)
      const pwd = $('#pwd').val()
      const info = $('#info').val()
      if (!info) {
        alert('请输入水印信息')
      }
      if (!pwd) {
        alert('请输入水印密码')
      }
      const onProgress = (event) => {
        document.querySelector('.progress span').style.width =
          event.percent + '%'
      }
      const onSuccess = ({ fileData, fileName }) => {
        const view = new Uint8Array(new ArrayBuffer(fileData.data.length))
        for (var i = 0; i < fileData.data.length; ++i) {
          view[i] = fileData.data[i]
        }
        const blob = new Blob([view], {
          type: 'image/jpeg,image/jpg,image/png',
        })
        const downloadElement = document.createElement('a')
        const href = window.URL.createObjectURL(blob) //创建下载的链接
        downloadElement.href = href
        downloadElement.download = fileName //下载后文件名
        document.body.appendChild(downloadElement)
        downloadElement.click() //点击下载
        document.body.removeChild(downloadElement) //下载完成移除元素
        window.URL.revokeObjectURL(href) //释放掉blob对象
      }
      upload({
        formData,
        onProgress,
        onSuccess,
        params: {
          info,
          pwd,
        },
      })
    } catch {
      alert('请重新上传图片')
    }
  })

// 提取信息
$('.btns span')
  .eq(1)
  .on('click', () => {
    const file = $('#file')[0].files[0]
    const formData = new FormData()
    formData.append(file.name, file)
    const pwd = $('#pwd').val()
    if (!pwd) {
      alert('请输入水印密码')
    }
    const onSuccess = () => {}
    getInfo({
      formData,
      onSuccess,
      params: {
        pwd,
      },
    })
  })

document.getElementById('file').onchange = function () {
  const fileList = this.files,
    formData = new FormData()
  Array.prototype.forEach.call(fileList, function (file) {
    formData.append(file.name, file)
  })
  // 当上传的数据为 file 类型时，请求的格式类型自动会变为 multipart/form-data, 如果头部格式有特定需求，在我的 http 函数中传入 headers<Object> 即可，大家可自己查看，我这里没有什么特殊处理所以就不传了
}

// 切换类型
$('.check-wrap').on('click', (e) => {
  const $ev = $(e.currentTarget)
  const name = $ev.data('name')
  $ev.find('.radio').text('✅')
  $ev.siblings().find('.radio').text('')
  if (name === 'extract') {
    $('.btns').removeClass('embed').addClass(name)
    $('.input-wrap').eq(0).css('display', 'none')
  }
  if (name === 'embed') {
    $('.btns').removeClass('extract').addClass(name)
    $('.input-wrap').eq(0).css('display', 'flex')
  }
})

$('.check-wrap').eq(0).click()
