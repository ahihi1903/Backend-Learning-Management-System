import nodemailer from "nodemailer";

// console.log(process.env.EMAIL_USER);
// console.log(process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to, subject, html) {
  // console.log(process.env.EMAIL_USER);
  // console.log(process.env.EMAIL_PASS);

  // const transporter = nodemailer.createTransport({
  //   service: "gmail",

  //   auth: {
  //     user: process.env.EMAIL_USER,

  //     pass: process.env.EMAIL_PASS,
  //   },
  // });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,

    to,
    subject,
    html,
  });
}
