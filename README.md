# 🏥 Decentralized Health Records

> Take back control of your medical data with blockchain-powered security

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Stacks](https://img.shields.io/badge/Built%20with-Stacks-5546FF)](https://stacks.co/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

A revolutionary healthcare platform that puts patients back in control of their medical records. Built on the Stacks blockchain with military-grade encryption, this app ensures your health data is truly yours—secure, private, and accessible only to those you trust.

## ✨ Why This Matters

Healthcare data breaches cost the industry billions annually, while patients have zero control over their most sensitive information. We're changing that. Your medical records should belong to YOU, not some corporation's database that gets hacked every other month.

## 🚀 Features

### 🔐 **Bank-Level Security**
- End-to-end encryption using Gaia's decentralized storage
- Private keys never leave your device
- Blockchain-immutable access logs (because trust, but verify)

### 👨‍⚕️ **Smart Access Control**
- Grant specific permissions to doctors, specialists, or family members
- Temporary access for consultations that automatically expires
- Emergency access protocols for critical situations
- Revoke access instantly with one click

### 📱 **Dead Simple UX**
- Connect with any Stacks wallet in seconds
- Drag-and-drop file uploads for lab results, X-rays, prescriptions
- Search and filter through years of medical history
- Works on mobile, tablet, and desktop

### 🌐 **Truly Decentralized**
- No central authority can access your data
- Works even if our servers go down
- Your data lives on the decentralized Gaia network
- Built on Stacks—Bitcoin's smart contract layer

## 🛠 Tech Stack

| Component | Technology | Why We Chose It |
|-----------|------------|-----------------|
| **Frontend** | Next.js 15 + TypeScript | Fast, type-safe, and SEO-friendly |
| **Styling** | Tailwind CSS | Rapid prototyping without sacrificing design |
| **Blockchain** | Stacks (Clarity) | Bitcoin security with smart contract functionality |
| **Storage** | Gaia Hub | Decentralized, encrypted, user-controlled |
| **Wallet** | Stacks Web Wallet | Seamless onboarding for new users |

## 🏃‍♂️ Quick Start

### Prerequisites

Make sure you have these installed:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Stacks Web Wallet** - [Get it here](https://wallet.hiro.so/)

### Installation

```bash
# Clone this bad boy
git clone https://github.com/yourusername/decentralized-health-records.git
cd decentralized-health-records

# Install frontend dependencies
cd frontend
npm install

# Fire it up!
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're off to the races! 🎉

### Optional: Deploy Smart Contracts

```bash
# Install Clarinet (if you haven't already)
npm install -g @hirosystems/clarinet-cli

# Deploy to testnet
npm run deploy
```

## 📖 How It Works

1. **Connect Your Wallet** - One-click connection with any Stacks wallet
2. **Upload Records** - Drag and drop your medical files (PDFs, images, documents)
3. **Set Permissions** - Decide who can see what and for how long
4. **Share Securely** - Your doctor gets access without compromising your privacy
5. **Stay In Control** - Revoke, modify, or audit access anytime

## 🔧 Smart Contract API

Our Clarity smart contracts provide these key functions:

| Function | Description | Who Can Call |
|----------|-------------|--------------|
| `create-record` | Store encrypted record metadata on-chain | Record owner |
| `grant-access` | Give read/write permissions to specific users | Record owner |
| `revoke-access` | Remove user permissions instantly | Record owner |
| `can-access-record` | Check if user has access to a record | Anyone |

## 🛡 Security Features

- **Zero-Knowledge Architecture** - We literally cannot see your data
- **Encrypted at Rest** - Everything stored on Gaia is encrypted with your keys
- **Blockchain Audit Trail** - Every permission change is recorded immutably
- **Emergency Access** - Configurable emergency contacts for critical situations
- **Auto-Expiring Permissions** - Set time-based access that expires automatically

## 🤝 Contributing

We'd love your help making healthcare data ownership a reality! Here's how to get started:

1. **Fork the repo** on GitHub
2. **Create a feature branch** (`git checkout -b amazing-new-feature`)
3. **Make your changes** and add tests
4. **Commit your changes** (`git commit -m 'Add amazing new feature'`)
5. **Push to your branch** (`git push origin amazing-new-feature`)
6. **Open a Pull Request** and tell us about your changes

### Development Commands

```bash
# Run the frontend locally
npm run dev

# Run all tests
npm test

# Run a specific test
npm run test -- --testNamePattern="create-record"

# Lint your code
npm run lint

# Build for production
npm run build
```

## 🐛 Found a Bug?

Open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

Security vulnerabilities should be reported privately to [security@yourproject.com](mailto:security@yourproject.com).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The Stacks community for building Bitcoin DeFi
- Blockstack/Gaia teams for decentralized storage
- Everyone fighting for digital privacy rights
- Healthcare workers who inspired this project

---

**Built with ❤️ by developers who believe your data should be yours.**

*Star this repo if you believe in a future where patients control their own health data!* ⭐
