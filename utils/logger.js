function getLogger(context) {
  return {
    info: (msg) => console.log(`[INFO] [${context}] ${msg}`),
    error: (msg) => console.error(`[ERROR] [${context}] ${msg}`),
  };
}
module.exports = { getLogger };
