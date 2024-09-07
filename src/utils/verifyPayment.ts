import axios from "axios";

const verifyPayment = async (paymentId: string) => {
  const response = await axios.get(
    `http://sandbox.aamarpay.com/api/v1/trxcheck/request.php`,
    {
      params: {
        store_id: process.env.STORE_ID,
        signature_key: process.env.SIGNATURE_KEY,
        request_id: paymentId,
        type: "json",
      },
    }
  );

  return response.data;
};

export default verifyPayment;
