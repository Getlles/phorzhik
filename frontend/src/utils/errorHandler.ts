export const getResponseError = async (response: Response, defaultMessage: string): Promise<string> => {
  try {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return `${defaultMessage} (Код: ${response.status}). Сервер вернул некорректный ответ.`;
    }

    const data = await response.json();
    if (data && data.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            const msg = err.msg || 'некорректное значение';
            return field ? `Поле "${field}": ${msg}` : msg;
          })
          .join('; ');
      }
    }
    return defaultMessage;
  } catch (e) {
    return `${defaultMessage} (Код: ${response.status})`;
  }
};