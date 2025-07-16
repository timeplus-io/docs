const fs = require("fs");
const path = require("path");

// Path to the docs folder
const docsFolder = path.join(__dirname, "docs");

// Updated regular expression to find links that do not start with http, https, /, #, or mailto
const regex = /\[(.*?)\]\((?!https?:\/\/|\/|#|mailto:)(.*?)\)/g;

// Function to process each markdown file
const processFile = (filePath) => {
  // Read the file content
  const content = fs.readFileSync(filePath, "utf8");

  // Replace the markdown links
  const updatedContent = content.replace(regex, (match, text, link) => {
    return `[${text}](/${link})`;
  });

  // Save the updated content back to the file
  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated file: ${filePath}`);
};

// Function to iterate over all .md and .mdx files in the docs folder
const processDocsFolder = (folderPath) => {
  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);

    // Check if it's a markdown or mdx file
    if (
      fs.lstatSync(filePath).isFile() &&
      (file.endsWith(".md") || file.endsWith(".mdx"))
    ) {
      processFile(filePath);
    }
  });
};

// Process all files in the docs folder
processDocsFolder(docsFolder);

console.log("All .md and .mdx files updated in the docs folder.");
