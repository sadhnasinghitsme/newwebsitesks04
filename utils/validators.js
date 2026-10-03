// Field checks shared by all forms. Each form schema maps a field to a rule; validate() returns
// { data, errors } where data holds the cleaned values and errors maps field -> message.

const str = v => (typeof v === "string" ? v.trim() : "");

// Accepts "98765 43210", "+91 98765-43210", "098765 43210"; stores the plain 10 digits.
function normalizePhone(v) {
  let d = str(v).replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules = {
  text: ({ label, required = true, min = 2, max = 100 }) => v => {
    const s = str(v);
    if (!s) return required ? [null, `Please enter ${label}.`] : [undefined];
    if (s.length < min) return [null, `Please enter ${label}.`];
    if (s.length > max) return [null, `Please keep ${label} under ${max} characters.`];
    return [s];
  },
  phone: () => v => {
    const d = normalizePhone(v);
    return /^[6-9]\d{9}$/.test(d) ? [d] : [null, "Please enter a valid 10-digit mobile number."];
  },
  email: ({ required = true } = {}) => v => {
    const s = str(v).toLowerCase();
    if (!s) return required ? [null, "Please enter your email address."] : [undefined];
    return s.length <= 254 && EMAIL_RE.test(s) ? [s] : [null, "Please enter a valid email address."];
  },
  year: ({ label, min = 1950 }) => v => {
    const s = str(String(v ?? "")), y = Number(s);
    return /^\d{4}$/.test(s) && y >= min && y <= new Date().getFullYear() ? [y] : [null, `Please enter ${label}.`];
  },
};

function validate(schema, body = {}) {
  const data = {}, errors = {};
  for (const [field, check] of Object.entries(schema)) {
    const [value, error] = check(body[field]);
    if (error) errors[field] = error;
    else if (value !== undefined) data[field] = value;
  }
  return { data, errors };
}

// Field names match the "name" attributes of the website's forms.
const schemas = {
  admission: {
    parent: rules.text({ label: "the parent’s name" }),
    phone: rules.phone(),
    email: rules.email({ required: false }),
    grade: rules.text({ label: "your child’s grade", min: 1, max: 60 }),
    message: rules.text({ label: "a message", required: false, min: 1, max: 2000 }),
  },
  contact: {
    name: rules.text({ label: "your name" }),
    phone: rules.phone(),
    email: rules.email(),
    subject: rules.text({ label: "a subject", max: 150 }),
    message: rules.text({ label: "your message", min: 5, max: 2000 }),
  },
  career: {
    name: rules.text({ label: "your full name" }),
    phone: rules.phone(),
    email: rules.email(),
    position: rules.text({ label: "the post you are applying for", min: 1 }),
  },
  alumni: {
    name: rules.text({ label: "your full name" }),
    batch: rules.year({ label: "a valid year of passing out, e.g. 2020" }),
    phone: rules.phone(),
    email: rules.email(),
    occupation: rules.text({ label: "your occupation or college", required: false, max: 150 }),
    message: rules.text({ label: "a message", required: false, min: 1, max: 2000 }),
  },
};

module.exports = { validate, schemas, normalizePhone };
