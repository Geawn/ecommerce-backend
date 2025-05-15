const { Kafka, logLevel } = require('kafkajs');
const { sendOrderConfirmationEmail } = require('./mailer');

const kafka = new Kafka({
  clientId: 'ecommerce-app',
  brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  },
  logLevel: logLevel.ERROR
});

// Producer để gửi thông điệp
const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000
});

let consumer;
let isShuttingDown = false;

async function sendEmailMessage(data) {
  try {
    await producer.connect();
    await producer.send({
      topic: 'email-queue',
      messages: [
        { value: JSON.stringify(data) },
      ],
    });
    console.log('Email message sent to Kafka:', data);
  } catch (error) {
    console.error('Error sending email message to Kafka:', error);
    throw error;
  } finally {
    await producer.disconnect();
  }
}

// Consumer để xử lý thông điệp
async function startEmailConsumer() {
  if (isShuttingDown) return;
  
  consumer = kafka.consumer({ 
    groupId: 'email-group',
    maxWaitTimeInMs: 5000,
    sessionTimeout: 30000, // 30 seconds
    heartbeatInterval: 3000, // 3 seconds
    retry: {
      initialRetryTime: 100,
      retries: 8
    }
  });

  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'email-queue', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (isShuttingDown) return;
        
        try {
          const data = JSON.parse(message.value.toString());
          const { userEmail, orderId, totalPrice, items } = data;
          await sendOrderConfirmationEmail(userEmail, orderId, totalPrice, items);
          console.log(`Email sent for order ${orderId}`);
        } catch (error) {
          console.error('Error processing email message:', error);
          // Không throw error ở đây để tránh crash consumer
        }
      },
    });

    console.log('Email consumer started successfully');
  } catch (error) {
    console.error('Error in email consumer:', error);
    if (!isShuttingDown) {
      // Thử kết nối lại sau 5 giây nếu không phải đang shutdown
      setTimeout(startEmailConsumer, 5000);
    }
  }
}

async function gracefulShutdown() {
  isShuttingDown = true;
  console.log('Starting graceful shutdown...');
  
  try {
    if (consumer) {
      await consumer.disconnect();
      console.log('Consumer disconnected successfully');
    }
    if (producer) {
      await producer.disconnect();
      console.log('Producer disconnected successfully');
    }
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Xử lý graceful shutdown
const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.forEach(type => {
  process.on(type, async (error) => {
    console.error(`Received ${type}:`, error);
    await gracefulShutdown();
  });
});

signalTraps.forEach(type => {
  process.once(type, async () => {
    console.log(`Received ${type} signal`);
    await gracefulShutdown();
  });
});

module.exports = { sendEmailMessage, startEmailConsumer };