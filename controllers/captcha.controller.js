const axios = require("axios");

const SITE_SECRET = process.env.SITE_SECRET


const verifyCaptcha = async (req, res) => {
  try {
    const { captchaValue, email } = req.body;

    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${SITE_SECRET}&response=${captchaValue}`
    );

    if (data.success) {
      return res.status(200).json({ message: "Captcha valid", email: email });
    } else {
      return res.status(400).json({ message: "Captcha invalid" });
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
    verifyCaptcha
}
