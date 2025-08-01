<h1 align="center">💰 E-WALLET 💰</h1>
<h2 align="center">Digital Wallet API Server</h2>
<h3 align="center">Develop E-WALLET Management System using Express, TypeScript, and MongoDB (via Mongoose). </h3>

<p align="center">
  A full-featured RESTful API for managing financial operations such as add-money, withdraw-money, send-money, cash-in, cash-out!..
</p>

## 📖 Overview

This project is a **Digital Wallet** system that allows users to securely manage their funds and perform transactions. It supports operations such as:

- **Add Money**: Deposit funds into your wallet.
- **Withdraw Money**: Withdraw funds to another account.
- **Send Money**: Transfer funds to other users in the system.
- **Transaction History**: View and manage previous transactions.
- **Wallet Balance**: Check current balance anytime.

The system is designed to be user-friendly, secure, and scalable, offering a seamless experience for managing digital payments.

---

---

## 💳 Digital Wallet API – eWallet – Action Mapping

| Action              | Transaction Type (`type`) | Sender            | Receiver        | Source              | Created By | Description                                                           |
| ------------------- | ------------------------- | ----------------- | --------------- | ------------------- | ---------- | --------------------------------------------------------------------- |
| Add Money           | `add`                     | None              | User            | bank / card / bkash | User       | User adds money from external source to their wallet.                 |
| Withdraw Money      | `withdraw`                | User              | None            | bank / bkash        | User       | User withdraws money from wallet to bank or mobile financial service. |
| Send Money          | `send`                    | User              | Another User    | None                | User       | User sends money to another user (wallet to wallet transfer).         |
| Cash-In (Agent)     | `cash-in`                 | Agent             | User            | cash                | Agent      | Agent takes physical cash and adds money to the user's wallet.        |
| Cash-Out (Agent)    | `cash-out`                | User              | Agent           | cash                | Agent      | Agent gives physical cash, deducts from user's wallet balance.        |
| Reverse Txn (Admin) | `reversed`                | Original Receiver | Original Sender | None                | Admin      | Admin reverses a transaction (e.g., fraud or error case).             |
