$('#file').on('change', (e) => {
  console.log(e);
});

$('.btns span')
  .eq(0)
  .on('click', () => {
    try {
      const file = $('#file')[0].files[0];

      const formData = new FormData();
      formData.append(file.name, file);
      const pwd = $('#pwd').val();
      const info = $('#info').val();
      const onProgress = (event) => {
        document.querySelector('.progress span').style.width =
          event.percent + '%';
      };
      const onSuccess = (data) => {
        console.log(data);
      };
      upload({
        formData,
        onProgress,
        onSuccess,
        type: 'embed',
        params: {
          info,
          pwd,
        },
      });
    } catch {
      alert('请重新上传图片');
    }
  });

$('.btns span')
  .eq(1)
  .on('click', () => {});

// 取消
$('.btns span')
  .eq(2)
  .on('click', () => {});

document.getElementById('file').onchange = function () {
  const fileList = this.files,
    formData = new FormData();
  Array.prototype.forEach.call(fileList, function (file) {
    formData.append(file.name, file);
  });
  // 当上传的数据为 file 类型时，请求的格式类型自动会变为 multipart/form-data, 如果头部格式有特定需求，在我的 http 函数中传入 headers<Object> 即可，大家可自己查看，我这里没有什么特殊处理所以就不传了
};

// 切换类型
$('.radio-wrap input').on('change', (e) => {});
