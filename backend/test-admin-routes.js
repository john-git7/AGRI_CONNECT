const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAdminTests() {
  // Using the already-running server on port 5000
  const BASE_URL = "http://127.0.0.1:5000/api";

  console.log("\n==================================================");
  console.log("RUNNING ADMIN COMMAND CENTER ROUTE TESTS");
  console.log("==================================================\n");

  let adminToken = "";
  let farmerToken = "";
  let createdUserId = "";
  let testRequirementId = "";
  let testCommitmentId = "";
  let testProjectId = "";
  let testSupportId = "";
  let testProcurementId = "";

  try {
    // ─── STEP 1: Authenticate all roles ───
    console.log("Test 1: Authenticating roles...");

    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@agriconnect.com", password: "password123" }),
    });
    const adminData = await adminRes.json();
    if (!adminRes.ok) throw new Error("Admin login failed: " + JSON.stringify(adminData));
    adminToken = adminData.token;
    console.log("✓ Admin authenticated.");

    const farmerRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "kumar@gmail.com", password: "password123" }),
    });
    const farmerData = await farmerRes.json();
    if (!farmerRes.ok) throw new Error("Farmer login failed");
    farmerToken = farmerData.token;
    const farmerId = farmerData.user?._id || farmerData.userId;
    console.log("✓ Farmer authenticated.");

    const buyerRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "buyer@gmail.com", password: "password123" }),
    });
    const buyerData = await buyerRes.json();
    if (!buyerRes.ok) throw new Error("Buyer login failed");
    const buyerToken = buyerData.token;
    const buyerId = buyerData.user?._id || buyerData.userId;
    console.log("✓ Buyer authenticated.\n");

    // ─── STEP 2: Admin creates a new user ───
    console.log("Test 2: Admin creates new user...");
    const createUserRes = await fetch(`${BASE_URL}/auth/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        firstName: "TestAdmin",
        lastName: "CreatedFarmer",
        email: `testfarmer_${Date.now()}@test.com`,
        password: "Test@1234",
        role: "farmer",
        phone: "+917654321098",
        location: "Tamil Nadu",
        city: "Chennai",
        farmName: "Test Farm",
        acreage: 5,
        crops: "Tomato",
      }),
    });
    const createUserData = await createUserRes.json();
    if (!createUserRes.ok) throw new Error("Admin user creation failed: " + JSON.stringify(createUserData));
    createdUserId = (createUserData.user || createUserData)._id;
    const createdName = createUserData.user?.firstName || createUserData.firstName || createUserData.name;
    console.log(`✓ Admin created user: ${createdName} (ID: ${createdUserId})`);

    // ─── STEP 3: Non-admin is BLOCKED from creating a user ───
    console.log("\nTest 3: Farmer is BLOCKED from creating a user (permission test)...");
    const blockedUserRes = await fetch(`${BASE_URL}/auth/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        firstName: "Unauthorized",
        lastName: "User",
        email: "hack@test.com",
        password: "Test@1234",
        role: "farmer",
        phone: "+917654321098",
        location: "Tamil Nadu",
        city: "Chennai",
        farmName: "Hack Farm",
        acreage: 1,
      }),
    });
    if (blockedUserRes.status !== 403 && blockedUserRes.status !== 401) {
      throw new Error(`Expected 403/401 but got ${blockedUserRes.status} — non-admin NOT blocked!`);
    }
    console.log(`✓ Non-admin correctly blocked from creating users. (HTTP ${blockedUserRes.status})`);

    // ─── STEP 4: Admin updates user ───
    console.log("\nTest 4: Admin updates the user just created...");
    const updateUserRes = await fetch(`${BASE_URL}/auth/users/${createdUserId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ firstName: "UpdatedTest", lastName: "Farmer", city: "Coimbatore" }),
    });
    const updateUserData = await updateUserRes.json();
    if (!updateUserRes.ok) throw new Error("Admin user update failed: " + JSON.stringify(updateUserData));
    console.log(`✓ Admin updated user name to: ${updateUserData.firstName} ${updateUserData.lastName}, city: ${updateUserData.city}`);

    // ─── STEP 5: Admin deletes user ───
    console.log("\nTest 5: Admin deletes the created user...");
    const deleteUserRes = await fetch(`${BASE_URL}/auth/users/${createdUserId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!deleteUserRes.ok) throw new Error("Admin user deletion failed: " + await deleteUserRes.text());
    console.log("✓ Admin successfully deleted user.");

    // ─── STEP 6: Admin creates a requirement on behalf of a buyer ───
    console.log("\nTest 6: Admin creates a requirement on behalf of buyer...");
    const adminReqRes = await fetch(`${BASE_URL}/requirements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        buyerId,
        crop: "Wheat",
        quantity: 50,
        quality: "Grade B",
        location: "Maharashtra",
        expectedDelivery: "July 2026",
        targetPrice: "₹25/kg",
      }),
    });
    const adminReqData = await adminReqRes.json();
    if (!adminReqRes.ok) throw new Error("Admin requirement creation failed: " + JSON.stringify(adminReqData));
    testRequirementId = adminReqData._id;
    console.log(`✓ Admin created requirement on behalf of buyer. ID: ${testRequirementId}`);

    // ─── STEP 7: Admin creates commitment on behalf of farmer ───
    console.log("\nTest 7: Admin creates commitment on behalf of farmer...");
    const adminCommitRes = await fetch(`${BASE_URL}/commitments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        farmerId,
        buyerId,
        buyerRequirementId: testRequirementId,
        expectedYield: 60,
        committedQuantity: 45,
        acreage: 10,
        cultivationCost: 80000,
        harvestDate: "2026-07-15",
      }),
    });
    const adminCommitData = await adminCommitRes.json();
    if (!adminCommitRes.ok) throw new Error("Admin commitment creation failed: " + JSON.stringify(adminCommitData));
    testCommitmentId = adminCommitData._id;
    console.log(`✓ Admin created commitment. ID: ${testCommitmentId}, Status: ${adminCommitData.status}`);

    // ─── STEP 8: Admin edits commitment ───
    console.log("\nTest 8: Admin edits commitment details...");
    const editCommitRes = await fetch(`${BASE_URL}/commitments/${testCommitmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ committedQuantity: 50, expectedYield: 65 }),
    });
    const editCommitData = await editCommitRes.json();
    if (!editCommitRes.ok) throw new Error("Admin commitment edit failed: " + JSON.stringify(editCommitData));
    console.log(`✓ Admin edited commitment. New committedQuantity: ${editCommitData.committedQuantity}`);

    // ─── STEP 9: Admin creates support request on behalf of farmer ───
    console.log("\nTest 9: Admin creates support request on behalf of farmer...");
    const adminSupportRes = await fetch(`${BASE_URL}/support-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        farmerId,
        farmProjectId: null,
        cultivationCost: 95000,
        farmerContribution: 30000,
        supportRequired: 65000,
        supportType: "SUBSIDY",
        requestReason: "Admin-created test support request",
      }),
    });
    const adminSupportData = await adminSupportRes.json();
    if (!adminSupportRes.ok) throw new Error("Admin support request creation failed: " + JSON.stringify(adminSupportData));
    testSupportId = adminSupportData._id;
    console.log(`✓ Admin created support request. ID: ${testSupportId}`);

    // ─── STEP 10: Admin edits support request ───
    console.log("\nTest 10: Admin edits support request...");
    const editSupportRes = await fetch(`${BASE_URL}/support-requests/${testSupportId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "APPROVED", supportRequired: 60000 }),
    });
    const editSupportData = await editSupportRes.json();
    if (!editSupportRes.ok) throw new Error("Admin support request edit failed: " + JSON.stringify(editSupportData));
    console.log(`✓ Admin edited support request. Status: ${editSupportData.status}`);

    // ─── STEP 11: Admin deletes commitment ───
    console.log("\nTest 11: Admin deletes commitment...");
    const deleteCommitRes = await fetch(`${BASE_URL}/commitments/${testCommitmentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!deleteCommitRes.ok) throw new Error("Admin commitment delete failed: " + await deleteCommitRes.text());
    console.log("✓ Admin deleted commitment successfully.");

    // ─── STEP 12: Admin deletes support request ───
    console.log("\nTest 12: Admin deletes support request...");
    const deleteSupportRes = await fetch(`${BASE_URL}/support-requests/${testSupportId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!deleteSupportRes.ok) throw new Error("Admin support request delete failed: " + await deleteSupportRes.text());
    console.log("✓ Admin deleted support request successfully.");

    // ─── STEP 13: Admin deletes requirement ───
    console.log("\nTest 13: Admin deletes requirement...");
    const deleteReqRes = await fetch(`${BASE_URL}/requirements/${testRequirementId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!deleteReqRes.ok) throw new Error("Admin requirement delete failed: " + await deleteReqRes.text());
    console.log("✓ Admin deleted requirement successfully.");

    console.log("\n==================================================");
    console.log("ALL ADMIN CRUD TESTS PASSED ✅");
    console.log("==================================================\n");
  } catch (err) {
    console.error("\n❌ Admin test failed:", err.message);
  } finally {
    process.exit(0);
  }
}

runAdminTests();
