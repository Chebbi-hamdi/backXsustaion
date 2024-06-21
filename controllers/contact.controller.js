const { sendEmail } = require('../utils/mailer/mailer.utils');


exports.sendEmail = async (req, res) => {


    try {
        const { email, subject, message } = req.body;

        if (!email || !subject || !message) {
            return res.status(400).json({ message: "Email, subject and message are required" });
        }

        await sendEmail(email, subject, message);

        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

