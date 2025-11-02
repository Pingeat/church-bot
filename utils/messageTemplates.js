const contactBlock = `
📍 4548 Sheppard Ave E, Scarborough, ON M1S 1V2
⏰ Sundays 10:00 AM – 11:30 AM
📞 +1 833-262-7625
🌐 Google Maps: https://maps.app.goo.gl/Lb6JK2wy7F9Q3qsU9
`;

const socialBlock = `
📱 Follow us online:
• Instagram: @churchontherock_
• YouTube: https://www.youtube.com/@churchontherockinternation6917
• Facebook: https://www.facebook.com/peopleontherock/about
`;

const templates = {
  welcomeIntro: () =>
    "🙏 Welcome to *Church on the Rock*! I'm Ava, your digital host here on WhatsApp.",

  askFirstName: () =>
    "I'd love to get to know you. What’s your *first name* so I can personalize your experience?",

  askEmail: (name) =>
    `Thanks, ${name}! Could you share your *email address*? We'll only use it for event updates, resources, and personalized care.`,

  registrationComplete: (name) =>
    `🎉 Amazing, ${name}! You're now part of the Church on the Rock family. Here's how I can support you today:`,

  menu: () =>
    `📋 *Main Menu*
1️⃣ Church Info
2️⃣ Prayer Request
3️⃣ Donate / Offerings
4️⃣ Sermon Replay 🎥
5️⃣ Events & Check-in 🎟️

You can also reply:
• *Verse* for today's scripture
• *Sermon updates* to stay notified
• *Menu* to see this list again`,

  churchInfo: () =>
    `🏠 * Church On The Rock*
Church on the Rock is a multicultural family of believers with a passion to impact communities locally and globally.

🕘 *Service Gatherings*
• Sundays 10:00 AM – 11:30 AM (In-person & Livestream)
• Wednesday Bible Study 7:00 PM 
• Prayer link and ID for all Zoom Prayers
  Meeting ID: 416 409 6248
  Passcode: 900550

${socialBlock}
${contactBlock}`,

  prayerPrompt: () =>
    "🙏 Absolutely. Please share your prayer request below — our pastors and prayer team will begin praying right away.",

  prayerAcknowledgement: () =>
    "🤍 Thank you for sharing your heart. I've logged your request and forwarded it to our Prayer Team. Someone will follow up if needed.",

  donationOptions: () =>
    `💒 *Giving Options*
• e-Transfer: donate@churchontherock.ca
• Bank Transfer: Reply *Bank Details* to receive instructions
• In-person: Sundays 10:00 – 11:30 AM

Need a tax receipt? Reply *Receipt* and I'll collect the details. Thank you for partnering with us!`,

  bankDetails: () =>
    `🏦 *Bank Transfer Details*
Account Name: Church on the Rock International Ministries
Institution: 003 (Scotiabank)
Transit: 24532
Account: 0123456
Please include your name in the memo for proper tracking.`,

  donationReceiptPrompt: () =>
    "✉️ Please share the best email address for your tax receipt.",

  donationReceiptConfirmation: (email) =>
    `✅ Thanks! We'll send your annual giving receipt to ${email}.`,

  sermonLatest: () =>
    `🎥 *Latest Sermon*
"Worship & Miracle Night" by Pastor Samuel
Watch here: https://www.youtube.com/@churchontherockinternation6917/streams

Need past messages? Reply *Previous sermons*.`,

  sermonPrevious: () =>
    `📚 *Previous Sermon Archive*
Catch up anytime: https://www.youtube.com/@churchontherockinternation6917/videos
Reply *Sermon updates* to receive a weekly link automatically.`,

  sermonSubscription: () =>
    "🔔 You're now on the list! I'll send a fresh sermon link every Monday evening.",

  eventsOverview: () =>
    `🎉 *Upcoming Highlights*
• Youth Night — Oct 20 @ 7:00 PM
• Baptism Sunday — Nov 3 @ 10:00 AM
• Community Outreach — Nov 15 @ 6:30 PM

Ready to check in? Reply with the *event code* printed on the QR signage (e.g., YOUTH20).`,

  checkInConfirmation: (eventCode) =>
    `✅ Checked in with code *${eventCode}*.
Have a blessed time! We'll send follow-up resources after the gathering.`,

  dailyVerse: () =>
    `📖 *Today's Verse*
"Philippians 4:13 - I can do all things through Christ who gives me strength."`,

  celebrationsInfo: () =>
    "🎉 Want birthday or anniversary blessings? Reply with *Birthday* or *Anniversary* and your date, and we'll schedule a greeting!",

  birthdayGreeting: (name) =>
    `🎂 Happy Birthday, ${name}! We thank God for your life and pray this year is filled with His goodness.\n📖 *Psalm 139:14* — "I praise You because I am fearfully and wonderfully made."`,

  anniversaryGreeting: (name) =>
    `💞 Happy Anniversary, ${name}! May God continue to strengthen and bless your union.\n📖 *1 Corinthians 13:7* — "Love bears all things, believes all things, hopes all things, endures all things."`,

  defaultFallback: () =>
    `💬 I’m here to help! Please choose one of these options:
1️⃣ Church Info
2️⃣ Prayer Request
3️⃣ Donate / Offerings
4️⃣ Sermon Replay
5️⃣ Events & Check-in
Or say *Menu* to see all commands again.`,
};

module.exports = { templates };
