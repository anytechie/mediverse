export function parseInitData(str: string): any {
  const parts = str.split("&");
  const result = {};

  for (const part of parts) {
    const [key, value] = part.split("=");
    try {
      // Decode the URI component and then try to parse it as JSON
      result[key] = JSON.parse(decodeURIComponent(value));
    } catch (e) {
      // If it's not JSON, just decode it as a URI component
      result[key] = decodeURIComponent(value);
    }
  }

  return result;
}
