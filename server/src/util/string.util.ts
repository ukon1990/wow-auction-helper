export const safeifyString = (str: string) => {
  if (str) {
    return str
      .replace(/[\']/g, '\'').replace(/[\"]/g, '\\\"')
      .replace(/\\\\\"/g, '\\\\\\\"');
  }
  return str;
};

