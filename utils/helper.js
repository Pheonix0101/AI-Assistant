const fs = require("fs");
const path = require("path");

let interactionHistory = [];

function logInteraction(question, answer) {
  // Ensure only the last 25 messages are retained
  if (interactionHistory.length >= 25) {
    interactionHistory.shift();
  }

  interactionHistory.push({ question, answer });
}

function getInteractionHistory() {
  return interactionHistory;
}

const deleteUploadsFiles = (directoryPath) => {
  try {
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      fs.unlinkSync(filePath);
    });

    console.log(`All files in ${directoryPath} have been deleted.`);
  } catch (error) {
    console.error(`Error deleting files in ${directoryPath}:`, error);
  }
};

module.exports = { deleteUploadsFiles, logInteraction, getInteractionHistory };
