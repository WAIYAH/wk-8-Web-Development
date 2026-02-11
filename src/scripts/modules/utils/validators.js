/**
 * Fresh Harvest Market — Validators
 */

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNotEmpty(value) {
  return value && value.toString().trim().length > 0;
}

export function isValidQuantity(qty) {
  return Number.isInteger(qty) && qty > 0 && qty <= 99;
}

export function isValidDiscountCode(code) {
  return /^[A-Z0-9]{4,20}$/.test(code.toUpperCase());
}

export function validateContactForm(fields) {
  const errors = {};
  if (!isNotEmpty(fields.name)) errors.name = 'Name is required';
  if (!isNotEmpty(fields.email)) errors.email = 'Email is required';
  else if (!isValidEmail(fields.email)) errors.email = 'Please enter a valid email';
  if (!isNotEmpty(fields.subject)) errors.subject = 'Subject is required';
  if (!isNotEmpty(fields.message)) errors.message = 'Message is required';
  return { valid: Object.keys(errors).length === 0, errors };
}
