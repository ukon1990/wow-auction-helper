export const safeifyString = (str: string) => {
  return str
    .replace(/[\']/g, "\'").replace(/[\"]/g, "\\\"")
    .replace(/\\\\\"/g, "\\\\\\\"");
};

