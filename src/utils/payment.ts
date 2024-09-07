import axios from "axios";

type PaymentData = {
  customerName: string;
  customerEmail: string;
  amount: string;
  transactionId: string;
};

const initiatePayment = async ({
  customerName,
  customerEmail,
  amount,
  transactionId,
}: PaymentData) => {
  const paymentData = {
    store_id: process.env.STORE_ID,
    signature_key: process.env.SIGNATURE_KEY,
    cus_name: customerName,
    cus_email: customerEmail,
    cus_phone: "01870762472",
    cus_add1: "53, Gausul Azam Road, Sector-14, Dhaka, Bangladesh",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    amount: amount,
    tran_id: transactionId,
    currency: "BDT",
    success_url: `http://192.168.0.116:3000/api/payment/confirmation?transactionId=${transactionId}`, // it will hit the server /api/payment/confirmation route
    fail_url: `http://192.168.0.116:3000/api/payment/failed?transactionId=${transactionId}`, // it will hit the server /api/payment/failed route
    cancel_url: `http://192.168.0.116:5173/booking/payment/cancel?transactionId=${transactionId}`, // it will redirect to the client site cancel page
    desc: "Lend Money",
    type: "json",
  };

  const response = await axios.post(
    "https://sandbox.aamarpay.com/jsonpost.php",
    paymentData
  );

  return response.data;
};

export default initiatePayment;
