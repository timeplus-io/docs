const newWords = [
  "aggregate",
  "aggregation",
  "alert",
  "alerts",
  "and",
  "asof",
  "ast",
  "batch",
  "clear",
  "date",
  "date32",
  "date64",
  "datetime",
  "datetime32",
  "datetime64",
  "deduplicate",
  "dictionaries",
  "dictionary",
  "disks",
  "double",
  "emit",
  "estimate",
  "events",
  "external",
  "family",
  "final",
  "float",
  "float128",
  "float32",
  "float64",
  "format",
  "functions",
  "in",
  "int",
  "int128",
  "int16",
  "int32",
  "int64",
  "int8",
  "javascript",
  "leader",
  "like",
  "materialize",
  "materialized",
  "mutable",
  "not",
  "or",
  "pause",
  "per",
  "pipeline",
  "python",
  "query",
  "random",
  "recover",
  "remote",
  "reset",
  "resume",
  "schemas",
  "setting",
  "settings",
  "source",
  "stream",
  "streams",
  "string",
  "syntax",
  "system",
  "timeout",
  "transfer",
  "ttl",
  "uint",
  "uint128",
  "uint16",
  "uint32",
  "uint64",
  "uint8",
].map((word) => {
  return word.toLowerCase();
});

module.exports = function prismIncludeLanguages(Prism) {
  if (Prism.languages.sql) {
    const keywordPattern = Prism.languages.sql["keyword"];

    // If it's a regex, convert to string, add new keywords, and recompile
    if (keywordPattern instanceof RegExp) {
      const patternStr = keywordPattern.source.replace(
        /\)\\b$/,
        `|${newWords.join("|")})\\b`,
      );
      Prism.languages.sql["keyword"] = new RegExp(
        patternStr,
        keywordPattern.flags,
      );
    } else if (Array.isArray(keywordPattern)) {
      newWords.forEach((word) => {
        keywordPattern.push(word);
      });
    }
  }
};
