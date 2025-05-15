const nodemailer = require('nodemailer');
require('dotenv').config(); // Thêm dòng này để đảm bảo load .env

// Log để kiểm tra biến môi trường
console.log('Email Configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Password is set' : 'Password is not set');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true // Enable TLS verification
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Transporter verification failed:', error);
    process.exit(1); // Exit if email configuration is invalid
  } else {
    console.log('Transporter is ready to send emails');
  }
});

// Hàm gửi email
async function sendOrderConfirmationEmail(to, orderId, totalPrice, items) {
  const itemList = items
    .map((item) => `<li>Product ID: ${item.productId}, Quantity: ${item.quantity}</li>`)
    .join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Order Confirmation - Order #${orderId}`,
    html: `
      <h2>Thank You for Your Order!</h2>
      <p>Your order has been successfully placed.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Total Price:</strong> $${totalPrice}</p>
      <h3>Items:</h3>
      <ul>${itemList}</ul>
      <p>We will notify you once your order is shipped.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendOrderConfirmationEmail };