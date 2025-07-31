## 💳 Digital Wallet API – eWallet – Action Mapping

| Action              | Transaction Type (`type`) | Sender            | Receiver        | Source              | Created By | Description                                                           |
| ------------------- | ------------------------- | ----------------- | --------------- | ------------------- | ---------- | --------------------------------------------------------------------- |
| Add Money           | `add`                     | None              | User            | bank / card / bkash | User       | User adds money from external source to their wallet.                 |
| Withdraw Money      | `withdraw`                | User              | None            | bank / bkash        | User       | User withdraws money from wallet to bank or mobile financial service. |
| Send Money          | `send`                    | User              | Another User    | None                | User       | User sends money to another user (wallet to wallet transfer).         |
| Cash-In (Agent)     | `cash-in`                 | Agent             | User            | agent / cash        | Agent      | Agent takes physical cash and adds money to the user's wallet.        |
| Cash-Out (Agent)    | `cash-out`                | User              | Agent           | agent / cash        | Agent      | Agent gives physical cash, deducts from user's wallet balance.        |
| Reverse Txn (Admin) | `reversed`                | Original Receiver | Original Sender | None                | Admin      | Admin reverses a transaction (e.g., fraud or error case).             |
