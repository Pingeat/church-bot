const { sendTextMessage } = require('./services/whatsappService');
const { PRAYER_TEAM_RECIPIENTS } = require('./config/prayerTeam');
const { getLogger } = require('./utils/logger');
const { templates } = require('./utils/messageTemplates');

const logger = getLogger('church_message_handler');

const members = {}; // in-memory demo store

const MENU_KEYWORDS = new Set(['1', 'church info', 'about', 'info']);
const PRAYER_KEYWORDS = new Set(['2', 'prayer', 'prayer request']);
const DONATION_KEYWORDS = new Set(['3', 'donate', 'offering', 'offerings', 'tithe']);
const SERMON_KEYWORDS = new Set(['4', 'sermon', 'sermon replay', 'sermons']);
const EVENTS_KEYWORDS = new Set(['5', 'events', 'event', 'check-in', 'checkin']);

function sanitizeText(input = '') {
  return input.trim();
}

function normalizeCommand(input = '') {
  return sanitizeText(input).toLowerCase();
}

function isValidEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(value);
}

function getPreferredName(profile = {}) {
  return profile.displayName || profile.firstName || 'there';
}

function parseMonthDay(value) {
  if (!value) {
    return null;
  }

  const segments = String(value)
    .trim()
    .split(/[-/]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (segments.length === 2) {
    const [monthStr, dayStr] = segments;
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      return { month, day };
    }
  } else if (segments.length === 3) {
    const [first, second, third] = segments;
    let monthStr;
    let dayStr;

    if (first.length === 4) {
      // yyyy-mm-dd
      monthStr = second;
      dayStr = third;
    } else if (third.length === 4) {
      // mm-dd-yyyy
      monthStr = first;
      dayStr = second;
    } else {
      // fallback assume mm-dd-yy
      monthStr = first;
      dayStr = second;
    }

    const month = Number(monthStr);
    const day = Number(dayStr);
    if (
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      return { month, day };
    }
  }

  return null;
}

function isTodayCelebration(value) {
  const parts = parseMonthDay(value);
  if (!parts) {
    return false;
  }

  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  return parts.month === todayMonth && parts.day === todayDay;
}

async function forwardPrayerRequest(user, requestText) {
  if (!PRAYER_TEAM_RECIPIENTS.length) {
    logger.warn('Prayer team recipients list is empty. Skipping notification.');
    return;
  }

  const preferredName = getPreferredName(user.profile);
  const notification = [
    '🙏 *New Prayer Request*',
    `Name: ${preferredName}`,
    `Phone: ${user.profile.phone}`,
    `Request: ${requestText}`,
  ].join('\n');

  for (const recipient of PRAYER_TEAM_RECIPIENTS) {
    await sendTextMessage(recipient, notification);
  }
}

async function sendMessages(to, ...messages) {
  for (const message of messages) {
    if (message) {
      await sendTextMessage(to, message);
    }
  }
}

