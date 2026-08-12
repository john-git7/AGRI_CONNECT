const { fork } = require("child_process");
const path = require("path");

// Start the backend server
console.log("Starting backend server for integration tests...");
const serverProcess = fork(path.join(__dirname, "server.js"), [], {
  env: { ...process.env, PORT: 5001 } // run on port 5001 to avoid conflicts
});

// Helper for waiting
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  // Wait for server to bind port
  await sleep(4000);

  const BASE_URL = "http://127.0.0.1:5001/api";
  console.log("\n==================================================");
  console.log("RUNNING AGRICONNECT INTEGRATION TESTS");
  console.log("==================================================\n");

  let farmerToken = "";
  let buyerToken = "";
  let adminToken = "";
  let reqId = "";
  let commitmentId = "";
  let projectId = "";
  let procurementId = "";

  try {
    // Test 1: Logins
    console.log("Test 1: Authenticating roles...");
    
    // Buyer login
    const buyerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "buyer@gmail.com", password: "password123" })
    });
    const buyerData = await buyerLoginRes.json();
    if (!buyerLoginRes.ok) throw new Error("Buyer login failed: " + JSON.stringify(buyerData));
    buyerToken = buyerData.token;
    console.log("✓ Bulk Buyer authenticated successfully.");

    // Farmer login
    const farmerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "kumar@gmail.com", password: "password123" })
    });
    const farmerData = await farmerLoginRes.json();
    if (!farmerLoginRes.ok) throw new Error("Farmer login failed: " + JSON.stringify(farmerData));
    farmerToken = farmerData.token;
    console.log("✓ Farmer authenticated successfully.");

    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@agriconnect.com", password: "password123" })
    });
    const adminData = await adminLoginRes.json();
    if (!adminLoginRes.ok) throw new Error("Admin authenticated successfully.");
    adminToken = adminData.token;
    console.log("✓ Admin authenticated successfully.");

    // Test 2: Create Buyer Requirement
    console.log("\nTest 2: Publishing bulk buyer procurement demand...");
    const reqRes = await fetch(`${BASE_URL}/requirements`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        crop: "Tomato",
        quantity: 100,
        quality: "Grade A",
        location: "Tamil Nadu",
        expectedDelivery: "June 20–30",
        targetPrice: "₹28–32/kg"
      })
    });
    const reqData = await reqRes.json();
    if (!reqRes.ok) throw new Error("Failed to create requirement");
    reqId = reqData._id;
    console.log(`✓ Requirement published. ID: ${reqId}. Crop: ${reqData.crop}`);

    // Test 3: Farmer Crop pre-adoption commitment
    console.log("\nTest 3: Submitting farmer pre-harvest commitment...");
    const commitRes = await fetch(`${BASE_URL}/commitments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        buyerRequirementId: reqId,
        expectedYield: 25,
        committedQuantity: 20
      })
    });
    const commitData = await commitRes.json();
    if (!commitRes.ok) throw new Error("Failed to submit commitment: " + JSON.stringify(commitData));
    commitmentId = commitData._id;
    console.log(`✓ Commitment registered. ID: ${commitmentId}. Status: ${commitData.status}`);

    // Test 4: Buyer accepts commitment (triggers auto project creation)
    console.log("\nTest 4: Buyer accepting commitment to create Farm Project...");
    const acceptRes = await fetch(`${BASE_URL}/commitments/${commitmentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ status: "ACCEPTED" })
    });
    const acceptData = await acceptRes.json();
    if (!acceptRes.ok) throw new Error("Failed to accept commitment: " + JSON.stringify(acceptData));
    console.log(`✓ Commitment status updated: ${acceptData.status}`);

    // Verify Farm Project was created
    await sleep(500); // short pause for DB sync
    const projectsRes = await fetch(`${BASE_URL}/farm-projects`, {
      headers: { "Authorization": `Bearer ${farmerToken}` }
    });
    const projectsData = await projectsRes.json();
    const activeProject = projectsData.find(p => p.buyerRequirement?._id === reqId || p.buyerRequirement === reqId);
    if (!activeProject) throw new Error("Farm Project was not automatically generated!");
    projectId = activeProject._id;
    console.log(`✓ Farm Project successfully auto-instantiated. ID: ${projectId}`);

    // Test 5: AI predictions
    console.log("\nTest 5: Validating AI yield predictions and risk analyses...");
    const yieldRes = await fetch(`${BASE_URL}/ai/yield-prediction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop: "Tomato", acreage: 4, stage: "PLANTED" })
    });
    const yieldData = await yieldRes.json();
    console.log(`✓ Yield Pred: ${yieldData.minYield}-${yieldData.maxYield} tonnes (Confidence: ${yieldData.confidence}%)`);

    const riskRes = await fetch(`${BASE_URL}/ai/risk-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop: "Tomato", stage: "FRUITING", location: "Tamil Nadu", weather: "Heavy Rain" })
    });
    const riskData = await riskRes.json();
    console.log(`✓ Risk Index: ${riskData.riskLevel}. Forecast: ${riskData.explanation}`);

    // Test 6: Production tracking updates
    console.log("\nTest 6: Sowing cultivation update updates...");
    const updateRes = await fetch(`${BASE_URL}/farm-projects/${projectId}/updates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        stage: "GERMINATION",
        progressPercentage: 30,
        notes: "Seeds successfully germinated. Scheduled irrigation.",
        weatherObservation: "Moderate rain, 30°C",
        expenses: 12000
      })
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) throw new Error("Failed to post progress log");
    console.log(`✓ Progress update logged. Stage: ${updateData.stage}. Progress: ${updateData.progressPercentage}%`);

    // Test 7: Direct procurement transaction
    console.log("\nTest 7: Submitting harvest and procurement order settlement...");
    const procRes = await fetch(`${BASE_URL}/procurement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        farmProjectId: projectId,
        quantity: 22,
        quality: "Grade A",
        agreedPrice: 30,
        totalValue: 660000,
        deliveryLocation: "Salem, Tamil Nadu"
      })
    });
    const procData = await procRes.json();
    if (!procRes.ok) throw new Error("Failed to create procurement order");
    procurementId = procData._id;
    console.log(`✓ Procurement order initiated. ID: ${procurementId}. Payout: ₹${procData.totalValue}`);

    // Confirm settlement
    const confirmRes = await fetch(`${BASE_URL}/procurement/${procurementId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ status: "COMPLETED" })
    });
    const confirmData = await confirmRes.json();
    console.log(`✓ Procurement finalized. Status: ${confirmData.status}`);

    console.log("\n==================================================");
    console.log("ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY!");
    console.log("==================================================\n");

  } catch (error) {
    console.error("\n❌ Test Suite failed:", error.message);
  } finally {
    // Kill backend process and exit
    console.log("Stopping test server...");
    serverProcess.kill();
    process.exit(0);
  }
}

runTests();
