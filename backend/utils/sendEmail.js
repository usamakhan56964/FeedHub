import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyLink = `http://localhost:3000/verify-email/${token}`;

  await transporter.sendMail({
    from: `"FeedHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h3>Welcome to FeedHub</h3>
      <p>Click below to verify your email:</p>
      <a href="${verifyLink}">Verify Email</a>
    `,
  });
};