async function handleIncomingMessage(data) {
  try {
    for (const entry of data.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const messages = value.messages || [];
        if (!messages.length) {
          continue;
        }

        const msg = messages[0];
        const sender = msg.from;
        const messageType = msg.type;
        if (messageType !== 'text') {
          logger.info(`Ignoring non-text message from ${sender}`);
          continue;
        }

        const rawBody = sanitizeText(msg.text?.body || '');
        const text = normalizeCommand(rawBody);
        if (!rawBody) {
          continue;
        }

        if (!members[sender]) {
          members[sender] = {
            stage: 'awaiting_name',
            profile: {
              phone: sender,
              consent: 'pending',
            },
            interactions: [],
            subscriptions: { sermon: false },
          };

          logger.info(`New visitor detected: ${sender}`);
          await sendMessages(sender, templates.welcomeIntro(), templates.askFirstName());
          continue;
        }

        const user = members[sender];

        if (user.profile.consent === 'opted-out' && text !== 'start') {
          await sendMessages(
            sender,
            'You are currently unsubscribed. Reply START to resume updates from Church on the Rock.'
          );
          continue;
        }

        if (text === 'start') {
          user.profile.consent = 'opted-in';
          user.stage = 'menu';
          await sendMessages(sender, 'Welcome back! Here is what I can help you with:', templates.menu());
          continue;
        }

        if (user.stage === 'awaiting_name') {
          user.profile.firstName = rawBody.split(' ')[0];
          user.profile.displayName = rawBody;
          user.stage = 'awaiting_email';
          await sendTextMessage(sender, templates.askEmail(user.profile.firstName));
          continue;
        }

        if (user.stage === 'awaiting_email') {
          if (!isValidEmail(rawBody)) {
            await sendTextMessage(
              sender,
              'Thanks! Could you double-check that email address? It should look like name@example.com.'
            );
            continue;
          }

          user.profile.email = rawBody.toLowerCase();
          user.profile.consent = 'opted-in';
          user.profile.registeredAt = new Date().toISOString();
          user.stage = 'menu';
          logger.info(`Registered profile for ${sender}: ${user.profile.firstName} <${user.profile.email}>`);

          const registrationMessages = [
            templates.registrationComplete(user.profile.firstName),
          ];

          const preferredName = getPreferredName(user.profile);
          if (isTodayCelebration(user.profile.birthday)) {
            registrationMessages.push(templates.birthdayGreeting(preferredName));
          }
          if (isTodayCelebration(user.profile.anniversary)) {
            registrationMessages.push(templates.anniversaryGreeting(preferredName));
          }

          registrationMessages.push(templates.menu(), templates.celebrationsInfo());

          await sendMessages(sender, ...registrationMessages);
          continue;
        }

        if (user.stage === 'collecting_prayer') {
          user.interactions.push({
            type: 'prayer',
            message: rawBody,
            recordedAt: new Date().toISOString(),
          });
          logger.info(`Prayer request captured for ${sender}`);
          user.stage = 'menu';

          await forwardPrayerRequest(user, rawBody);

          await sendMessages(sender, templates.prayerAcknowledgement(), templates.menu());
          continue;
        }

        if (user.stage === 'collecting_receipt_email') {
          if (!isValidEmail(rawBody)) {
            await sendTextMessage(
              sender,
              'Thanks! Please send a valid email address so we can issue your tax receipt.'
            );
            continue;
          }

          user.profile.receiptEmail = rawBody.toLowerCase();
          user.stage = 'menu';
          await sendMessages(
            sender,
            templates.donationReceiptConfirmation(user.profile.receiptEmail),
            templates.menu()
          );
          continue;
        }

        if (user.stage === 'awaiting_event_code') {
          const eventCode = rawBody.toUpperCase();
          user.interactions.push({
            type: 'event_checkin',
            code: eventCode,
            recordedAt: new Date().toISOString(),
          });
          user.stage = 'menu';
          logger.info(`Event check-in code ${eventCode} recorded for ${sender}`);

          await sendMessages(sender, templates.checkInConfirmation(eventCode), templates.menu());
          continue;
        }

        if (user.stage === 'collecting_birthday') {
          user.profile.birthday = rawBody;
          user.stage = 'menu';
          logger.info(`Birthday captured for ${sender}: ${rawBody}`);
          const messagesToSend = [`🎉 Beautiful! We'll celebrate you on ${rawBody}.`];
          if (isTodayCelebration(rawBody)) {
            messagesToSend.push(templates.birthdayGreeting(getPreferredName(user.profile)));
          }
          messagesToSend.push(templates.menu());

          await sendMessages(sender, ...messagesToSend);
          continue;
        }

        if (user.stage === 'collecting_anniversary') {
          user.profile.anniversary = rawBody;
          user.stage = 'menu';
          logger.info(`Anniversary captured for ${sender}: ${rawBody}`);
          const messagesToSend = [`💍 Wonderful! We'll send a blessing note for your anniversary on ${rawBody}.`];
          if (isTodayCelebration(rawBody)) {
            messagesToSend.push(templates.anniversaryGreeting(getPreferredName(user.profile)));
          }
          messagesToSend.push(templates.menu());

          await sendMessages(sender, ...messagesToSend);
          continue;
        }

        if (['menu', 'help', 'options', 'start over', 'hi', 'hello'].includes(text)) {
          await sendMessages(sender, templates.menu());
          continue;
        }

        if (MENU_KEYWORDS.has(text)) {
          await sendMessages(sender, templates.churchInfo());
          continue;
        }

        if (PRAYER_KEYWORDS.has(text)) {
          user.stage = 'collecting_prayer';
          await sendMessages(sender, templates.prayerPrompt());
          continue;
        }

        if (DONATION_KEYWORDS.has(text)) {
          await sendMessages(sender, templates.donationOptions());
          continue;
        }

        if (['bank details', 'bank', 'account'].includes(text)) {
          await sendMessages(sender, templates.bankDetails());
          continue;
        }

        if (text === 'receipt') {
          user.stage = 'collecting_receipt_email';
          await sendMessages(sender, templates.donationReceiptPrompt());
          continue;
        }

        if (SERMON_KEYWORDS.has(text)) {
          await sendMessages(sender, templates.sermonLatest());
          continue;
        }

        if (['previous sermons', 'past sermons', 'archive'].includes(text)) {
          await sendMessages(sender, templates.sermonPrevious());
          continue;
        }

        if (['sermon updates', 'subscribe sermon', 'sermon subscription'].includes(text)) {
          user.subscriptions.sermon = true;
          await sendMessages(sender, templates.sermonSubscription());
          continue;
        }

        if (EVENTS_KEYWORDS.has(text)) {
          user.stage = 'awaiting_event_code';
          await sendMessages(sender, templates.eventsOverview());
          continue;
        }

        if (['verse', 'daily verse', 'devotional'].includes(text)) {
          await sendMessages(sender, templates.dailyVerse());
          continue;
        }

        if (text.startsWith('birthday')) {
          user.stage = 'collecting_birthday';
          await sendMessages(
            sender,
            '🎂 We would love to celebrate you! Please reply with your birthday (MM-DD).'
          );
          continue;
        }

        if (text.startsWith('anniversary')) {
          user.stage = 'collecting_anniversary';
          await sendMessages(
            sender,
            '💑 Amazing! Please reply with your anniversary date (MM-DD).'
          );
          continue;
        }

        if (text === 'stop' || text === 'opt out' || text === 'unsubscribe') {
          user.profile.consent = 'opted-out';
          await sendMessages(
            sender,
            "You've been unsubscribed from automated messages. Reply START anytime to reconnect."
          );
          continue;
        }

        await sendMessages(sender, templates.defaultFallback());
      }
    }

    return { status: 'ok' };
  } catch (err) {
    logger.error(`handleIncomingMessage error: ${err}`);
    return { status: 'error' };
  }
}

module.exports = { handleIncomingMessage };
