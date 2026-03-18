require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category.model');

const cats = [
  { name: 'Microcontrollers', icon: '🎮', description: 'Arduino, ESP32, Raspberry Pi' },
  { name: 'Sensors', icon: '📡', description: 'Temperature, Ultrasonic, IR' },
  { name: 'Motors & Actuators', icon: '⚙️', description: 'Servo, Stepper, DC Motors' },
  { name: 'Power Modules', icon: '⚡', description: 'Regulators, Battery Modules' },
  { name: 'Displays', icon: '🖥️', description: 'OLED, LCD, TFT Panels' },
  { name: 'Connectivity', icon: '📶', description: 'WiFi, Bluetooth, LoRa' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    for (const c of cats) {
      const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await Category.findOneAndUpdate(
        { slug },
        { ...c, slug },
        { upsert: true, new: true }
      );
    }
    
    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
