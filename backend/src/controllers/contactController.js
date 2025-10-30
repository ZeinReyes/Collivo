import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Collivo Contact" <${process.env.EMAIL_USER}>`,
      to: "zbcreyes@gmail.com",
      subject: `📩 New Inquiry from ${name} | Collivo`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">New Contact Message</h2>

          <p style="font-size: 15px; color: #374151;">You’ve received a new message from the Collivo website contact form.</p>

          <div style="background: #ffffff; padding: 15px; border-radius: 10px; margin-top: 15px; border: 1px solid #e5e7eb;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="background:#f3f4f6; padding: 10px; border-radius: 6px; color: #111827;">${message}</p>
          </div>

          <p style="margin-top: 25px; font-size: 13px; color: #6b7280; text-align: center;">
            Sent from the <strong>Collivo</strong> Project Management Platform.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
};
