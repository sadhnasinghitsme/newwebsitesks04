// Plain, table-based HTML emails. Every user-supplied value is escaped.
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const oneLine = v => String(v ?? "").replace(/[\r\n]+/g, " ").slice(0, 120);   // safe for subject lines
const phoneFmt = p => (p && p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : p);
const when = d => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

function table(title, rows, createdAt) {
  const tr = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:8px 12px;border:1px solid #e4e8f0;background:#f4f6fa;font-weight:600;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:8px 12px;border:1px solid #e4e8f0;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("");
  return `<div style="font-family:Arial,sans-serif;color:#14203a;font-size:15px">
<h2 style="color:#13325B;margin:0 0 12px">${esc(title)}</h2>
<table style="border-collapse:collapse;max-width:640px">${tr}</table>
<p style="color:#5a6479;font-size:13px">Received ${esc(when(createdAt))} (IST) from the SKS World School website.</p></div>`;
}
const text = (title, rows, createdAt) =>
  `${title}\n\n${rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nReceived ${when(createdAt)} (IST)`;

function thankYou(name, body) {
  const html = `<div style="font-family:Arial,sans-serif;color:#14203a;font-size:15px;line-height:1.6;max-width:560px">
<p>Dear ${esc(name)},</p><p>${esc(body)}</p>
<p>Warm regards,<br>SKS World School, Greater Noida West<br>HS-04, Sector-16, Greater Noida West (U.P)<br>+91-98910 81270 · contact@skswsgnw.ac.in</p>
<p style="color:#5a6479;font-size:12px">This is an automated message. Please do not reply to it.</p></div>`;
  const txt = `Dear ${name},\n\n${body}\n\nWarm regards,\nSKS World School, Greater Noida West\n+91-98910 81270 · contact@skswsgnw.ac.in`;
  return { html, text: txt };
}

const templates = {
  admission(doc) {
    const rows = [["Parent name", doc.parentName], ["Phone", phoneFmt(doc.phone)], ["Email", doc.email], ["Child’s grade", doc.grade], ["Message", doc.message], ["Form", doc.source]];
    return {
      school: { subject: `New admission enquiry: ${oneLine(doc.parentName)} (${oneLine(doc.grade)})`, html: table("New Admission Enquiry", rows, doc.createdAt), text: text("New Admission Enquiry", rows, doc.createdAt), replyTo: doc.email || undefined },
      user: { subject: "Thank you for your enquiry – SKS World School", ...thankYou(doc.parentName, `Thank you for your admission enquiry for ${doc.grade}. Our admissions team will call you shortly on ${phoneFmt(doc.phone)} with the fee structure, seat availability and campus visit slots.`) },
    };
  },
  contact(doc) {
    const rows = [["Name", doc.name], ["Phone", phoneFmt(doc.phone)], ["Email", doc.email], ["Subject", doc.subject], ["Message", doc.message]];
    return {
      school: { subject: `New contact message: ${oneLine(doc.subject)}`, html: table("New Contact Message", rows, doc.createdAt), text: text("New Contact Message", rows, doc.createdAt), replyTo: doc.email },
      user: { subject: "We have received your message – SKS World School", ...thankYou(doc.name, `Thank you for contacting SKS World School. We have received your message about “${doc.subject}” and will get back to you soon.`) },
    };
  },
  career(doc) {
    const rows = [["Name", doc.name], ["Phone", phoneFmt(doc.phone)], ["Email", doc.email], ["Post applied for", doc.position], ["Resume", doc.resume?.originalName ? `${doc.resume.originalName} (attached)` : ""]];
    return {
      school: { subject: `New job application: ${oneLine(doc.name)} for ${oneLine(doc.position)}`, html: table("New Job Application", rows, doc.createdAt), text: text("New Job Application", rows, doc.createdAt), replyTo: doc.email },
      user: { subject: "Application received – SKS World School", ...thankYou(doc.name, `Thank you for applying for the post of ${doc.position} at SKS World School. Our HR team will review your application and contact you if your profile matches an opening.`) },
    };
  },
  alumni(doc) {
    const rows = [["Name", doc.name], ["Batch (year of passing out)", doc.batch], ["Phone", phoneFmt(doc.phone)], ["Email", doc.email], ["Occupation / college", doc.occupation], ["Message", doc.message]];
    return {
      school: { subject: `New alumni registration: ${oneLine(doc.name)} (batch of ${doc.batch})`, html: table("New Alumni Registration", rows, doc.createdAt), text: text("New Alumni Registration", rows, doc.createdAt), replyTo: doc.email },
      user: { subject: "Welcome to the SKS alumni network – SKS World School", ...thankYou(doc.name, `Thank you for registering with the SKS World School alumni network. We will keep you posted about alumni meets and school events.`) },
    };
  },
};

module.exports = templates;
