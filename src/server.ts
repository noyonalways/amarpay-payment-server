import express, { Request, Response } from "express";
import cors from "cors";
import mongoose, { Schema } from "mongoose";
import morgan from "morgan";
import connectDB from "./utils/connectDB";
import initiatePayment from "./utils/payment";
import verifyPayment from "./utils/verifyPayment";
import "dotenv/config";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

console.log(process.env);

// Connect to MongoDB
connectDB();

const Booking = mongoose.model(
  "Booking",
  new Schema(
    {
      name: String,
      email: String,
      transactionId: String,
      carName: String,
      totalCost: Number,
      paymentStatus: {
        type: String,
        default: "pending",
        enum: ["pending", "paid", "failed"],
      },
      paidAt: {
        type: Date,
        default: null,
      },
      date: Date,
    },
    {
      timestamps: true,
    }
  )
);

app.post("/api/bookings", async (req: Request, res: Response) => {
  const payload = req.body;
  const transactionId = `TXN-${Math.floor(Math.random() * 1000000)}`;

  if (
    !payload.name ||
    !payload.email ||
    !payload.totalCost ||
    !payload.carName
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const booking = new Booking({
    name: payload.name,
    email: payload.email,
    carName: payload.carName,
    transactionId: transactionId,
    totalCost: payload.totalCost,
    date: new Date(),
  });

  await booking.save();

  // payment
  const checkoutDetails = await initiatePayment({
    customerName: payload.name,
    customerEmail: payload.email,
    amount: payload.totalCost,
    transactionId: transactionId,
  });

  res.status(200).json({ data: checkoutDetails });
});

app.post("/api/payment/confirmation", async (req: Request, res: Response) => {
  const transactionId = req.query.transactionId;

  const verifyResponse = await verifyPayment(transactionId as string);

  if (verifyResponse?.pay_status === "Successful") {
    await Booking.findOneAndUpdate(
      { transactionId: transactionId },
      { paymentStatus: "paid", paidAt: new Date() }
    );

    res
      .status(200)
      .redirect(
        `http://192.168.0.116:5173/booking/payment/success?transactionId=${transactionId}`
      );
  } else {
    await Booking.findOneAndUpdate(
      { transactionId: transactionId },
      { paymentStatus: "failed" }
    );

    res
      .status(200)
      .redirect(
        `http://192.168.0.116:5173/booking/payment/failed?transactionId=${transactionId}`
      );
  }
});

app.post("/api/payment/failed", async (req: Request, res: Response) => {
  const transactionId = req.query.transactionId;

  await Booking.findOneAndUpdate(
    { transactionId: transactionId },
    { paymentStatus: "failed" }
  );

  res
    .status(200)
    .redirect(
      `http://192.168.0.116:5173/booking/payment/failed?transactionId=${transactionId}`
    );
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
