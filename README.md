<h1 align="center">💰 E-WALLET 💰</h1>
<h2 align="center">Digital Wallet API Server</h2>
<h3 align="center">Develop E-WALLET Management System using Express, TypeScript, and MongoDB (via Mongoose). </h3>

<p align="center">
  A full-featured RESTful API for managing financial operations such as add-money, withdraw-money, send-money, cash-in, cash-out!
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

## ✅ API Overview

## 🚀 Auth API Routes

| **Sl. No.** | **Method** | **Endpoint**        | **Access**                      | **Description**                                                |
| ----------- | ---------- | ------------------- | ------------------------------- | -------------------------------------------------------------- |
| 1           | POST       | /auth/login         | Public                          | Authenticates a user and returns JWT tokens.                   |
| 2           | POST       | /auth/logout        | Private                         | Logs out the user and invalidates the session/token.           |
| 3           | POST       | /auth/change-pin    | Authenticated Users (All Roles) | Allows users, agents, and admins to change their PIN securely. |
| 4           | POST       | /auth/refresh-token | Public (with refresh token)     | Issues a new access token using a valid refresh token.         |

## 🚀 USER API Routes

| **Sl. No.** | **Method** | **Endpoint**             | **Access**                     | **Description**                                                                                                               |
| ----------- | ---------- | ------------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 1           | POST       | /user/register           | Public                         | Register New User                                                                                                             |
| 2           | GET        | /user/me                 | All Roles (user, agent, admin) | Get the current user's profile (based on the token)                                                                           |
| 3           | PATCH      | /user/approval-agent/:id | Admin Only                     | Approve or suspend an agent by ID                                                                                             |
| 4           | GET        | /user/get-all-user       | Admin Only                     | Retrieve all user role accounts                                                                                               |
| 5           | PATCH      | /user/profile-update     | All Roles (user, agent, admin) | Update the currently authenticated user's profile (self-update only). Only allows updating name, email, address, and picture. |
| 6           | PATCH      | /user/:id                | Admin Only                     | Update a user/agent by ID                                                                                                     |

## 🚀 Agent API Routes

| **Sl. No.** | **Method** | **Endpoint**         | **Access** | **Description**                                       |
| ----------- | ---------- | -------------------- | ---------- | ----------------------------------------------------- |
| 1           | GET        | /agent/get-all-agent | Admin Only | Retrieve all agent role accounts                      |
| 2           | POST       | /agent/cash-in       | Agent Only | Agent can add money to a user's wallet (Cash-In)      |
| 3           | POST       | /agent/cash-out      | Agent Only | Agent withdraws (cash-out) money from a user's wallet |

## 🚀 Wallet API Routes

| **Sl. No.** | **Method** | **Endpoint**       | **Access**  | **Description**                                     |
| ----------- | ---------- | ------------------ | ----------- | --------------------------------------------------- |
| 1           | GET        | /wallet            | Admin Only  | Retrieve all user and agent wallets                 |
| 2           | GET        | /wallet/my-wallet  | User, Agent | Retrieve user or agent wallets (based on the token) |
| 3           | POST       | /wallet/add-money  | User Only   | Allows a user to add money to their own wallet      |
| 4           | POST       | /wallet/send-money | User Only   | Allows a user to send money to another user         |
| 5           | POST       | /wallet/withdraw   | User Only   | Allows a user to withdraw money from their wallet   |
| 6           | PATCH      | /wallet/block/:id  | Admin Only  | Block or unblock a wallet by wallet ID              |

## 🚀 Transaction API Routes

| **Sl. No.** | **Method** | **Endpoint**                 | **Access**  | **Description**                                                                                                         |
| ----------- | ---------- | ---------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1           | GET        | /transaction/my-transactions | User, Agent | Retrieve a paginated list of the user's or agent's transactions (based on the token)                                    |
| 2           | GET        | /transaction                 | Admin Only  | Retrieve all transactions in the system!                                                                                |
| 3           | POST       | /transaction/:id             | Admin Only  | Reverse a specific transaction by its ID. Only admins can perform this action                                           |
| 4           | GET        | /transaction/:id             | Admin Only  | Retrieve a single transaction by ID                                                                                     |
| 5           | GET        | /transaction/my-commission   | Agent       | Retrieve total commission and transactions (based on the token)                                                         |
| 6           | POST       | /transaction/complete/:id    | User        | Marks a transaction (by its ID) as complete. Only allowed for transaction types: Add-money, Withdraw-money, Send-money! |

## 💳 Digital Wallet API – eWallet – Action Mapping

| Action              | Transaction Type (`type`) | Sender            | Receiver        | Source              | Created By | Description                                                           |
| ------------------- | ------------------------- | ----------------- | --------------- | ------------------- | ---------- | --------------------------------------------------------------------- |
| Add Money           | `add`                     | None              | User            | bank / card / bkash | User       | User adds money from external source to their wallet.                 |
| Withdraw Money      | `withdraw`                | User              | None            | bank / bkash        | User       | User withdraws money from wallet to bank or mobile financial service. |
| Send Money          | `send`                    | User              | Another User    | None                | User       | User sends money to another user (wallet to wallet transfer).         |
| Cash-In (Agent)     | `cash-in`                 | Agent             | User            | cash                | Agent      | Agent takes physical cash and adds money to the user's wallet.        |
| Cash-Out (Agent)    | `cash-out`                | User              | Agent           | cash                | Agent      | Agent gives physical cash, deducts from user's wallet balance.        |
| Reverse Txn (Admin) | `reversed`                | Original Receiver | Original Sender | None                | Admin      | Admin reverses a transaction (e.g., fraud or error case).             |
