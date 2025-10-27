const axios = require("axios");
const { META_ACCESS_TOKEN, META_PHONE_NUMBER_ID } = require("../config/credentials");

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${META_PHONE_NUMBER_ID}/messages`;

async function sendTextMessage(to, text) {
  try {
    await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      },
      {
        headers: { Authorization: `Bearer ${META_ACCESS_TOKEN}` },
      }
    );
  } catch (err) {
    console.error("❌ WhatsApp send error:", err.response?.data || err.message);
  }
}

module.exports = { sendTextMessage };
