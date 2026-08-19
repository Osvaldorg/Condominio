<h1 align="center">🏢 Condominio - Mobile Management App</h1>

<p align="center">
  A comprehensive cross-platform mobile application developed for condominium residents and administration to centralize daily operations, financial management, and real-time communication.
</p>

## 📱 About The Project

Condominio solves the communication and administrative gap in residential complexes. It provides a unified platform where residents can check their financial status, authorize visitors via QR codes, track packages, and chat in real-time with the administration.

### 🛠️ Built With

* **Frontend:** React Native, Expo, TypeScript
* **State Management:** Zustand
* **Styling:** Uniwind
* **Real-time & Notifications:** Socket.IO, Firebase Cloud Messaging (FCM)
* **API & Auth:** REST APIs, Axios, JWT
* **Other:** QR Code generation

## ✨ Key Features

- **🔐 Secure Access Control:** JWT-based authentication with secure session management.
- **🎫 QR Visitor Authorization:** Generation of unique QR codes and access pins for different types of visitors.
- **💬 Real-Time Chat:** Instant communication channel between residents and administration using Socket.IO.
- **🔔 Push Notifications:** Integrated with Firebase Cloud Messaging to alert users about payments, visitors, and packages.
- **💰 Financial Management:** Track payment history, upcoming debts, and submit payment proofs directly from the app.
- **📦 Package Tracking:** Real-time updates on package deliveries and statuses.

## 🧠 What I Learned & Challenges Overcome

Developing this mobile application during my professional internship taught me how to handle complex mobile states and real-time data:
- **Real-Time Infrastructure:** Integrating Socket.IO in a React Native environment required careful lifecycle management to prevent memory leaks and required careful lifecycle management and reconnection handling.
- **Push Notifications:** Implementing Firebase Cloud Messaging for iOS and Android involved managing device tokens and handling notification interactions when the app is both foregrounded and backgrounded.
- **API Integration:** Learned to effectively manage asynchronous data fetching and global state using Zustand, significantly reducing prop-drilling compared to Context API.

## 🚀 Getting Started

To run this project locally:

\```bash
# Clone the repository
git clone https://github.com/Osvaldorg/Condominio.git

# Install dependencies
npm install

# Set up environment variables
# Create a .env file based on your api keys

# Start the Expo development server
npx expo start
\```

