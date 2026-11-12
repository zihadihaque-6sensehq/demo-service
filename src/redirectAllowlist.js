export const isAllowedRedirectUri = (uri, allowlist) => {
  if (typeof uri !== "string" || uri.length === 0) {
    return false;
  }
  if (allowlist.size === 0) {
    return false;
  }
  return allowlist.has(uri);
};

export const isAllowedReturnUrl = (url, allowlist) => {
  if (typeof url !== "string" || url.length === 0) {
    return false;
  }
  if (allowlist.size === 0) {
    return false;
  }
  return allowlist.has(url);
};
