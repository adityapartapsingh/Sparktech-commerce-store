# Product Requirements Document (PRD)

## 1. Product Overview
**SparkTech** is a specialized, full-stack e-commerce platform engineered specifically for roboticists, hardware developers, IoT engineers, academic labs, and DIY makers. Unlike mass-market consumer storefronts, SparkTech provides deep technical transparency (datasheets, pinout specs, operating voltages, communication protocols), developer-native authentication (Google & GitHub OAuth), instant courier dispatch telemetry, and B2B commercial invoicing with GSTIN input tax credit.

---

## 2. Problem Statement
The current electronic components and robotics market is polarized and fractured:
1. **Outdated Regional Stores (Robu.in, Technobothix, MakerBazar)**: Cluttered 2010s layouts, severe password/OTP signup friction, poor mobile interfaces, and slow checkout flows that cause high abandonment among busy developers.
2. **Mass E-Commerce (Amazon, Flipkart)**: Lack granular technical parametric search (unable to filter by logic level 3.3V vs 5V, interface SPI/I2C/UART, or IC package DIP/SMD). Often plagued by counterfeit/unverified silicon without pinout documentation.
3. **Global Importers (SparkFun, Adafruit, DigiKey)**: Excellent technical documentation, but burdened with steep international freight, long transit times, and lack of localized domestic logistics and GST tax credit workflows for Indian institutions.

---

## 3. Goals & Objectives
- **Zero-Friction Onboarding**: Replace cumbersome email/password forms with 1-click Google & GitHub OAuth, achieving sub-10-second registration.
- **Spec-Driven Commerce**: Provide instant access to component specifications, pinouts, and PDF datasheets directly on product pages.
- **Mobile-First Conversion**: Incorporate thumb-zone ergonomics (Amazon/Flipkart sticky action bar: Price + Cart + "Buy Now") to maximize mobile conversion rates (68%+ of developer discovery occurs on mobile).
- **Institutional & Enterprise Readiness**: Automate B2B procurement with GSTIN capture for 18% input tax credit invoicing.
- **High-Trust Hardware Aesthetic**: Deliver an authentic, laboratory-grade "Obsidian Telemetry" design with interactive PCB circuit animations—free of generic "AI template" clichés.

---

## 4. Target User Personas

### Persona A: The Independent Maker / Engineering Student ("Alex")
- **Profile**: Robotics hobbyist, university student building drone or IoT prototypes.
- **Needs**: Quick discovery of breadboard-friendly modules (ESP32, Arduino, SG90 servos, sensor breakouts), fast UPI/card payments, and real-time courier SMS updates.
- **Pain Point**: Forgetting passwords, waiting for email OTP codes, unverified components arriving broken.

### Persona B: The Research Lab Engineer / B2B Procurement Lead ("Dr. Rao")
- **Profile**: Lead researcher at an autonomous robotics lab or hardware startup.
- **Needs**: Batch ordering, volume price tiering (1-9 pcs, 10-49 pcs, 50+ pcs), RoHS/CE compliance verification, and formal commercial GST tax invoices with GSTIN input tax credit.
- **Pain Point**: Lack of compliant tax invoices and difficult invoice reconciliation on consumer storefronts.

---

## 5. Core Features

### 5.1 Developer-Native Authentication & Onboarding
- **Strict OAuth 2.0 Access**: Solely Google and GitHub sign-in (passwords and manual credential forms eliminated).
- **Interactive PCB Circuit Visuals**: Hardware-aligned animated vector canvas with flowing current pulses.
- **Post-Auth Logistics Onboarding**:
  - Courier dispatch mobile phone verification (with international country code picker).
  - Role definition: *Independent Maker / Student* vs. *Research Lab / Enterprise*.
  - Optional GSTIN / Tax ID field for instant commercial invoice generation.
  - Default workbench delivery address capture.

### 5.2 Catalog & Parametric Search
- **Taxonomy**: Microcontrollers, Development Boards, Sensors, Motor Drivers & Actuators, Power Modules & LiPo, IoT & Wireless, Prototyping & Accessories.
- **Parametric Attributes**: Filter by Voltage (3.3V, 5V, 12V), Protocol (I2C, SPI, UART, CAN, PWM), and Mounting (Through-Hole DIP, SMD).
- **Live Inventory Telemetry**: Stock countdowns (`In Stock`, `Only 4 left`, `Out of Stock`).

### 5.3 Product Detail Page (PDP)
- Multi-image zoom gallery with pinout overlays.
- Tabbed technical interface: Overview, Technical Specs, PDF Datasheet download, Short & Extended Warranty, Verified Customer Reviews.
- Sticky mobile action bar with live price, quick cart addition, and 1-tap "Buy Now".
- Confidential support drawer for technical inquiries.

### 5.4 Cart & Checkout
- TanStack Query cached persistent shopping cart (merges guest and authenticated items).
- Real-time order summary calculation (subtotal, shipping fees, GST calculation).
- Secure Razorpay payment gateway integration (UPI, Credit/Debit Cards, Net Banking).
- Automated SMS/WhatsApp notifications on dispatch and delivery.

### 5.5 Customer & Admin Dashboards
- **Customer**: Order tracking, invoice download, saved addresses management, and wishlist.
- **Admin**: Product inventory management, order status lifecycle updating (Pending -> Processing -> Shipped -> Delivered), customer telemetry, feedback logs, and PDF/Excel data export.
