require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category.model');
const Product = require('./src/models/Product.model');

const CATEGORIES_DATA = [
  { name: 'Microcontrollers', slug: 'microcontrollers', icon: '🎮', description: 'Arduino, ESP32, Raspberry Pi & ARM Cortex boards' },
  { name: 'Sensors', slug: 'sensors', icon: '📡', description: 'Temperature, Ultrasonic, Gyro, Gas, and RTK GNSS sensors' },
  { name: 'Motors & Actuators', slug: 'motors-actuators', icon: '⚙️', description: 'Servo, Stepper, DC, and Brushless BLDC motors' },
  { name: 'Power Modules', slug: 'power-modules', icon: '⚡', description: 'Buck converters, boost modules, Li-ion chargers & LiPo batteries' },
  { name: 'Displays', slug: 'displays', icon: '🖥️', description: 'OLED, LCD, TFT Panels & addressable RGB LED rings' },
  { name: 'Robotics Kits & Prototyping', slug: 'kits', icon: '🤖', description: 'STEM Kits, Atal Lab bundles, drone frames & CNC shields' },
  { name: 'Connectivity', slug: 'connectivity', icon: '📶', description: 'WiFi, Bluetooth, LoRa, CAN-BUS & RF transceivers' },
];

const PRODUCTS_DATA = [
  // 1. MICROCONTROLLERS (1-10)
  {
    name: 'Arduino Uno R3 DIP Microcontroller Board',
    sku: 'MCU-ARD-UNO-R3',
    slug: 'arduino-uno-r3-dip-board',
    categorySlug: 'microcontrollers',
    brand: 'Arduino',
    shortDescription: 'The classic ATmega328P based microcontroller board with 14 digital I/O and 6 analog inputs.',
    description: 'The Arduino Uno R3 is the reference design for the open-source Arduino platform. Built with the ATmega328P, it features 14 digital input/output pins (6 of which can be used as PWM outputs), 6 analog inputs, a 16 MHz ceramic resonator, a USB connection, a power jack, an ICSP header, and a reset button.',
    basePrice: 549,
    tags: ['arduino', 'atmega328p', 'microcontroller', 'stem', 'starter'],
    images: ['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80'],
    datasheet: 'https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf',
    attributes: [
      { key: 'Microcontroller', value: 'ATmega328P', unit: '' },
      { key: 'Operating Voltage', value: '5', unit: 'V' },
      { key: 'Input Voltage', value: '7-12', unit: 'V' },
      { key: 'Digital I/O Pins', value: '14', unit: 'pins' },
      { key: 'Clock Speed', value: '16', unit: 'MHz' },
    ],
    variants: [
      { sku: 'MCU-ARD-UNO-R3-DIP', label: 'Standard DIP with Cable', price: 549, stock: 120 },
      { sku: 'MCU-ARD-UNO-R3-SMD', label: 'Compact SMD Edition', price: 449, stock: 85 }
    ],
    ratings: { average: 4.9, count: 184 },
    isFeatured: true,
  },
  {
    name: 'Arduino Mega 2560 R3 Board',
    sku: 'MCU-ARD-MEGA-2560',
    slug: 'arduino-mega-2560-r3-board',
    categorySlug: 'microcontrollers',
    brand: 'Arduino',
    shortDescription: 'High pin-count development board with 54 digital I/O pins and 4 UART serial ports.',
    description: 'The Arduino Mega 2560 is a microcontroller board based on the ATmega2560. It has 54 digital input/output pins (of which 15 can be used as PWM outputs), 16 analog inputs, 4 UARTs (hardware serial ports), and 256 KB flash memory, making it ideal for 3D printers and complex robotics.',
    basePrice: 1199,
    tags: ['arduino', 'mega2560', '3d printer', 'cnc', 'robotics'],
    images: ['https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Microcontroller', value: 'ATmega2560', unit: '' },
      { key: 'Digital Pins', value: '54', unit: 'pins' },
      { key: 'Analog Inputs', value: '16', unit: 'pins' },
      { key: 'Flash Memory', value: '256', unit: 'KB' },
    ],
    variants: [
      { sku: 'MCU-ARD-MEGA-2560-STD', label: 'Official Spec Mega 2560 + Cable', price: 1199, stock: 65 }
    ],
    ratings: { average: 4.8, count: 96 },
    isFeatured: true,
  },
  {
    name: 'ESP32-WROOM-32 Dual-Core WiFi & Bluetooth Module',
    sku: 'MCU-ESP32-DEV-30P',
    slug: 'esp32-wroom-32-wifi-bluetooth-dev-board',
    categorySlug: 'microcontrollers',
    brand: 'Espressif',
    shortDescription: 'Dual-core 240MHz high-speed SoC with integrated 2.4GHz Wi-Fi and Bluetooth BLE 4.2.',
    description: 'The ESP32 development board integrates the ESP-WROOM-32 module, featuring dual Tensilica Xtensa 32-bit LX6 microprocessors running up to 240MHz. With built-in Wi-Fi, Bluetooth LE, capacitive touch sensors, Hall sensors, and ultra-low power co-processor.',
    basePrice: 399,
    tags: ['esp32', 'wifi', 'bluetooth', 'iot', 'espressif'],
    images: ['https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'CPU Core', value: 'Dual-Core Xtensa LX6', unit: '' },
      { key: 'Clock Speed', value: '240', unit: 'MHz' },
      { key: 'SRAM', value: '520', unit: 'KB' },
      { key: 'Wireless', value: 'Wi-Fi 802.11 b/g/n + BLE 4.2', unit: '' },
    ],
    variants: [
      { sku: 'MCU-ESP32-DEV-30P-CP2102', label: '30-Pin CP2102 USB', price: 399, stock: 240 },
      { sku: 'MCU-ESP32-DEV-38P-TYPEC', label: '38-Pin Type-C Edition', price: 449, stock: 150 }
    ],
    ratings: { average: 4.9, count: 320 },
    isFeatured: true,
  },
  {
    name: 'ESP32-CAM WiFi + BLE Camera Development Module',
    sku: 'MCU-ESP32-CAM-OV2640',
    slug: 'esp32-cam-wifi-ble-camera-module-ov2640',
    categorySlug: 'microcontrollers',
    brand: 'Espressif',
    shortDescription: 'Miniature IoT camera module with 2MP OV2640 sensor, microSD card slot, and onboard flash LED.',
    description: 'The ESP32-CAM is an ultra-small camera development board with the ESP32-S chip and an OV2640 2-Megapixel camera. It includes 9 GPIO pins, built-in flash lamp, and an onboard TF card slot for image capture, video streaming, and face recognition projects.',
    basePrice: 599,
    tags: ['camera', 'esp32', 'ai', 'computer vision', 'iot'],
    images: ['https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Camera Sensor', value: 'OV2640 2MP', unit: '' },
      { key: 'Resolution', value: '1600x1200', unit: 'pixels' },
      { key: 'Storage Support', value: 'MicroSD up to 4GB', unit: '' },
    ],
    variants: [
      { sku: 'MCU-ESP32-CAM-OV2640-BASIC', label: 'Camera Board + OV2640', price: 599, stock: 110 },
      { sku: 'MCU-ESP32-CAM-OV2640-MB', label: 'Camera Board + USB Motherboard', price: 749, stock: 95 }
    ],
    ratings: { average: 4.7, count: 142 },
    isFeatured: true,
  },
  {
    name: 'Raspberry Pi 4 Model B (4GB RAM)',
    sku: 'SBC-RPI-4B-4GB',
    slug: 'raspberry-pi-4-model-b-4gb',
    categorySlug: 'microcontrollers',
    brand: 'Raspberry Pi',
    shortDescription: 'Quad-core 64-bit ARM Cortex-A72 @ 1.5GHz single-board computer with 4K dual display support.',
    description: 'Raspberry Pi 4 Model B delivers desktop-class performance with quad-core 64-bit ARM Cortex-A72 CPU, Gigabit Ethernet, dual-band 2.4/5.0 GHz Wi-Fi, Bluetooth 5.0, two USB 3.0 ports, two USB 2.0 ports, and dual micro-HDMI ports driving displays up to 4K resolution.',
    basePrice: 5499,
    tags: ['raspberry pi', 'linux', 'sbc', 'python', 'iot'],
    images: ['https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Processor', value: 'Broadcom BCM2711 1.5GHz', unit: '' },
      { key: 'RAM', value: '4', unit: 'GB' },
      { key: 'Display Output', value: 'Dual 4K micro-HDMI', unit: '' },
      { key: 'Networking', value: 'Gigabit Ethernet + AC Wi-Fi', unit: '' },
    ],
    variants: [
      { sku: 'SBC-RPI-4B-4GB-ALONE', label: '4GB Board Only', price: 5499, stock: 42 },
      { sku: 'SBC-RPI-4B-4GB-KIT', label: 'Starter Kit (Board + 3A Supply + Heat Sinks)', price: 6299, stock: 30 }
    ],
    ratings: { average: 5.0, count: 215 },
    isFeatured: true,
  },
  {
    name: 'Raspberry Pi Pico W with Wireless Connectivity',
    sku: 'MCU-RPI-PICO-W',
    slug: 'raspberry-pi-pico-w-rp2040',
    categorySlug: 'microcontrollers',
    brand: 'Raspberry Pi',
    shortDescription: 'Dual-core ARM Cortex-M0+ RP2040 chip with onboard 2.4GHz 802.11n wireless LAN.',
    description: 'The Raspberry Pi Pico W brings wireless networking to the popular Pico platform. Built on the in-house RP2040 dual-core processor with 264KB on-chip SRAM and 2MB QSPI flash, it includes an Infineon CYW43439 wireless chip for fast Wi-Fi connectivity.',
    basePrice: 649,
    tags: ['pico', 'rp2040', 'raspberry pi', 'micropython', 'c++'],
    images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Processor', value: 'RP2040 Dual ARM Cortex-M0+', unit: '' },
      { key: 'Clock Speed', value: '133', unit: 'MHz' },
      { key: 'SRAM', value: '264', unit: 'KB' },
      { key: 'Wi-Fi', value: '802.11n 2.4GHz', unit: '' },
    ],
    variants: [
      { sku: 'MCU-RPI-PICO-W-STD', label: 'Standard Pico W (Pre-Soldered)', price: 649, stock: 130 }
    ],
    ratings: { average: 4.8, count: 88 },
  },
  {
    name: 'STM32F103C8T6 Blue Pill Development Board',
    sku: 'MCU-STM32-BLUEPILL',
    slug: 'stm32f103c8t6-blue-pill-development-board',
    categorySlug: 'microcontrollers',
    brand: 'STMicroelectronics',
    shortDescription: 'High-performance 32-bit ARM Cortex-M3 core operating at 72MHz with 64KB Flash memory.',
    description: 'The STM32F103C8T6 Blue Pill board is a budget-friendly 32-bit development platform supported by STM32CubeIDE, Keil, and the Arduino core. It offers 72MHz frequency, 20KB SRAM, 64KB Flash, 2x 12-bit ADCs, and native USB support for advanced embedded engineering.',
    basePrice: 289,
    tags: ['stm32', 'arm', 'cortex-m3', 'blue pill', 'embedded'],
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Core Architecture', value: 'ARM Cortex-M3', unit: '' },
      { key: 'CPU Speed', value: '72', unit: 'MHz' },
      { key: 'Flash Memory', value: '64', unit: 'KB' },
      { key: 'ADC Channels', value: '10x 12-bit', unit: '' },
    ],
    variants: [
      { sku: 'MCU-STM32-BLUEPILL-ORIG', label: 'STM32F103C8T6 Tested Board', price: 289, stock: 175 }
    ],
    ratings: { average: 4.7, count: 112 },
  },
  {
    name: 'NodeMCU ESP8266 CP2102 WiFi IoT Board',
    sku: 'MCU-ESP8266-NODEMCU',
    slug: 'nodemcu-esp8266-cp2102-wifi-development-board',
    categorySlug: 'microcontrollers',
    brand: 'Espressif',
    shortDescription: 'Compact open-source IoT firmware platform running on the ESP8266 Wi-Fi SoC.',
    description: 'NodeMCU is an open-source firmware and development kit that helps you prototype your IoT products within a few Lua script lines or Arduino C++. Built on the ESP8266-12E module with 4MB Flash and onboard USB-to-UART CP2102 chip.',
    basePrice: 249,
    tags: ['esp8266', 'nodemcu', 'wifi', 'iot', 'home automation'],
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Processor', value: 'ESP8266EX', unit: '' },
      { key: 'Clock Speed', value: '80/160', unit: 'MHz' },
      { key: 'Flash Size', value: '4', unit: 'MB' },
    ],
    variants: [
      { sku: 'MCU-ESP8266-NODEMCU-CP2102', label: 'NodeMCU CP2102 Version', price: 249, stock: 210 }
    ],
    ratings: { average: 4.8, count: 260 },
  },
  {
    name: 'Teensy 4.1 High-Speed Development Board',
    sku: 'MCU-TEENSY-41',
    slug: 'teensy-41-development-board-600mhz',
    categorySlug: 'microcontrollers',
    brand: 'PJRC',
    shortDescription: 'Blazing fast ARM Cortex-M7 at 600MHz with 10/100 Mbit Ethernet PHY and microSD socket.',
    description: 'Teensy 4.1 is the latest iteration of the amazingly popular development platform featuring an ARM Cortex-M7 processor at 600MHz, with an NXP i.MXRT1062 chip. It provides four times larger flash memory, an onboard SD card socket, and an ethernet PHY connector.',
    basePrice: 3299,
    tags: ['teensy', 'cortex-m7', 'dsp', 'audio', 'high speed'],
    images: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Processor', value: 'ARM Cortex-M7 @ 600MHz', unit: '' },
      { key: 'RAM', value: '1024', unit: 'KB' },
      { key: 'Flash Memory', value: '8', unit: 'MB' },
    ],
    variants: [
      { sku: 'MCU-TEENSY-41-HDR', label: 'Teensy 4.1 with Soldered Headers', price: 3299, stock: 35 }
    ],
    ratings: { average: 5.0, count: 47 },
  },
  {
    name: 'Seeed Studio XIAO ESP32C3 Tiny Microcontroller',
    sku: 'MCU-SEEED-XIAO-C3',
    slug: 'seeed-studio-xiao-esp32c3-tiny-board',
    categorySlug: 'microcontrollers',
    brand: 'Seeed Studio',
    shortDescription: 'Thumb-sized RISC-V 32-bit single-core board supporting Wi-Fi and Bluetooth 5.0 LE.',
    description: 'XIAO ESP32C3 carries an ESP32-C3 chip with a 32-bit RISC-V CPU. It integrates complete Wi-Fi and Bluetooth BLE 5.0 functions in a miniature 21 x 17.5 mm footprint, perfect for wearable IoT and space-constrained smart electronics.',
    basePrice: 599,
    tags: ['xiao', 'seeed', 'risc-v', 'wearable', 'iot'],
    images: ['https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Architecture', value: 'RISC-V 32-Bit 160MHz', unit: '' },
      { key: 'Dimensions', value: '21 x 17.5', unit: 'mm' },
      { key: 'Wireless', value: 'Wi-Fi + BLE 5.0', unit: '' },
    ],
    variants: [
      { sku: 'MCU-SEEED-XIAO-C3-STD', label: 'XIAO ESP32C3 Board + Antenna', price: 599, stock: 80 }
    ],
    ratings: { average: 4.8, count: 64 },
  },

  // 2. SENSORS (11-20)
  {
    name: 'HC-SR04 Ultrasonic Distance Sensor Module',
    sku: 'SEN-ULTRASONIC-HCSR04',
    slug: 'hc-sr04-ultrasonic-distance-sensor-module',
    categorySlug: 'sensors',
    brand: 'SparkTech',
    shortDescription: 'Non-contact distance measurement from 2cm to 400cm with 3mm precision.',
    description: 'The HC-SR04 ultrasonic sensor uses sonar to determine distance to an object like bats do. It offers excellent non-contact range detection with high accuracy and stable readings in an easy-to-use package with 5V trigger and echo pins.',
    basePrice: 119,
    tags: ['ultrasonic', 'distance', 'obstacle avoidance', 'sonar'],
    images: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Ranging Distance', value: '2cm - 400cm', unit: '' },
      { key: 'Operating Voltage', value: '5', unit: 'V' },
      { key: 'Resolution', value: '3', unit: 'mm' },
    ],
    variants: [
      { sku: 'SEN-ULTRASONIC-HCSR04-5V', label: 'Standard 5V Version', price: 119, stock: 450 },
      { sku: 'SEN-ULTRASONIC-RCWL-3V', label: 'Wide Voltage 3.3V-5V Version', price: 159, stock: 180 }
    ],
    ratings: { average: 4.8, count: 310 },
  },
  {
    name: 'DHT22 / AM2302 High Accuracy Temperature & Humidity Sensor',
    sku: 'SEN-DHT22-AM2302',
    slug: 'dht22-am2302-temperature-humidity-sensor',
    categorySlug: 'sensors',
    brand: 'Aosong',
    shortDescription: 'Calibrated digital signal output temperature and relative humidity sensor with single-wire bus.',
    description: 'The DHT22 is a basic, low-cost digital temperature and humidity sensor. It uses a capacitive humidity sensor and a thermistor to measure the surrounding air, and spits out a digital signal on the data pin (no analog input pins needed).',
    basePrice: 289,
    tags: ['temperature', 'humidity', 'weather', 'climate', 'dht22'],
    images: ['https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Humidity Range', value: '0-100%', unit: 'RH' },
      { key: 'Temperature Range', value: '-40 to 80', unit: '°C' },
      { key: 'Accuracy', value: '±0.5°C / ±2% RH', unit: '' },
    ],
    variants: [
      { sku: 'SEN-DHT22-AM2302-MOD', label: 'DHT22 with PCB Breakout & Resistor', price: 289, stock: 190 }
    ],
    ratings: { average: 4.9, count: 145 },
  },
  {
    name: 'MPU-6050 3-Axis Gyroscope + 3-Axis Accelerometer Module',
    sku: 'SEN-MPU6050-6DOF',
    slug: 'mpu-6050-6dof-gyroscope-accelerometer-module',
    categorySlug: 'sensors',
    brand: 'InvenSense',
    shortDescription: '6-DoF motion tracking device combining a 3-axis gyroscope and a 3-axis accelerometer.',
    description: 'The MPU-6050 sensor contains a MEMS accelerometer and a MEMS gyro in a single chip. It is very accurate, as it contains 16-bits analog-to-digital conversion hardware for each channel, capturing the x, y, and z channels at the same time.',
    basePrice: 169,
    tags: ['imu', 'gyroscope', 'accelerometer', 'quadcopter', 'robotics'],
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Communication', value: 'I2C Standard', unit: '' },
      { key: 'Gyro Range', value: '±250, 500, 1000, 2000', unit: '°/s' },
      { key: 'Accel Range', value: '±2, ±4, ±8, ±16', unit: 'g' },
    ],
    variants: [
      { sku: 'SEN-MPU6050-6DOF-I2C', label: 'GY-521 Breakout Board', price: 169, stock: 320 }
    ],
    ratings: { average: 4.8, count: 275 },
  },
  {
    name: 'RC522 13.56MHz RFID Reader Kit with S50 Keyfob',
    sku: 'SEN-RFID-RC522',
    slug: 'rc522-1356mhz-rfid-card-reader-kit',
    categorySlug: 'sensors',
    brand: 'NXP',
    shortDescription: 'Contactless communication 13.56MHz RFID IC card reader module supporting SPI interface.',
    description: 'The RC522 RFID Reader module is designed to read and write 13.56 MHz RFID contactless smart cards and key fobs. Widely used in access control, attendance systems, and automated identification.',
    basePrice: 199,
    tags: ['rfid', 'security', 'access control', 'smart card'],
    images: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Operating Frequency', value: '13.56', unit: 'MHz' },
      { key: 'Interface', value: 'SPI', unit: '' },
      { key: 'Read Distance', value: 'Up to 50', unit: 'mm' },
    ],
    variants: [
      { sku: 'SEN-RFID-RC522-KIT', label: 'Reader + Card + Keyfob Kit', price: 199, stock: 260 }
    ],
    ratings: { average: 4.7, count: 180 },
  },
  {
    name: 'MQ-2 Flammable Gas & Smoke Sensor Module',
    sku: 'SEN-GAS-MQ2',
    slug: 'mq-2-flammable-gas-smoke-sensor-module',
    categorySlug: 'sensors',
    brand: 'SparkTech',
    shortDescription: 'Detects LPG, Propane, Hydrogen, Methane, and Smoke with analog and digital outputs.',
    description: 'The MQ-2 gas sensor module is sensitive to LPG, i-butane, propane, methane, alcohol, Hydrogen, and smoke. It features an onboard LM393 comparator providing both an analog voltage output and a digital threshold trigger.',
    basePrice: 149,
    tags: ['gas sensor', 'mq2', 'smoke detector', 'safety', 'fire alarm'],
    images: ['https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Detection Range', value: '300 - 10000', unit: 'ppm' },
      { key: 'Heating Voltage', value: '5', unit: 'V' },
    ],
    variants: [
      { sku: 'SEN-GAS-MQ2-STD', label: 'MQ-2 4-Pin Module', price: 149, stock: 220 }
    ],
    ratings: { average: 4.6, count: 95 },
  },
  {
    name: 'BMP280 High Precision Barometric Pressure & Altitude Sensor',
    sku: 'SEN-BMP280-I2C',
    slug: 'bmp280-barometric-pressure-altitude-sensor',
    categorySlug: 'sensors',
    brand: 'Bosch',
    shortDescription: 'High precision digital atmospheric pressure and altitude sensor supporting I2C and SPI.',
    description: 'Designed by Bosch Sensortec, the BMP280 is an absolute barometric pressure sensor designed for mobile applications. It enables accurate altitude tracking with ±1 meter precision and ambient temperature readings.',
    basePrice: 179,
    tags: ['bmp280', 'barometer', 'altitude', 'drones', 'weather'],
    images: ['https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Pressure Range', value: '300 - 1100', unit: 'hPa' },
      { key: 'Relative Accuracy', value: '±0.12', unit: 'hPa' },
      { key: 'Interface', value: 'I2C / SPI', unit: '' },
    ],
    variants: [
      { sku: 'SEN-BMP280-I2C-3V', label: 'BMP280 3.3V Module', price: 179, stock: 140 }
    ],
    ratings: { average: 4.9, count: 120 },
  },
  {
    name: 'VL53L0X Time-of-Flight (ToF) Laser Distance Sensor',
    sku: 'SEN-TOF-VL53L0X',
    slug: 'vl53l0x-time-of-flight-laser-distance-sensor',
    categorySlug: 'sensors',
    brand: 'STMicroelectronics',
    shortDescription: 'Sub-millimeter laser ranging sensor measuring absolute distances up to 2 meters.',
    description: 'The VL53L0X is a new generation Time-of-Flight laser-ranging module housed in the smallest footprint. Unlike conventional sensors, it measures absolute distances independently of target reflectance.',
    basePrice: 349,
    tags: ['laser', 'tof', 'distance', 'lidar', 'robotics'],
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Max Range', value: '2000', unit: 'mm' },
      { key: 'Laser Emitter', value: '940nm VCSEL Class 1', unit: '' },
      { key: 'Interface', value: 'I2C', unit: '' },
    ],
    variants: [
      { sku: 'SEN-TOF-VL53L0X-BRK', label: 'GY-VL53L0X Breakout Module', price: 349, stock: 115 }
    ],
    ratings: { average: 4.9, count: 85 },
  },
  {
    name: 'TCS3200 RGB Color Recognition Sensor Module',
    sku: 'SEN-COLOR-TCS3200',
    slug: 'tcs3200-rgb-color-recognition-sensor-module',
    categorySlug: 'sensors',
    brand: 'AMS',
    shortDescription: 'Color light-to-frequency converter with 4 bright white LEDs for color sorting robots.',
    description: 'The TCS3200 color sensor detects color by measuring reflected light through an 8x8 array of photodiodes: 16 with red filters, 16 with green, 16 with blue, and 16 with no filter (clear). Output is a square wave frequency proportional to light intensity.',
    basePrice: 279,
    tags: ['color sensor', 'tcs3200', 'rgb', 'sorting robot', 'automation'],
    images: ['https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Photodiode Array', value: '64 elements', unit: '' },
      { key: 'LED Illumination', value: '4x White LEDs', unit: '' },
    ],
    variants: [
      { sku: 'SEN-COLOR-TCS3200-MOD', label: 'TCS3200 Sensor Module', price: 279, stock: 95 }
    ],
    ratings: { average: 4.7, count: 62 },
  },
  {
    name: 'HC-SR501 PIR Motion Detector Sensor',
    sku: 'SEN-PIR-HCSR501',
    slug: 'hc-sr501-pir-motion-detector-sensor',
    categorySlug: 'sensors',
    brand: 'SparkTech',
    shortDescription: 'Passive infrared sensor for human body motion detection with adjustable delay and sensitivity.',
    description: 'The HC-SR501 allows you to sense motion, almost always used to detect whether a human has moved in or out of the sensors range. Ideal for home security, automated stair lighting, and energy-saving systems.',
    basePrice: 99,
    tags: ['pir', 'motion sensor', 'security', 'home automation'],
    images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Detection Range', value: 'Up to 7', unit: 'meters' },
      { key: 'Detection Angle', value: '< 120', unit: 'degrees' },
    ],
    variants: [
      { sku: 'SEN-PIR-HCSR501-STD', label: 'Standard HC-SR501 Module', price: 99, stock: 380 }
    ],
    ratings: { average: 4.8, count: 210 },
  },
  {
    name: 'u-blox ZED-F9P Multi-Band High-Precision GNSS RTK Breakout',
    sku: 'SEN-RTK-ZEDF9P',
    slug: 'ublox-zed-f9p-multi-band-gnss-rtk-breakout',
    categorySlug: 'sensors',
    brand: 'u-blox',
    shortDescription: 'Centimeter-level accuracy multi-band GNSS receiver module for autonomous drones and rovers.',
    description: 'The ZED-F9P is a top-tier multi-band GNSS module that receives GPS, GLONASS, Galileo, and BeiDou concurrently. Provides RTK positioning with sub-centimeter horizontal accuracy in under 10 seconds.',
    basePrice: 9499,
    tags: ['rtk', 'gnss', 'gps', 'autonomous rover', 'drone'],
    images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'RTK Accuracy', value: '0.01 + 1ppm', unit: 'm' },
      { key: 'Constellations', value: 'GPS, GLONASS, Galileo, BeiDou', unit: '' },
      { key: 'Update Rate', value: 'Up to 20', unit: 'Hz' },
    ],
    variants: [
      { sku: 'SEN-RTK-ZEDF9P-BOARD', label: 'ZED-F9P Breakout + SMA Antenna Connector', price: 9499, stock: 25 }
    ],
    ratings: { average: 5.0, count: 42 },
    isFeatured: true,
  },

  // 3. MOTORS & ACTUATORS (21-28)
  {
    name: 'L298N Dual H-Bridge DC Stepper Motor Driver',
    sku: 'MOT-DRV-L298N',
    slug: 'l298n-dual-h-bridge-motor-driver-module',
    categorySlug: 'motors',
    brand: 'STMicroelectronics',
    shortDescription: 'High-power dual motor driver module capable of driving two DC motors or one 4-wire stepper motor.',
    description: 'This L298N driver module uses ST L298N chip, allowing direct drive of two 3-30V DC motors. Features an onboard 5V regulator, flyback protection diodes, and heat sink for reliable mobile robotics applications.',
    basePrice: 179,
    tags: ['l298n', 'motor driver', 'dc motor', 'stepper', 'robotics'],
    images: ['https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Driver Chip', value: 'L298N Dual H-Bridge', unit: '' },
      { key: 'Motor Supply Voltage', value: '5 - 35', unit: 'V' },
      { key: 'Peak Current', value: '2', unit: 'A per bridge' },
    ],
    variants: [
      { sku: 'MOT-DRV-L298N-RED', label: 'Classic Red Heatsink L298N', price: 179, stock: 350 }
    ],
    ratings: { average: 4.8, count: 290 },
  },
  {
    name: 'A4988 Stepper Motor Driver Module with Heat Sink',
    sku: 'MOT-DRV-A4988',
    slug: 'a4988-stepper-motor-driver-module-heatsink',
    categorySlug: 'motors',
    brand: 'Allegro',
    shortDescription: 'Microstepping driver with translator for 3D printers, CNC routers, and precision robotics.',
    description: 'The A4988 is a complete microstepping motor driver with built-in translator for easy operation. It operates bipolar stepper motors in full-, half-, quarter-, eighth-, and sixteenth-step modes with output drive capacity up to 35V and 2A.',
    basePrice: 119,
    tags: ['a4988', 'stepper driver', '3d printer', 'cnc', 'microstepping'],
    images: ['https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Operating Voltage', value: '8 - 35', unit: 'V' },
      { key: 'Continuous Current', value: '1', unit: 'A (2A with cooling)' },
      { key: 'Microstep Resolutions', value: 'Full, 1/2, 1/4, 1/8, 1/16', unit: '' },
    ],
    variants: [
      { sku: 'MOT-DRV-A4988-SINK', label: 'A4988 Module + Adhesive Aluminum Heat Sink', price: 119, stock: 400 }
    ],
    ratings: { average: 4.7, count: 180 },
  },
  {
    name: 'TowerPro MG996R High-Torque Metal Gear Servo Motor',
    sku: 'MOT-SER-MG996R',
    slug: 'towerpro-mg996r-high-torque-metal-gear-servo',
    categorySlug: 'motors',
    brand: 'TowerPro',
    shortDescription: 'Heavy-duty metal gear servo delivering up to 11kg/cm torque for robotic arms and RC models.',
    description: 'The MG996R is an upgraded version of the popular MG995. Features redesigned PCB and IC control system, offering precise positioning, fast response, and full brass/metal gear train capable of high mechanical loads.',
    basePrice: 389,
    tags: ['servo', 'mg996r', 'metal gear', 'robotic arm', 'torque'],
    images: ['https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Stall Torque', value: '11', unit: 'kg-cm @ 6V' },
      { key: 'Gear Type', value: 'All Metal Gears', unit: '' },
      { key: 'Rotation Angle', value: '180', unit: 'degrees' },
    ],
    variants: [
      { sku: 'MOT-SER-MG996R-180', label: '180 Degree Standard Rotation', price: 389, stock: 160 },
      { sku: 'MOT-SER-MG996R-360', label: '360 Degree Continuous Rotation', price: 429, stock: 90 }
    ],
    ratings: { average: 4.9, count: 140 },
  },
  {
    name: 'SG90 9g Micro Servo Motor with Horns',
    sku: 'MOT-SER-SG90',
    slug: 'sg90-9g-micro-servo-motor',
    categorySlug: 'motors',
    brand: 'TowerPro',
    shortDescription: 'Ultra-lightweight 9-gram servo motor for miniature robotic pan-tilt mounts and RC planes.',
    description: 'The SG90 is the standard micro servo for hobbyists. Weighing just 9 grams, it gives 1.8 kg-cm torque and can rotate approximately 180 degrees. Works seamlessly with Arduino Servo library.',
    basePrice: 99,
    tags: ['sg90', 'micro servo', 'pan tilt', 'starter', 'arduino'],
    images: ['https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Weight', value: '9', unit: 'grams' },
      { key: 'Stall Torque', value: '1.8', unit: 'kg-cm' },
    ],
    variants: [
      { sku: 'MOT-SER-SG90-STD', label: 'SG90 9g with 3 Servo Horns & Screws', price: 99, stock: 500 }
    ],
    ratings: { average: 4.7, count: 410 },
  },
  {
    name: 'NEMA 17 Bipolar Stepper Motor (1.5A 42N.cm)',
    sku: 'MOT-STP-NEMA17',
    slug: 'nema-17-bipolar-stepper-motor-15a-42ncm',
    categorySlug: 'motors',
    brand: 'SparkTech',
    shortDescription: 'Industrial precision 1.8 degree step angle motor for 3D printers, laser cutters, and CNC machines.',
    description: 'High quality NEMA 17 stepper motor with 4-lead wire harness. Features 42 N.cm (60 oz.in) holding torque at 1.5A rated current. Compatible with A4988, DRV8825, and TMC2209 silent stepper drivers.',
    basePrice: 699,
    tags: ['nema17', 'stepper motor', '3d printer', 'cnc', 'precision'],
    images: ['https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Step Angle', value: '1.8', unit: 'degrees' },
      { key: 'Holding Torque', value: '42', unit: 'N.cm' },
      { key: 'Rated Current', value: '1.5', unit: 'A' },
      { key: 'Shaft Diameter', value: '5', unit: 'mm' },
    ],
    variants: [
      { sku: 'MOT-STP-NEMA17-40MM', label: '40mm Body Length with 1m Cable', price: 699, stock: 95 }
    ],
    ratings: { average: 4.9, count: 110 },
  },
  {
    name: 'A2212 1000KV Brushless Outrunner BLDC Motor',
    sku: 'MOT-BLDC-A2212',
    slug: 'a2212-1000kv-brushless-outrunner-bldc-motor',
    categorySlug: 'motors',
    brand: 'SparkElex',
    shortDescription: 'High-thrust outrunner brushless motor for quadcopters, multirotors, and RC airplanes.',
    description: 'The A2212/13T 1000KV brushless motor delivers strong thrust for 450-class quadcopters and fixed-wing airplanes. Optimized to work with 3S LiPo batteries and 1045 propellers.',
    basePrice: 429,
    tags: ['bldc', 'drone motor', 'brushless', 'quadcopter', 'thrust'],
    images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'KV Rating', value: '1000', unit: 'RPM/V' },
      { key: 'Max Efficiency Current', value: '4 - 10', unit: 'A' },
      { key: 'Max Thrust', value: '850', unit: 'grams' },
    ],
    variants: [
      { sku: 'MOT-BLDC-A2212-1000KV', label: '1000KV Motor + Prop Adapter + Mount', price: 429, stock: 150 }
    ],
    ratings: { average: 4.8, count: 85 },
  },
  {
    name: '30A SimonK Brushless ESC Speed Controller with 5V 2A BEC',
    sku: 'MOT-ESC-SIMONK30A',
    slug: '30a-simonk-brushless-esc-speed-controller',
    categorySlug: 'motors',
    brand: 'SimonK',
    shortDescription: 'Fast-response electronic speed controller flashed with SimonK firmware for stable drone flight.',
    description: 'This 30A ESC features SimonK firmware for ultra-smooth multirotor throttle response. Includes a 5V 2A linear BEC to power flight controllers and radio receivers.',
    basePrice: 349,
    tags: ['esc', 'drone', 'simonk', 'speed controller', 'brushless'],
    images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Constant Current', value: '30', unit: 'A' },
      { key: 'Burst Current', value: '40', unit: 'A (10s)' },
      { key: 'BEC Output', value: '5V / 2A', unit: '' },
    ],
    variants: [
      { sku: 'MOT-ESC-SIMONK30A-STD', label: '30A ESC with Banana Connectors', price: 349, stock: 140 }
    ],
    ratings: { average: 4.8, count: 92 },
  },
  {
    name: 'DRV8825 High-Current Stepper Motor Driver Carrier',
    sku: 'MOT-DRV-DRV8825',
    slug: 'drv8825-high-current-stepper-motor-driver',
    categorySlug: 'motors',
    brand: 'TI',
    shortDescription: 'Supports up to 1/32 microstepping and 2.5A peak current for high-accuracy CNC axes.',
    description: 'The DRV8825 stepper motor driver board features Texas Instruments DRV8825 IC with adjustable current limiting, overcurrent and overtemperature protection, and 6 microstep resolutions down to 1/32-step.',
    basePrice: 149,
    tags: ['drv8825', 'stepper', '3d printer', 'cnc', 'microstep'],
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Operating Voltage', value: '8.2 - 45', unit: 'V' },
      { key: 'Microstep Resolution', value: 'Up to 1/32 step', unit: '' },
    ],
    variants: [
      { sku: 'MOT-DRV-DRV8825-SINK', label: 'DRV8825 Board + Aluminium Heatsink', price: 149, stock: 175 }
    ],
    ratings: { average: 4.7, count: 68 },
  },

  // 4. POWER MODULES (29-34)
  {
    name: 'LM2596 DC-DC Step-Down Buck Converter Module',
    sku: 'PWR-BUCK-LM2596',
    slug: 'lm2596-dc-dc-step-down-buck-converter-module',
    categorySlug: 'power',
    brand: 'National Semiconductor',
    shortDescription: 'High-efficiency adjustable voltage regulator reducing 4V-40V input to 1.25V-35V output.',
    description: 'The LM2596 step-down switching regulator provides a stable regulated output up to 3A with over 90% efficiency. Multi-turn precision potentiometer allows exact voltage tuning for microcontrollers and sensors.',
    basePrice: 89,
    tags: ['buck converter', 'step down', 'voltage regulator', 'lm2596', 'power'],
    images: ['https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Input Voltage', value: '4 - 40', unit: 'V' },
      { key: 'Output Voltage', value: '1.25 - 35', unit: 'V' },
      { key: 'Output Current', value: '3', unit: 'A Max' },
    ],
    variants: [
      { sku: 'PWR-BUCK-LM2596-STD', label: 'Standard LM2596 Module', price: 89, stock: 450 },
      { sku: 'PWR-BUCK-LM2596-DISP', label: 'LM2596 with Digital LED Voltmeter', price: 169, stock: 120 }
    ],
    ratings: { average: 4.9, count: 320 },
  },
  {
    name: 'XL6009 High Performance DC-DC Step-Up Boost Converter',
    sku: 'PWR-BOOST-XL6009',
    slug: 'xl6009-high-performance-dc-dc-boost-converter',
    categorySlug: 'power',
    brand: 'XLSEMI',
    shortDescription: 'Boost converter stepping up 3V-32V input to 5V-35V output with 4A switching capacity.',
    description: 'The XL6009 module is a high-performance step-up switching regulator with MOSFET switch technology. Ideal for stepping up single 3.7V Li-ion cells to 5V, 9V, or 12V for robotics circuits.',
    basePrice: 119,
    tags: ['boost converter', 'step up', 'xl6009', 'power', 'regulator'],
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Input Range', value: '3 - 32', unit: 'V' },
      { key: 'Output Range', value: '5 - 35', unit: 'V' },
      { key: 'Switching Current', value: '4', unit: 'A' },
    ],
    variants: [
      { sku: 'PWR-BOOST-XL6009-STD', label: 'Standard XL6009 Boost Module', price: 119, stock: 240 }
    ],
    ratings: { average: 4.8, count: 110 },
  },
  {
    name: 'TP4056 1A Li-Ion Battery Charger with Dual Protection (Type-C)',
    sku: 'PWR-CHG-TP4056-TC',
    slug: 'tp4056-1a-li-ion-battery-charger-type-c',
    categorySlug: 'power',
    brand: 'SparkTech',
    shortDescription: 'Single-cell 3.7V 18650 lithium battery charger board with overcharge and overcurrent protection.',
    description: 'This upgraded TP4056 module features modern Type-C USB input along with the DW01A protection IC and 8205A dual MOSFET. Provides 1A constant current charging with auto cut-off at 4.2V.',
    basePrice: 49,
    tags: ['tp4056', 'type-c', 'battery charger', '18650', 'protection'],
    images: ['https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Charge Cut-Off', value: '4.2', unit: 'V ±1%' },
      { key: 'Max Charge Current', value: '1000', unit: 'mA' },
      { key: 'Input Connector', value: 'USB Type-C', unit: '' },
    ],
    variants: [
      { sku: 'PWR-CHG-TP4056-TC-PROT', label: 'Type-C with Battery Protection (Pack of 2)', price: 89, stock: 600 }
    ],
    ratings: { average: 4.9, count: 390 },
  },
  {
    name: '12V 2A Regulated DC Power Supply Adapter',
    sku: 'PWR-ADP-12V2A',
    slug: '12v-2a-regulated-dc-power-supply-adapter',
    categorySlug: 'power',
    brand: 'SparkTech',
    shortDescription: 'High-stability SMPS power adapter with 5.5mm x 2.1mm DC barrel jack for Arduino and LED strips.',
    description: 'Commercial-grade 12V 24W DC power adapter with over-voltage, short-circuit, and thermal protection. Tested for continuous operation with Arduino Uno, Mega, motor driver boards, and IoT hubs.',
    basePrice: 249,
    tags: ['adapter', 'power supply', '12v', 'smps', 'barrel jack'],
    images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Output Voltage', value: '12', unit: 'V DC' },
      { key: 'Output Current', value: '2', unit: 'A' },
      { key: 'Connector Size', value: '5.5 x 2.1', unit: 'mm' },
    ],
    variants: [
      { sku: 'PWR-ADP-12V2A-IN', label: 'Indian 2-Pin Plug 12V 2A SMPS', price: 249, stock: 220 }
    ],
    ratings: { average: 4.8, count: 155 },
  },
  {
    name: 'MB102 Breadboard Power Supply Module (3.3V / 5V)',
    sku: 'PWR-MB102-BRD',
    slug: 'mb102-breadboard-power-supply-module',
    categorySlug: 'power',
    brand: 'SparkTech',
    shortDescription: 'Plugs directly into standard 830-point breadboards with independently selectable 3.3V / 5V rails.',
    description: 'The MB102 board snaps right into breadboard power buses. It accepts 6.5-12V DC input via 2.1mm barrel jack or USB, outputting 0V, 3.3V, or 5V independently on either side rail with jumper selectors.',
    basePrice: 119,
    tags: ['breadboard', 'power module', 'mb102', 'prototyping', '5v'],
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Output Rails', value: '3.3V and 5V Switchable', unit: '' },
      { key: 'Max Output Current', value: '700', unit: 'mA' },
    ],
    variants: [
      { sku: 'PWR-MB102-BRD-STD', label: 'MB102 Dual Rail Power Module', price: 119, stock: 280 }
    ],
    ratings: { average: 4.7, count: 190 },
  },
  {
    name: 'Orange 11.1V 2200mAh 3S 30C LiPo Battery Pack with XT60',
    sku: 'PWR-LIPO-3S2200',
    slug: 'orange-11-1v-2200mah-3s-30c-lipo-battery-xt60',
    categorySlug: 'power',
    brand: 'Orange',
    shortDescription: 'High discharge lithium polymer battery for drones, combat robots, and high-power RC systems.',
    description: 'Genuine Orange 3-cell 11.1V 2200mAh LiPo battery delivering 30C constant discharge rate (up to 66A burst). Fitted with high-conductivity gold-plated XT60 main connector and JST-XH balance lead.',
    basePrice: 1599,
    tags: ['lipo', 'battery', 'drone battery', 'xt60', 'rc power'],
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Nominal Voltage', value: '11.1', unit: 'V (3S)' },
      { key: 'Capacity', value: '2200', unit: 'mAh' },
      { key: 'Discharge Rate', value: '30C Constant / 60C Burst', unit: '' },
      { key: 'Connector', value: 'XT60 Female', unit: '' },
    ],
    variants: [
      { sku: 'PWR-LIPO-3S2200-XT60', label: '3S 2200mAh 30C with XT60', price: 1599, stock: 75 }
    ],
    ratings: { average: 4.9, count: 104 },
  },

  // 5. DISPLAYS (35-40)
  {
    name: '0.96 inch I2C OLED Display Module 128x64 (SSD1306)',
    sku: 'DSP-OLED-096-I2C',
    slug: '0-96-inch-i2c-oled-display-module-ssd1306',
    categorySlug: 'displays',
    brand: 'SparkTech',
    shortDescription: 'High-contrast self-illuminating graphical display module requiring only 2 I2C communication pins.',
    description: 'This 0.96 inch OLED display features 128x64 high resolution pixels powered by the SSD1306 driver. Because the display makes its own light, no backlight is required, resulting in deep blacks and ultra-low power consumption.',
    basePrice: 229,
    tags: ['oled', 'display', 'ssd1306', 'i2c', 'arduino display'],
    images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Resolution', value: '128 x 64', unit: 'pixels' },
      { key: 'Interface', value: 'I2C (Address 0x3C)', unit: '' },
      { key: 'Supply Voltage', value: '3.3 - 5', unit: 'V' },
    ],
    variants: [
      { sku: 'DSP-OLED-096-BLUE', label: 'Pure Blue Color OLED', price: 229, stock: 310 },
      { sku: 'DSP-OLED-096-WHITE', label: 'Pure White Color OLED', price: 239, stock: 200 }
    ],
    ratings: { average: 4.9, count: 280 },
  },
  {
    name: '16x2 Character LCD Display with I2C Backpack (Blue)',
    sku: 'DSP-LCD-1602-I2C',
    slug: '16x2-character-lcd-display-with-i2c-backpack',
    categorySlug: 'displays',
    brand: 'SparkTech',
    shortDescription: 'Classic HD44780 16-character by 2-line display pre-soldered with PCF8574 I2C adapter.',
    description: 'This package combines a high-quality 1602 LCD with a pre-soldered I2C backpack. Reduces required Arduino I/O lines from 6 pins down to just 2 wires (SDA and SCL) with adjustable contrast potentiometer.',
    basePrice: 199,
    tags: ['lcd', '1602', 'i2c', 'character display', 'hd44780'],
    images: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Characters', value: '16 x 2 lines', unit: '' },
      { key: 'Backlight Color', value: 'High-contrast Blue with White text', unit: '' },
      { key: 'Bus Interface', value: 'I2C (0x27 / 0x3F)', unit: '' },
    ],
    variants: [
      { sku: 'DSP-LCD-1602-I2C-BLU', label: '16x2 Blue Backlight + Soldered I2C', price: 199, stock: 260 }
    ],
    ratings: { average: 4.8, count: 340 },
  },
  {
    name: '3.5 inch TFT Touch Screen LCD Shield for Arduino Mega/Uno',
    sku: 'DSP-TFT-35-TOUCH',
    slug: '3-5-inch-tft-touch-screen-shield-arduino',
    categorySlug: 'displays',
    brand: 'Waveshare',
    shortDescription: '480x320 resolution full-color TFT display with resistive touch screen and SD card slot.',
    description: 'Plug-and-play 3.5 inch color TFT display shield designed to fit right onto Arduino Mega 2560 or Uno. Powered by the ILI9486 driver chip, it delivers rich graphics with built-in resistive touch stylus support.',
    basePrice: 899,
    tags: ['tft', 'touch screen', 'arduino shield', 'ili9486', 'gui'],
    images: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Screen Size', value: '3.5', unit: 'inches' },
      { key: 'Resolution', value: '480 x 320', unit: 'pixels' },
      { key: 'Touch Controller', value: 'Resistive Touch Panel with Stylus', unit: '' },
    ],
    variants: [
      { sku: 'DSP-TFT-35-TOUCH-SHD', label: '3.5 inch Touch Shield + Touch Pen', price: 899, stock: 65 }
    ],
    ratings: { average: 4.7, count: 78 },
  },
  {
    name: '8-Digit 7-Segment Digital LED Display (MAX7219)',
    sku: 'DSP-7SEG-MAX7219',
    slug: '8-digit-7-segment-digital-led-display-max7219',
    categorySlug: 'displays',
    brand: 'Maxim',
    shortDescription: 'Compact serial input/output common-cathode display driver module with 8 red digits.',
    description: 'The MAX7219 is an integrated serial input/output common-cathode display driver that connects microprocessors to 7-segment numeric LED displays of up to 8 digits. Requires only 3 digital I/O pins.',
    basePrice: 149,
    tags: ['7 segment', 'max7219', 'digital display', 'counter', 'timer'],
    images: ['https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Digits', value: '8 Red 7-Segment Digits', unit: '' },
      { key: 'Driver IC', value: 'MAX7219', unit: '' },
      { key: 'Wiring', value: '3-Wire SPI Serial', unit: '' },
    ],
    variants: [
      { sku: 'DSP-7SEG-MAX7219-RED', label: '8-Digit Red Module', price: 149, stock: 180 }
    ],
    ratings: { average: 4.8, count: 115 },
  },
  {
    name: 'WS2812B 16-Bit RGB 5050 Addressable LED Ring',
    sku: 'DSP-LED-WS2812-16',
    slug: 'ws2812b-16-bit-rgb-5050-addressable-led-ring',
    categorySlug: 'displays',
    brand: 'WorldSemi',
    shortDescription: 'Circular ring of 16 individually addressable 24-bit full-color LEDs with single-wire control.',
    description: 'This circular ring packs 16 ultra-bright smart NeoPixel-compatible WS2812B 5050 RGB LEDs. Each LED is addressable as the driver chip is inside the LED. Chainable and controllable with a single microcontroller pin.',
    basePrice: 249,
    tags: ['neopixel', 'ws2812b', 'rgb led', 'led ring', 'lighting'],
    images: ['https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'LED Count', value: '16x 5050 SMD LEDs', unit: '' },
      { key: 'Outer Diameter', value: '45', unit: 'mm' },
      { key: 'Color Depth', value: '24-bit (16.7M Colors)', unit: '' },
    ],
    variants: [
      { sku: 'DSP-LED-WS2812-16-RING', label: '16-LED Circular Ring PCB', price: 249, stock: 210 }
    ],
    ratings: { average: 4.9, count: 165 },
  },
  {
    name: '1.3 inch SPI IPS Color Display 240x240 HD (ST7789)',
    sku: 'DSP-IPS-130-ST7789',
    slug: '1-3-inch-spi-ips-color-display-st7789',
    categorySlug: 'displays',
    brand: 'Sitronix',
    shortDescription: 'Vibrant wide-viewing-angle IPS panel with 240x240 resolution and 4-wire SPI communication.',
    description: 'Featuring the ST7789V driver IC, this 1.3-inch IPS display delivers crisp, vibrant colors with wide 170-degree viewing angles. Uses 4-wire SPI and 3.3V logic, making it ideal for smartwatches and compact meters.',
    basePrice: 349,
    tags: ['ips display', 'st7789', 'spi', 'color screen', 'smartwatch'],
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Display Type', value: 'IPS Full Color', unit: '' },
      { key: 'Resolution', value: '240 x 240', unit: 'pixels' },
      { key: 'Viewing Angle', value: 'Full View (> 170°)', unit: '' },
    ],
    variants: [
      { sku: 'DSP-IPS-130-ST7789-MOD', label: '1.3 inch IPS 7-Pin SPI Module', price: 349, stock: 125 }
    ],
    ratings: { average: 4.8, count: 72 },
  },

  // 6. ROBOTICS KITS & PROTOTYPING (41-50)
  {
    name: 'Atal Tinkering Lab (ATL) Complete STEM Robotics Foundation Kit',
    sku: 'KIT-ATL-STEM-ROBO',
    slug: 'atal-tinkering-lab-atl-complete-stem-robotics-kit',
    categorySlug: 'kits',
    brand: 'SparkTech Edu',
    shortDescription: 'Comprehensive 120+ component STEM educational kit curated for Atal Tinkering Labs and school innovators.',
    description: 'Designed in compliance with NITI Aayog ATL guidelines, this master kit includes an Arduino Uno, 25+ sensors, DC motors, servo motors, breadboards, jumper wires, battery holders, chassis, and a complete 180-page curriculum book with 35 project experiments.',
    basePrice: 2899,
    tags: ['atal lab', 'atl kit', 'stem', 'school kit', 'robotics starter'],
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Project Count', value: '35+ Structured Experiments', unit: '' },
      { key: 'Microcontroller', value: 'Arduino Uno R3 Compatible', unit: '' },
      { key: 'Sensors Included', value: 'Ultrasonic, IR, LDR, DHT11, Gas, Touch, Sound', unit: '' },
      { key: 'Curriculum Guide', value: 'Printed 180-Page Step-by-Step Book', unit: '' },
    ],
    variants: [
      { sku: 'KIT-ATL-STEM-ROBO-STD', label: 'Standard ATL Kit with Storage Case', price: 2899, stock: 65 },
      { sku: 'KIT-ATL-STEM-ROBO-PRO', label: 'Advanced Edition (Includes Bluetooth + ESP32)', price: 3499, stock: 45 }
    ],
    ratings: { average: 5.0, count: 88 },
    isFeatured: true,
  },
  {
    name: '4-WD Smart Robot Car Kit with Ultrasonic Obstacle Avoidance',
    sku: 'KIT-4WD-SMARTCAR',
    slug: '4wd-smart-robot-car-kit-obstacle-avoidance',
    categorySlug: 'kits',
    brand: 'SparkTech',
    shortDescription: 'Complete 4-wheel drive robotics chassis with TT geared motors, L298N driver, servo & ultrasonic sonar.',
    description: 'Build your first autonomous vehicle! This kit includes a laser-cut dual-layer acrylic chassis, 4x TT gear motors, 4x rubber wheels, L298N motor driver, HC-SR04 ultrasonic sensor with SG90 servo pan-tilt, and code examples for autonomous obstacle avoidance.',
    basePrice: 1499,
    tags: ['4wd car', 'robot car', 'obstacle avoidance', 'diy kit', 'robotics'],
    images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Drive Type', value: '4-Wheel Drive (4WD)', unit: '' },
      { key: 'Motors', value: '4x DC Geared TT Motors (1:48)', unit: '' },
      { key: 'Modes', value: 'Obstacle Avoiding + Line Tracking', unit: '' },
    ],
    variants: [
      { sku: 'KIT-4WD-SMARTCAR-UNO', label: 'Complete Kit with Arduino Uno Board', price: 1499, stock: 120 }
    ],
    ratings: { average: 4.8, count: 165 },
    isFeatured: true,
  },
  {
    name: 'DIY 4-DOF Acrylic Robotic Arm Kit with Servos',
    sku: 'KIT-ARM-4DOF-ACR',
    slug: 'diy-4-dof-acrylic-robotic-arm-kit-servos',
    categorySlug: 'kits',
    brand: 'SparkTech',
    shortDescription: 'Educational 4-degrees-of-freedom tabletop robotic arm with precision gripper and 4x SG90 servos.',
    description: 'Learn inverse kinematics and servo motion control! Laser-cut high-grade acrylic structure with 4 degrees of movement (base rotation, shoulder, elbow, and gripper). Includes 4x micro servos, potentiometer joystick shield, and wiring guide.',
    basePrice: 1199,
    tags: ['robotic arm', '4dof', 'servo arm', 'kinematics', 'stem'],
    images: ['https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Degrees of Freedom', value: '4 DOF (Axes)', unit: '' },
      { key: 'Servos Included', value: '4x SG90 Micro Servos', unit: '' },
      { key: 'Material', value: '3mm Laser Cut Black Acrylic', unit: '' },
    ],
    variants: [
      { sku: 'KIT-ARM-4DOF-ACR-SER', label: 'Arm Structure + 4x Servos', price: 1199, stock: 85 }
    ],
    ratings: { average: 4.8, count: 92 },
  },
  {
    name: 'F450 Quadcopter Drone Frame with Power Distribution Board',
    sku: 'KIT-DRONE-F450-FRM',
    slug: 'f450-quadcopter-drone-frame-kit-landing-gear',
    categorySlug: 'kits',
    brand: 'DJI Type',
    shortDescription: 'Sturdy ultra-strength glass fiber and polyamide drone frame with integrated PCB power distribution.',
    description: 'The F450 is the industry-standard frame for DIY drone enthusiasts and academic research. The integrated PCB center plate allows direct soldering of ESCs and battery leads, with impact-absorbing composite arms and high landing skids.',
    basePrice: 849,
    tags: ['drone frame', 'f450', 'quadcopter', 'uav', 'dji compatible'],
    images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Wheelbase Diameter', value: '450', unit: 'mm' },
      { key: 'Frame Weight', value: '282', unit: 'grams' },
      { key: 'Recommended Propellers', value: '9450 / 1045 Propellers', unit: '' },
    ],
    variants: [
      { sku: 'KIT-DRONE-F450-FRM-STD', label: 'F450 Frame Kit + Landing Skid Legs', price: 849, stock: 110 }
    ],
    ratings: { average: 4.9, count: 124 },
  },
  {
    name: '830 Tie-Point Solderless Breadboard with 65pcs Jumper Wire Bundle',
    sku: 'KIT-PROTO-BB830-JMP',
    slug: '830-tie-point-breadboard-65pcs-jumper-wire-bundle',
    categorySlug: 'kits',
    brand: 'SparkTech',
    shortDescription: 'High-durability transparent prototype breadboard with self-adhesive backing and multi-color jumper wires.',
    description: 'Essential for every electronics workbench! Contains one full-size 830-tie-point solderless breadboard with nickel-plated spring clips and dual power rails, packaged with 65 pre-stripped flexible male-to-male jumper wires.',
    basePrice: 189,
    tags: ['breadboard', 'jumper wires', 'prototyping', 'starter essentials'],
    images: ['https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Tie Points', value: '830 Points (630 IC + 200 Power)', unit: '' },
      { key: 'Jumper Wire Count', value: '65 Pieces Multi-Length', unit: '' },
    ],
    variants: [
      { sku: 'KIT-PROTO-BB830-JMP-SET', label: 'Breadboard + 65 Jumper Wires', price: 189, stock: 450 }
    ],
    ratings: { average: 4.8, count: 310 },
  },
  {
    name: 'ESP32 IoT Smart Agriculture & Weather Station Starter Kit',
    sku: 'KIT-IOT-WEATHER-ESP32',
    slug: 'esp32-iot-smart-agriculture-weather-station-kit',
    categorySlug: 'kits',
    brand: 'SparkTech',
    shortDescription: 'Complete cloud-connected weather telemetry kit with soil moisture, DHT22, rain sensor & OLED.',
    description: 'Build a cloud-connected smart weather and soil monitoring station. Transmits environmental telemetry to Blynk, Adafruit IO, or your private MQTT server. Includes ESP32 board, capacitive soil moisture sensor, rain sensor, DHT22, 0.96 OLED, and relay module.',
    basePrice: 1699,
    tags: ['iot kit', 'weather station', 'smart agriculture', 'esp32', 'blynk'],
    images: ['https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Connectivity', value: 'Wi-Fi + Cloud MQTT / HTTP API', unit: '' },
      { key: 'Sensors Included', value: 'Soil Moisture, Rain, DHT22, LDR', unit: '' },
    ],
    variants: [
      { sku: 'KIT-IOT-WEATHER-ESP32-BOX', label: 'Complete Kit with Enclosure Box', price: 1699, stock: 70 }
    ],
    ratings: { average: 4.9, count: 86 },
    isFeatured: true,
  },
  {
    name: '4-Channel 5V Relay Module with Optocoupler Isolation',
    sku: 'KIT-RELAY-4CH-OPTO',
    slug: '4-channel-5v-relay-module-optocoupler',
    categorySlug: 'kits',
    brand: 'Songle',
    shortDescription: 'Opto-isolated relay interface board capable of switching 10A 250VAC mains loads.',
    description: 'Control home AC appliances safely! This 4-channel relay interface board can control high-power devices up to 10A 250VAC or 10A 30VDC. Optocoupler isolation protects your sensitive microcontrollers from inductive back-EMF.',
    basePrice: 189,
    tags: ['relay', 'home automation', 'optocoupler', 'ac control', 'smart home'],
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Control Signal', value: '5V Active LOW / HIGH', unit: '' },
      { key: 'Max AC Load', value: '10A / 250V AC', unit: '' },
      { key: 'Max DC Load', value: '10A / 30V DC', unit: '' },
    ],
    variants: [
      { sku: 'KIT-RELAY-4CH-OPTO-5V', label: '4-Channel 5V Board', price: 189, stock: 290 }
    ],
    ratings: { average: 4.8, count: 220 },
  },
  {
    name: '4-Channel Bi-Directional Logic Level Converter (3.3V to 5V)',
    sku: 'KIT-LLC-4CH-BIDIR',
    slug: '4-channel-bi-directional-logic-level-converter',
    categorySlug: 'kits',
    brand: 'SparkTech',
    shortDescription: 'Safely steps down 5V signals to 3.3V and steps up 3.3V to 5V on I2C, SPI, and UART lines.',
    description: 'Small device that safely connects 5V and 3.3V devices on the same data lines. Essential for connecting 3.3V sensors (like ESP32, Raspberry Pi, or I2C sensors) with 5V Arduino boards without blowing pins.',
    basePrice: 49,
    tags: ['level shifter', '3.3v to 5v', 'i2c', 'logic converter', 'protection'],
    images: ['https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Channels', value: '4 Bi-Directional Channels', unit: '' },
      { key: 'High Voltage Rail', value: '5', unit: 'V' },
      { key: 'Low Voltage Rail', value: '3.3', unit: 'V' },
    ],
    variants: [
      { sku: 'KIT-LLC-4CH-BIDIR-P2', label: 'Pack of 2 Level Converters', price: 89, stock: 450 }
    ],
    ratings: { average: 4.8, count: 175 },
  },
  {
    name: 'CNC Shield V3 Expansion Board for Arduino Uno',
    sku: 'KIT-CNC-SHIELD-V3',
    slug: 'cnc-shield-v3-expansion-board-arduino-uno',
    categorySlug: 'kits',
    brand: 'Protoneer',
    shortDescription: 'GRBL-compatible 4-axis stepper driver shield for mini CNC engraving machines and 3D carvers.',
    description: 'This expansion board plugs directly onto an Arduino Uno. Running open-source GRBL firmware, it controls 4 stepper motors (X, Y, Z, plus an optional cloned axis) via A4988 or DRV8825 stepper driver modules.',
    basePrice: 249,
    tags: ['cnc shield', 'grbl', 'engraving', 'stepper shield', 'diy cnc'],
    images: ['https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Axis Count', value: '4 Axes (X, Y, Z, A)', unit: '' },
      { key: 'Compatibility', value: 'Arduino Uno + GRBL', unit: '' },
      { key: 'Driver Sockets', value: '4x A4988 / DRV8825 compatible', unit: '' },
    ],
    variants: [
      { sku: 'KIT-CNC-SHIELD-V3-BRD', label: 'CNC Shield V3 Board Only', price: 249, stock: 120 },
      { sku: 'KIT-CNC-SHIELD-V3-4DRV', label: 'CNC Shield + 4x A4988 Drivers', price: 549, stock: 85 }
    ],
    ratings: { average: 4.8, count: 98 },
  },
  {
    name: 'CP2102 USB to TTL UART Serial Converter Module (6-Pin)',
    sku: 'KIT-USB-TTL-CP2102',
    slug: 'cp2102-usb-to-ttl-uart-serial-converter',
    categorySlug: 'kits',
    brand: 'Silicon Labs',
    shortDescription: 'Industrial-grade USB 2.0 to UART bridge with selectable 3.3V and 5V power output.',
    description: 'Reliable CP2102 chipset with hardware flow control support. Widely used for programming Arduino Pro Mini, ESP-01, flashing router firmware, and debugging serial telemetry with PCs.',
    basePrice: 159,
    tags: ['usb to ttl', 'serial converter', 'cp2102', 'flashing', 'uart'],
    images: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'],
    attributes: [
      { key: 'Chipset', value: 'Silicon Labs CP2102', unit: '' },
      { key: 'Baud Rate', value: '300 bps to 1.5 Mbps', unit: '' },
      { key: 'Output Voltage', value: 'Dual 3.3V and 5V', unit: '' },
    ],
    variants: [
      { sku: 'KIT-USB-TTL-CP2102-MOD', label: 'CP2102 Module + 4-Pin Dupont Cable', price: 159, stock: 240 }
    ],
    ratings: { average: 4.9, count: 210 },
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully.');

    // 1. Seed or Update Categories
    console.log('Seeding Categories...');
    const categoryMap = {};

    for (const cat of CATEGORIES_DATA) {
      const categoryDoc = await Category.findOneAndUpdate(
        { name: cat.name },
        { ...cat },
        { upsert: true, returnDocument: 'after' }
      );
      categoryMap[cat.slug] = categoryDoc._id;
      if (cat.slug === 'motors-actuators') categoryMap['motors'] = categoryDoc._id;
      if (cat.slug === 'power-modules') categoryMap['power'] = categoryDoc._id;
    }
    console.log(`Initialized ${Object.keys(categoryMap).length} Categories.`);

    // 2. Clear old test products or upsert all 50 products
    console.log(`Processing ${PRODUCTS_DATA.length} Products...`);

    let seededCount = 0;
    for (const item of PRODUCTS_DATA) {
      const { categorySlug, ...productPayload } = item;
      const categoryId = categoryMap[categorySlug] || categoryMap['microcontrollers'];

      // Compute basePrice accurately from variants
      const basePrice = Math.min(...productPayload.variants.map((v) => v.price));

      await Product.findOneAndUpdate(
        { sku: productPayload.sku },
        {
          ...productPayload,
          category: categoryId,
          basePrice,
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededCount++;
    }

    console.log(`\n🎉 Successfully Seeded ${seededCount} Products into MongoDB Atlas!`);
    const totalCount = await Product.countDocuments();
    console.log(`Total Products in Database now: ${totalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
