const { sendTextMessage } = require("./services/whatsappService");
const { getLogger } = require("./utils/logger");
const logger = getLogger("church_message_handler");

const members = {}; // simple memory store

async function handleIncomingMessage(data) {
  try {
    for (const entry of data.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const messages = value.messages || [];
        if (!messages.length) continue;

        const msg = messages[0];
        const sender = msg.from;
        const type = msg.type;
        const text = type === "text" ? msg.text.body.trim().toLowerCase() : "";

        // Registration flow
        if (!members[sender]) {
          members[sender] = { stage: "new" };
          await sendTextMessage(
            sender,
            "🙏 Welcome to *Church on the Rock*! Please share your *first name* to get started."
          );
          continue;
        }

        const user = members[sender];

        if (user.stage === "new") {
          user.name = msg.text.body.trim();
          user.stage = "email";
          await sendTextMessage(sender, `Thanks ${user.name}! Please share your *email address*.`);
          continue;
        }

        if (user.stage === "email") {
          user.email = msg.text.body.trim();
          user.stage = "menu";
          await sendTextMessage(
            sender,
            `🎉 Great! You’re now registered.\n\n*Main Menu*\n1️⃣ Church Info\n2️⃣ Prayer Request\n3️⃣ Donate / Offerings\n4️⃣ Sermon Replay 🎥\n5️⃣ Events & Check-in 🎟️`
          );
          continue;
        }

        // Menu options
        if (["1", "church info", "about"].includes(text)) {
          await sendTextMessage(
            sender,
            `🏠 *Church on the Rock*\nChurch on the Rock is a multicultural family of believers with a passion to impact communities locally and globally..\n\n
            join us in person every Sunday at 10 am
            \n4548 Sheppard Avenue East,Scarborough,\nON M1S1V2(SDA Church building)
            \n\n🕘 *Service Times:*\nSunday 10:00 AM – 11:30 AM\nWednesday Bible Study 7:00 PM\n\n
            Prayer link and ID for all Zoom Prayers
            \n Meeting ID: 416 409 6248
            \nPassword is 900550
            \n\n📱 Follow us:\nInstagram | YouTube | Facebook`
          );
          continue;
        }

        if (["2", "prayer", "prayer request"].includes(text)) {
          user.stage = "prayer";
          await sendTextMessage(sender, "🙏 Please share your prayer request details.");
          continue;
        }

        if (["3", "donate", "offering", "tithe"].includes(text)) {
          await sendTextMessage(
            sender,
            `💒 *Donation Options:*\n• e-Transfer: donate@churchontherock.ca\n• Bank Transfer: Details on request\n• In-person: Sundays 10:00–11:30 AM\n\n💌 Tax receipts available upon request.`
          );
          continue;
        }

        if (["4", "sermon", "sermon replay"].includes(text)) {
          await sendTextMessage(
            sender,
            `🎥 *Latest Sermon:*\n"Worship & Miracle Night" — Watch now: https://www.youtube.com/@churchontherockinternation6917/streams`
          );
          continue;
        }

        if (["5", "events", "check-in"].includes(text)) {
          await sendTextMessage(
            sender,
            `🎟️ *Upcoming Events:*\n• Youth Night — Oct 20\n• Baptism Sunday — Nov 3\n\nScan the QR at the entrance to check-in!\nAfter the event, we’ll share the sermon link automatically 🙌`
          );
          continue;
        }

        if (user.stage === "prayer") {
          await sendTextMessage(
            sender,
            "🙏 Thank you! Your prayer request has been forwarded to our Prayer Team."
          );
          user.stage = "menu";
          continue;
        }

        // Default
        await sendTextMessage(
          sender,
          "💬 Please reply with one of these options:\n1️⃣ Church Info\n2️⃣ Prayer Request\n3️⃣ Donate / Offerings\n4️⃣ Sermon Replay\n5️⃣ Events & Check-in"
        );
      }
    }
    return { status: "ok" };
  } catch (err) {
    logger.error(`handleIncomingMessage error: ${err}`);
    return { status: "error" };
  }
}

module.exports = { handleIncomingMessage };
