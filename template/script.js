$('#file').on('change', (e) => {
  const reads = new FileReader()
  const f = $('#file')[0].files[0]
  reads.readAsDataURL(f)
  reads.onload = function () {
    document.getElementById('preview').src = this.result
    $('.preview-wrap').css('display', 'block')
    $('.btns').css('display', 'block')
  }
})

// 加水印
$('.btns span')
  .eq(0)
  .on('click', () => {
    try {
      const file = $('#file')[0].files[0]
      console.log(file)
      const formData = new FormData()
      formData.append(file.name, file)
      const pwd = $('#pwd').val()
      const info = $('#info').val()
      if (!info) {
        return alert('请输入水印信息')
      }
      if (!pwd) {
        return alert('请输入水印密码')
      }
      const onProgress = (event) => {
        document.querySelector('.progress span').style.width =
          event.percent + '%'
      }
      $('.loading').show()
      const onSuccess = async ({ fileData, fileName }) => {
        $('.loading').hide()
        const zip = new JSZip()
        await zip.loadAsync(fileData, { base64: true })
        const blob = await zip.generateAsync({ type: 'blob' })
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
        onError: () => {
          alert('添加水印失败')
          $('.loading').hide()
        },
        params: {
          info,
          pwd,
        },
      })
    } catch {
      alert('添加水印失败')
      $('.loading').hide()
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
      return alert('请输入水印密码')
    }
    const size = $('#size').val()
    if (!size) {
      return alert('请输入水印形状')
    }
    $('.loading').show()
    const onSuccess = ({ watermarkInfo, err }) => {
      $('.loading').hide()
      if (err) {
        return alert(err)
      }
      alert(`你的水印信息是：${watermarkInfo}`)
    }
    getInfo({
      formData,
      onSuccess,
      onError: () => {
        alert('获取信息失败')
        $('.loading').hide()
      },
      params: {
        pwd,
        size,
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

const reset = () => {
  $('#file')[0].value = null
  $('#info')[0].value = null
  $('#pwd')[0].value = null
  $('#size')[0].value = null
  $('.preview-wrap')[0].src = ''
  $('.preview-wrap').css('display', 'none')
  $('.btns').css('display', 'none')
}

// 切换类型
$('.check-wrap').on('click', (e) => {
  const $ev = $(e.currentTarget)
  const name = $ev.data('name')
  $ev.addClass('actived')
  $ev.siblings().removeClass('actived')
  reset()
  if (name === 'extract') {
    $('.btns').removeClass('embed').addClass(name)
    $('.input-wrap').eq(0).css('display', 'none')
    $('.input-wrap').eq(2).css('display', 'flex')
  }
  if (name === 'embed') {
    $('.btns').removeClass('extract').addClass(name)
    $('.input-wrap').eq(0).css('display', 'flex')
    $('.input-wrap').eq(2).css('display', 'none')
  }
})

$('.check-wrap').eq(0).click()
