import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER!,
    subject,
    html,
  };

  return sgMail.send(msg);
}
