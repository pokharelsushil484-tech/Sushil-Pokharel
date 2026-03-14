import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/mailer", async (req, res) => {
    try {
      const {
        to,
        subject,
        body,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_pass,
        from_email,
        from_name,
        reply_to
      } = req.body;

      if (!to || !subject || !body || !smtp_host || !smtp_user || !smtp_pass) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const transporter = nodemailer.createTransport({
        host: smtp_host,
        port: smtp_port || 587,
        secure: smtp_port === 465, // true for 465, false for other ports
        auth: {
          user: smtp_user,
          pass: smtp_pass,
        },
      });

      const mailOptions = {
        from: `"${from_name}" <${from_email}>`,
        to: to,
        subject: subject,
        text: body,
        replyTo: reply_to
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
      res.json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
