export class InputError extends Error {
  status = 400;
}

export function objectBody(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InputError('请求内容必须是 JSON 对象');
  return value;
}

export function normalizeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) throw new InputError('Immich 服务器地址不能为空');
  let text = value.trim();
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(text)) text = 'http://' + text;
  let url;
  try { url = new URL(text); } catch { throw new InputError('Immich 服务器地址无效'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new InputError('服务器地址仅支持 HTTP(S)，不能包含用户名、密码、查询参数或片段');
  }
  return url.toString().replace(/\/+$/, '').replace(/\/api$/i, '');
}

export function numberOption(value, fallback, min, max, name, integer = false) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) {
    throw new InputError(`${name} 必须是 ${min}–${max} 范围内的${integer ? '整数' : '数字'}`);
  }
  return number;
}

export function pagination({ page, size } = {}) {
  return {
    page: numberOption(page, 1, 1, 1000000, '页码', true),
    size: numberOption(size, 60, 1, 200, '每页数量', true)
  };
}

export function frameOptions({ maxFrames, frameInterval } = {}) {
  return {
    maxFrames: numberOption(maxFrames, 12, 1, 30, '抽帧数量', true),
    frameInterval: numberOption(frameInterval, 2, 0.5, 60, '采样间隔')
  };
}

export function assetId(value) {
  if (typeof value !== 'string' || !/^[a-z\d_-]{1,128}$/i.test(value)) throw new InputError('asset id 无效');
  return value;
}

export function validateKey(value, allowEmpty = false) {
  if (typeof value !== 'string') throw new InputError('API Key 必须是字符串');
  const key = value.trim();
  if (!key && !allowEmpty) throw new InputError('Immich API Key 不能为空');
  if (key && /[^\x21-\x7e]/.test(key)) throw new InputError('API Key 只能包含可见 ASCII 字符，不能包含空格或换行');
  return key;
}
