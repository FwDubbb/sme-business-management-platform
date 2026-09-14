export class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function requireId(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new RequestError(`${label} is required.`);
  }
  return value.trim();
}

export const MAX_AMOUNT_CENTS = 9_999_999_999;

export function moneyToCents(value, label, { positive = false } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) ||
      value < 0 || (positive && value === 0) ||
      Number(value.toFixed(2)) !== value ||
      value > MAX_AMOUNT_CENTS / 100) {
    throw new RequestError(`${label} must be ${positive ? 'greater than zero' : 'zero or greater'}, with at most two decimal places and no more than 99,999,999.99.`);
  }
  return Math.round(value * 100);
}

export function sendWriteError(res, error) {
  if (error instanceof RequestError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error.code === 'SQLITE_BUSY') {
    return res.status(503).json({ error: 'The database is busy. Please try again.' });
  }
  console.error(error);
  return res.status(500).json({ error: 'Unable to save changes. Please try again.' });
}
