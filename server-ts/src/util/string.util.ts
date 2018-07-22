export const safeifyString = (str) => {
  return str
    .replace(/[\']/g, "\'").replace(/[\"]/g, "\\\"")
    .replace(/\\\\\"/g, "\\\\\\\"");
};

