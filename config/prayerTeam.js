const DEFAULT_RECIPIENTS = ['+918074301029', '+14374288179', '+919640112005'];
const RAW_RECIPIENTS = process.env.PRAYER_TEAM_NUMBERS;

function normalizeRecipient(value = '') {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  const hasPlusPrefix = trimmed.startsWith('+');
  return `${hasPlusPrefix ? '+' : ''}${digits}`;
}

function parseRecipients(rawList) {
  const source =
    typeof rawList === 'string' && rawList.trim().length
      ? rawList
      : DEFAULT_RECIPIENTS.join(',');

  return source
    .split(',')
    .map(normalizeRecipient)
    .filter(Boolean);
}

const PRAYER_TEAM_RECIPIENTS = parseRecipients(RAW_RECIPIENTS);

module.exports = {
  PRAYER_TEAM_RECIPIENTS,
  DEFAULT_PRAYER_TEAM_RECIPIENTS: DEFAULT_RECIPIENTS,
};
