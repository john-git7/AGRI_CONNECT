# AgriConnect — B2B/B2F Pre-Harvest Supply & Procurement Platform

> **"Create the market before the crop is grown."**

AgriConnect is an enterprise-grade B2B/B2F pre-harvest supply chain ledger that connects corporate bulk buyers (food processors, retail chains, exporters, agribusinesses) directly with regional farmers. By enabling buyers to lock in crop agreements *prior* to cultivation, AgriConnect secures guaranteed demand for growers, unlocks pre-harvest financing referrals, provides real-time crop timeline logging, and uses analytical intelligence to predict yields and environmental risks.

---

## How It Works (Pre-Harvest Sequence)

Instead of post-harvest marketplaces that expose farmers to price volatility and waste, AgriConnect flips the agricultural commerce sequence:

```text
  [ Bulk Buyer ] ───► Publishes Procurement Target (Demand)
                             │
                             ▼
  [   Farmer   ] ───► Submits Volume Commitment against Demand
                             │
                             ▼
  [  Platform  ] ───► Auto-spawns cultivation tracking Project (on acceptance)
                             │
                             ▼
  [  Tracking  ] ───► Logs milestone stage progress & weather risks
                             │
                             ▼
  [ Settlement ] ───► Post-harvest B2B procurement settlement & payout
```

---

## Key Features

### For Farmers (Growers)
* **Demand Discovery**: Browse verified regional procurement target sheets posted by institutional corporate clients.
* **Volume Commitment**: Commit future crop yields to active demands before putting seeds in the soil.
* **Cultivation Trackers**: Update milestones (Planted, Germination, Vegetative, Harvest Ready) with expenses, and view interactive timeline charts.
* **Ecosystem Analytics**: Run predictive yield models and evaluate localized weather risk metrics.
* **Pre-Harvest Support Requests**: Secure financing and pre-harvest inputs by referring contract agreements to partner financial institutions.

### For Bulk Buyers (Procurement Teams)
* **Publish Demand**: Specify target crop, tonnage targets, quality standards, delivery periods, and region limits.
* **Commitment Manager**: View and accept commitments submitted by regional farmers with calculated profile match scores.
* **Production Feeds**: Monitor live cultivation updates and milestone logs across committed farms.
* **Direct Procurement**: Settle post-harvest invoices with automated billing, weight logs, and direct payout transactions.

### For System Administrators (Command Center)
* **Directory Approval**: Review and verify grower/buyer profile credentials.
* **Ecosystem Monitor**: Read metrics on total active acreage, aggregate tonnage commitments, support funding requests, and payout cashflow.
* **CRUD Manager**: Full admin controls to view, add, edit, and delete entries across users, commitments, active projects, support requests, and orders.
* **Ecosystem Exports**: Generate printable summary reports and download spreadsheet files (CSV, JSON, Plain Text) of transactions and directory ledgers.

---

## Technical Stack

* **Frontend**: React.js (Vite compiler), React Router, Axios, Tailwind CSS, Framer Motion, Lucide icons, React Toastify.
* **Backend**: Node.js, Express.js, JWT Authentication (custom middleware), Multer (image uploads).
* **Database**: MongoDB (Atlas) & Mongoose schemas.
* **Testing**: Forked-child integration script (`test-apis.js`).

---

## Project Architecture

```text
AGRI_CONNECT/
├── backend/
│   ├── middleware/        # JWT authorization & routes protection
│   ├── models/            # Mongoose B2B supply chain collections
│   ├── routes/            # REST API controllers & router endpoints
│   ├── .env               # Database URI & JWT secrets
│   ├── seed.js            # Initial Tamil Nadu/Karnataka/Andhra Pradesh demo seeder
│   ├── server.js          # Express app setup & server entrypoint
│   └── test-apis.js       # Integration API validation harness
└── frontend/
    ├── src/
    │   ├── components/    # User landing, signup, logins & dashboards
    │   ├── App.jsx        # Frontend routes setup
    │   └── main.jsx       # React DOM context bootstrap
```

---

## Database Schemas & Collections

* **User (`User.js`)**: Extends basic profile attributes to store acreage, farm addresses, active crop targets for `farmers`, and organization type/procurement category constraints for `buyers`.
* **BuyerRequirement (`BuyerRequirement.js`)**: Tracks procurement specifications created by corporate clients.
* **CropCommitment (`CropCommitment.js`)**: Records pre-harvest crop volume commitments submitted by farmers to buyer requirements.
* **FarmProject (`FarmProject.js`)**: Central cultivation tracking ledger linked with crop progress milestones, stage inputs, and weather risks.
* **SupportRequest (`SupportRequest.js`)**: Logs financial referral applications linked with farm project agreements.
* **ProductionUpdate (`ProductionUpdate.js`)**: Tracks vertical growth logs, costs, and progress notes.
* **ProcurementOrder (`ProcurementOrder.js`)**: Final B2B procurement settlement transaction record.
* **Notification (`Notification.js`)**: Operational alerts sent dynamically across the platform.

---

## Demo Access Credentials (Password: `password123`)

| Profile Type | Email | Representative Entity |
| :--- | :--- | :--- |
| **Bulk Buyer** | `buyer@gmail.com` | FreshHarvest Foods Processing |
| **Farmer** | `kumar@gmail.com` | Kumar Ramasamy (Tamil Nadu, 8 Acres) |
| **Admin** | `admin@agriconnect.com` | System Admin Command Center |

---

## Getting Started (Local Development)

### 1. Prerequisites
Ensure you have **Node.js** and **MongoDB** (running on local port `27017` or Atlas configuration) installed on your system.

### 2. Backend Setup
1. Open the `.env` file in the backend folder and configure the target MongoDB Atlas connection string and JWT secret:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=955ee5d2df1bec8c40a04c5d2eb0ffe7
   PORT=5000
   ```
2. Navigate to the backend folder and install server dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Run the database seed script to clear historical data and establish the B2B demo ecosystem:
   ```bash
   node seed.js
   ```
4. Launch the backend API server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. In a new terminal window, navigate to the frontend folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## Verification & Integration Tests

The platform includes an automated end-to-end integration suite that tests requirements publishing, farmer commitments submission, automatic project generation, progress logs, AI analytics, and final procurement payout settlements.

To run the integration verification test, execute the following command in the `backend` directory:
```bash
node test-apis.js
```
All tests should pass successfully and output a green success confirmation block in the terminal.
