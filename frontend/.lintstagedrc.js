module.exports = {
  "**/*.{js,jsx,ts,tsx}": (filenames) => {
    const filteredFiles = filenames.filter(
      (file) => !file.startsWith("public/")
    );
    if (filteredFiles.length === 0) return [];
    return [
      `eslint --fix ${filteredFiles.join(" ")}`,
      `prettier --write ${filteredFiles.join(" ")}`,
    ];
  },
  "**/*.{css,scss,md}": (filenames) => {
    const filteredFiles = filenames.filter(
      (file) => !file.startsWith("public/")
    );
    if (filteredFiles.length === 0) return [];
    return [`prettier --write ${filteredFiles.join(" ")}`];
  },
};
