const razorpay = require("../../helpers/razorpay");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const crypto = require("crypto");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    } = req.body;

    // Convert coursePricing to a number and ensure it's valid
    const amount = parseFloat(coursePricing);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course pricing",
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    console.log("Creating Razorpay order with options:", options);
    const razorpayOrder = await razorpay.orders.create(options);
    console.log("Razorpay order created:", razorpayOrder);

    const newlyCreatedCourseOrder = new Order({
      userId,
      userName,
      userEmail,
      orderStatus,
      paymentMethod: "razorpay",
      paymentStatus,
      orderDate,
      paymentId: "",
      razorpayOrderId: razorpayOrder.id,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing: amount.toString(), // Store as string in Order model
    });

    await newlyCreatedCourseOrder.save();

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: newlyCreatedCourseOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    console.log("Error creating order:", err);
    res.status(500).json({
      success: false,
      message: "Error while creating payment!",
      error: err.message,
    });
  }
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      req.body;

    console.log("Payment verification data received:", {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature
        ? "Signature present"
        : "Signature missing",
      orderId,
    });

    // Verify payment signature
    if (!razorpaySignature) {
      console.log(
        "Signature Verification Failed: Signature is undefined or null"
      );
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Missing signature",
      });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpaySignature;

    console.log("Signature Verification:", {
      body: body,
      expectedSignature: expectedSignature,
      receivedSignature: razorpaySignature,
      isValid: isSignatureValid,
    });

    if (!isSignatureValid) {
      console.log("Signature Verification Failed:");
      console.log("Expected:", expectedSignature);
      console.log("Received:", razorpaySignature);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order cannot be found",
      });
    }

    // Verify payment with Razorpay
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      console.log("Razorpay payment details:", payment);

      if (payment.status !== "captured") {
        return res.status(400).json({
          success: false,
          message: "Payment not captured",
        });
      }
    } catch (error) {
      console.error("Razorpay payment verification error:", error);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;

    await order.save();

    // Update student course model
    const studentCourses = await StudentCourses.findOne({
      userId: order.userId,
    });

    if (studentCourses) {
      studentCourses.courses.push({
        courseId: order.courseId,
        title: order.courseTitle,
        instructorId: order.instructorId,
        instructorName: order.instructorName,
        dateOfPurchase: order.orderDate,
        courseImage: order.courseImage,
      });

      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [
          {
            courseId: order.courseId,
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: order.instructorName,
            dateOfPurchase: order.orderDate,
            courseImage: order.courseImage,
          },
        ],
      });

      await newStudentCourses.save();
    }

    // Update the course schema students
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      data: order,
    });
  } catch (err) {
    console.error("Payment finalization error:", err);
    res.status(500).json({
      success: false,
      message: "Error processing payment",
      error: err.message,
    });
  }
};

module.exports = { createOrder, capturePaymentAndFinalizeOrder };
