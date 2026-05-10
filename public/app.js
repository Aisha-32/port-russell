// ================= LOGIN =================
const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("error").innerText = data.message;
    }
  });
}

// ================= LOAD RESERVATIONS =================
async function loadReservations() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch("http://localhost:3000/reservations", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "index.html";
    return;
  }

  const data = await res.json();

  const list = document.getElementById("reservationsList");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(r => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${r.clientName}</td>
      <td>${r.boatName}</td>
      <td>
        <button onclick="deleteReservation('${r._id}', '${r.catwayNumber}')">
          Delete
        </button>
      </td>
    `;

    list.appendChild(tr);
  });
}

// ================= DELETE RESERVATION =================
async function deleteReservation(id, catwayNumber) {
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:3000/catways/${catwayNumber}/reservations/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  });

  loadReservations();
}

// ================= LOAD USER =================
async function loadUser() {

  const token = localStorage.getItem("token");

  if (!token) return;

  const payload = JSON.parse(
    atob(token.split(".")[1])
  );

  const userId = payload.id;

  const res = await fetch(`http://localhost:3000/users/id/${userId}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    }
  );

  const user = await res.json();

  const userInfo = document.getElementById("userInfo");

  if (userInfo) {

    userInfo.innerText =
      `${user.username} - ${user.email}`;

  }

}

// ================= DATE =================
const dateEl = document.getElementById("date");
if (dateEl) {
  dateEl.innerText = new Date().toLocaleDateString();
}

// ================= LOAD CATWAYS =================
async function loadCatways() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch("http://localhost:3000/catways", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();

  const list = document.getElementById("catwaysList");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(c => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td>${c.catwayNumber}</td>

  <td>${c.catwayType}</td>

  <td>
    <input
      type="text"
      id="state-${c.catwayNumber}"
      value="${c.catwayState}"
    />
  </td>

  <td>

    <button onclick="updateCatway('${c.catwayNumber}')">
      Update
    </button>

    <button onclick="deleteCatway('${c.catwayNumber}')">
      Delete
    </button>

  </td>
`;

    list.appendChild(tr);
  });
}

// ================= DELETE CATWAY =================
async function deleteCatway(id) {
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:3000/catways/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  });

  loadCatways();
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// ================= INIT =================
loadUser();

if (document.getElementById("reservationsList")) {
  loadReservations();
}

if (document.getElementById("catwaysList")) {
  loadCatways();
}

// ===== LOAD USERS =====
async function loadUsers() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch("http://localhost:3000/users", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();

  const list = document.getElementById("usersList");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(u => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.username}</td>
      <td>${u.email}</td>
    `;

    list.appendChild(tr);
  });
}

// INIT USERS
if (document.getElementById("usersList")) {
  loadUsers();
}

// ===== ADD RESERVATION =====

const reservationForm = document.getElementById("reservationForm");

if (reservationForm) {

  reservationForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const token = localStorage.getItem("token");

    const clientName = document.getElementById("clientName").value;

    const boatName = document.getElementById("boatName").value;

    const catwayNumber = document.getElementById("catwayNumber").value;

    const startDate = document.getElementById("startDate").value;

    const endDate = document.getElementById("endDate").value;

    const res = await fetch(
      `http://localhost:3000/catways/${catwayNumber}/reservations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },

        body: JSON.stringify({
          clientName,
          boatName,
          startDate,
          endDate
        })
      }
    );

    const data = await res.json();

    console.log(data);

    reservationForm.reset();

    loadReservations();

  });

}

// ===== ADD CATWAY =====

const catwayForm = document.getElementById("catwayForm");

if (catwayForm) {

  catwayForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const token = localStorage.getItem("token");

    const catwayNumber =
      document.getElementById("catwayNumber").value;

    const catwayType =
      document.getElementById("catwayType").value;

    const catwayState =
      document.getElementById("catwayState").value;

    await fetch("http://localhost:3000/catways", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },

      body: JSON.stringify({
        catwayNumber,
        catwayType,
        catwayState
      })

    });

    catwayForm.reset();

    loadCatways();

  });

  // ===== UPDATE CATWAY =====

async function updateCatway(id) {

  const token = localStorage.getItem("token");

  const catwayState =
    document.getElementById(`state-${id}`).value;

  await fetch(`http://localhost:3000/catways/${id}`, {

    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },

    body: JSON.stringify({
      catwayState
    })

  });

  loadCatways();

}

}

// ===== LOAD USERS =====

async function loadUsers() {

  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/users", {

    headers: {
      Authorization: "Bearer " + token
    }

  });

  const data = await res.json();

  const list = document.getElementById("usersList");

  if (!list) return;

  list.innerHTML = "";

  data.forEach(user => {

    const tr = document.createElement("tr");

    tr.innerHTML = `

      <td>
        <input
          type="text"
          id="username-${user.email}"
          value="${user.username}"
        />
      </td>

      <td>${user.email}</td>

      <td>

        <button onclick="updateUser('${user.email}')">
          Update
        </button>

        <button onclick="deleteUser('${user.email}')">
          Delete
        </button>

      </td>
    `;

    list.appendChild(tr);

  });

}

// ===== UPDATE USER =====

async function updateUser(email) {

  const token = localStorage.getItem("token");

  const username =
    document.getElementById(`username-${email}`).value;

  await fetch(`http://localhost:3000/users/${email}`, {

    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },

    body: JSON.stringify({
      username
    })

  });

  loadUsers();

}

// ===== DELETE USER =====

async function deleteUser(email) {

  const token = localStorage.getItem("token");

  await fetch(`http://localhost:3000/users/${email}`, {

    method: "DELETE",

    headers: {
      Authorization: "Bearer " + token
    }

  });

  loadUsers();

}

// ===== INIT USERS =====

if (document.getElementById("usersList")) {
  loadUsers();
}


// ===== USERS =====

async function loadUsers() {

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch("http://localhost:3000/users", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const users = await res.json();

  const list = document.getElementById("usersList");

  if (!list) return;

  list.innerHTML = "";

  users.forEach(user => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>
        <button onclick="deleteUser('${user.email}')">
          Delete
        </button>
      </td>
    `;

    list.appendChild(tr);

  });

}

if (document.getElementById("usersList")) {
  loadUsers();
}

async function deleteUser(email) {

  const token = localStorage.getItem("token");

  await fetch(`http://localhost:3000/users/${email}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  });

  loadUsers();

}