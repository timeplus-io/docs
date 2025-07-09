const newWords = ["materialized"].map((word) => {
  return word.toLowerCase();
});

module.exports = function prismIncludeLanguages(Prism) {
  if (Prism.languages.sql) {
    const keywordPattern = Prism.languages.sql["keyword"];

    // If it's a regex, convert to string, add new keywords, and recompile
    if (keywordPattern instanceof RegExp) {
      const patternStr = keywordPattern.source.replace(
        /\)\\b$/,
        `|${newWords.join("|")})\\b`
      );
      Prism.languages.sql["keyword"] = new RegExp(
        patternStr,
        keywordPattern.flags
      );
    } else if (Array.isArray(keywordPattern)) {
      newWords.forEach((word) => {
        keywordPattern.push(word);
      });
    }
  }
};
