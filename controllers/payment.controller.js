const axios = require("axios");

const Add = async (req, res) => {
  const url = "https://developers.flouci.com/api/generate_payment";
  const playload = {
    app_token: process.env.APP_TOKEN,
    app_secret: process.env.APP_SECRET,
    amount: req.body.amount,
    accept_card: "true",
    session_timeout_secs: 1200,
    success_link: "http://192.168.11.113:3001/success?amount=" + req.body.amount,
    fail_link: "http://192.168.11.113:3001/fail",
    developer_tracking_id: "0578e8d0-ef12-4f83-b051-9a7bf43d3431",
  };
  try {
    const payment = await axios
    .post(url, playload)
    .then((response) => response.data)
    
    .catch((error) => console.log(error));
    console.log('before payment --------------------------',payment);
    return res.status(200).json(payment);
  } catch (error) {
    console.error("Error while adding payment:", error);
    throw error;
  }
};

const verifyPayment = async (req, res) => {
    const id = req.params.id;
    const url = `https://developers.flouci.com/api/verify_payment/${id}`;
    console.log('id+++++++++++++++++++++++++++',id)

    try {
        const payment = await axios
        .get(url, {
            headers: {
                'Content-Type': 'application/json',
                'apppublic': process.env.APP_TOKEN,
                'appsecret': process.env.APP_SECRET,
            },
        })

        .then((response) => response.data)
        .catch((error) => console.log(error));
        console.log('after verifing+++++++++++++++++++++++++++',payment);
        return res.status(200).json(payment);
    }
    catch (error) {
        console.error("Error while verifying payment:", error);
        throw error;
    }
}





    module.exports = {
        Add,
        verifyPayment
    };