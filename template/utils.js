const http = function (option) {
  // 过滤请求成功后的响应对象
  function getBody(xhr) {
    const text = xhr.responseText || xhr.response;
    if (!text) {
      return text;
    }

    try {
      return JSON.parse(text);
    } catch (err) {
      return text;
    }
  }

  const xhr = new XMLHttpRequest();
  // 自定义 beforeSend 函数
  if (option.beforeSend instanceof Function) {
    if (option.beforeSend(xhr) === false) {
      return false;
    }
  }

  xhr.onreadystatechange = function () {
    if (xhr.status === 200) {
      if (xhr.readyState === 4) {
        // 成功回调
        option.onSuccess(getBody(xhr));
      }
    }
  };

  // 请求失败
  xhr.onerror = function (err) {
    option.onError(err);
  };

  xhr.open(option.type, option.url, true);

  // 当请求为上传文件时回调上传进度
  if (xhr.upload) {
    xhr.upload.onprogress = function (event) {
      if (event.total > 0) {
        event.percent = (event.loaded / event.total) * 100;
      }
      // 监控上传进度回调
      if (option.onProgress instanceof Function) {
        option.onProgress(event);
      }
    };
  }

  // 自定义头部
  const headers = option.headers || {};
  for (const item in headers) {
    xhr.setRequestHeader(item, headers[item]);
  }

  xhr.send(option.data);
};

const upload = ({ formData, onProgress, onSuccess, params, onError }) => {
  params = $.param(params);
  http({
    type: 'POST',
    url: `/upload?${params}`,
    data: formData,
    onProgress,
    onSuccess,
    onError,
  });
};

const getInfo = ({ formData, onProgress, onSuccess, params, onError }) => {
  params = $.param(params);
  http({
    type: 'POST',
    url: `/get-info?${params}`,
    data: formData,
    onProgress,
    onSuccess,
    onError,
  });
};
