// ✅ Firebase imports

// ====================================================
// Navigation logic
// ====================================================
const registerContent = document.getElementById('registerContent');
const testContent = document.getElementById('testContent');
const searchContent = document.getElementById('searchContent');
const navRegister = document.getElementById('navRegister');
const navTest = document.getElementById('navTest');
const navSearch = document.getElementById('navSearch');

function showSection(section, nav) {
  [registerContent, testContent, searchContent].forEach(c => c.classList.remove('active'));
  [navRegister, navTest, navSearch].forEach(n => n.classList.remove('active'));
  section.classList.add('active');
  nav.classList.add('active');
}

// ====================================================
// Access key modal logic
// ====================================================
let isLoggedIn = false;
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const accessKeyInput = document.getElementById('accessKeyInput');
const submitAccessKey = document.getElementById('submitAccessKey');
const loginMsg = document.getElementById('loginMsg');

function showLoginModal() {
  loginModal.style.display = "flex";
  accessKeyInput.value = "";
  loginMsg.style.display = "none";
}


navRegister.addEventListener('click', e => { e.preventDefault(); showSection(registerContent, navRegister); });
navTest.addEventListener('click', e => { e.preventDefault(); if (!isLoggedIn) showLoginModal(); else showSection(testContent, navTest); });
navSearch.addEventListener('click', e => { e.preventDefault(); if (!isLoggedIn) showLoginModal(); else showSection(searchContent, navSearch); });

// ====================================================
// Registration form logic
// ====================================================
const patientIdInput = document.getElementById("patientId");
const registerBtn = document.getElementById("registerBtn");
patientIdInput.value = "PAT-" + Math.floor(100000 + Math.random() * 900000);

document.getElementById("generateIdBtn").addEventListener("click", function() {
  document.getElementById("patientId").value = "PAT-" + Math.floor(100000 + Math.random() * 900000);
});

document.getElementById("registrationForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const msg = document.getElementById('registerMsg');
  msg.style.display = 'none';

  // Loading state
  registerBtn.disabled = true;
  registerBtn.textContent = "Registering...";

  const patientId = patientIdInput.value.trim();
  if (!patientId) {
    msg.textContent = "❌ Please enter or generate a Patient ID.";
    msg.className = "message error";
    msg.style.display = 'block';
    registerBtn.disabled = false;
    registerBtn.textContent = "Register Patient";
    return;
  }

  const dob = new Date(document.getElementById("dob").value);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

  const formData = {
    type: "register",
    patientId: patientId,
    name: document.getElementById("name").value,
    dob: document.getElementById("dob").value,
    age: age,
    gender: document.getElementById("gender").value,
    phone: document.getElementById("phone").value
  };

  try {
    await setDoc(doc(db, "patients", patientId), formData);
    msg.innerHTML = `✅ Registration successful!<br>
      <b>Patient ID:</b> ${formData.patientId}<br>
      <b>Name:</b> ${formData.name}<br>
      <b>DOB:</b> ${formData.dob}<br>
      <b>Age:</b> ${formData.age}<br>
      <b>Gender:</b> ${formData.gender}<br>
      <b>Phone:</b> ${formData.phone}`;
    msg.className = "message success";
    msg.style.display = 'block';
  } catch (error) {
    msg.textContent = "❌ Error saving to database: " + error.message;
    msg.className = "message error";
    msg.style.display = 'block';
    console.error("Registration error:", error);
  }
  registerBtn.disabled = false;
  registerBtn.textContent = "Register Patient";
});

// ====================================================
// Test form logic
// ====================================================
const setDateBtn = document.getElementById('setDateBtn');
const testDateInput = document.getElementById('testDate');
if (setDateBtn && testDateInput) {
  setDateBtn.addEventListener('click', function() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    testDateInput.value = `${yyyy}-${mm}-${dd}`;
  });
}

document.getElementById("testForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const msg = document.getElementById('testMsg');
  msg.style.display = 'none';

  const data = {
    type: "test",
    patientId: document.getElementById("testPatientId").value,
    testDate: document.getElementById("testDate").value,
    malaria: document.getElementById("malaria").value,
    genotype: document.getElementById("genotype").value
  };

  try {
    await addDoc(collection(db, "tests"), data);
    msg.textContent = "✅ Test results saved!";
    msg.className = "message success";
    msg.style.display = 'block';
  } catch (error) {
    msg.textContent = "❌ Error saving to database: " + error.message;
    msg.className = "message error";
    msg.style.display = 'block';
  }
});

// ====================================================
// Test preview modal
// ====================================================
document.getElementById('previewBtn').addEventListener('click', function() {
  const patientId = document.getElementById("testPatientId").value;
  const testDate = document.getElementById("testDate").value;
  const genotype = document.getElementById("genotype").value;
  const malaria = document.getElementById("malaria").value;

  let preview = `
    <h3>📋 Entered Data Preview:</h3>
    <p><b>Patient ID:</b> ${patientId}</p>
    <p><b>Test Date:</b> ${testDate}</p>
    <p><b>Malaria Test:</b> ${malaria}</p>
    <p><b>Genotype:</b> ${genotype}</p>
  `;
  document.getElementById("modalBody").innerHTML = preview;
  document.getElementById("modalPreview").style.display = "flex";
});
document.getElementById('closeModal').addEventListener('click', () => { document.getElementById("modalPreview").style.display = "none"; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.getElementById("modalPreview").style.display = "none"; });

// ====================================================
// Search logic
// ====================================================
document.getElementById('searchBtn').addEventListener('click', async function() {
  const patientId = document.getElementById("patientIdSearch").value.trim();
  const resultBox = document.getElementById("resultBoxSearch");

  if (!patientId) {
    resultBox.innerHTML = '<div class="message error">⚠️ Please enter a Patient ID</div>';
    return;
  }

  resultBox.innerHTML = '<div class="message">Searching...</div>';
  try {
    const docSnap = await getDoc(doc(db, "patients", patientId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      resultBox.innerHTML = `<div class='message success'>
        <b>Name:</b> ${data.name}<br>
        <b>DOB:</b> ${data.dob}<br>
        <b>Age:</b> ${data.age}<br>
        <b>Gender:</b> ${data.gender}<br>
        <b>Phone:</b> ${data.phone}
      </div>`;
    } else {
      resultBox.innerHTML = `<div class="message error">No records for ID: ${patientId}</div>`;
    }
  } catch (error) {
    resultBox.innerHTML = `<div class="message error">Error: ${error.message}</div>`;
  }
});
