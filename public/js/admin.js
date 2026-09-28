(function () {
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");
  const demoBanner = document.getElementById("demo-banner");
  const filterStatus = document.getElementById("filter-status");
  const messageForm = document.getElementById("message-form");
  const messageCourseSelect = document.getElementById("message-course");
  const messageResult = document.getElementById("message-result");

  function nairaFromKobo(kobo) {
    return "₦" + (kobo / 100).toLocaleString("en-NG");
  }
  function waLink(phone, text) {
    const digits = phone.replace(/[^\d]/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(text || "")}`;
  }

  async function checkDemoMode() {
    try {
      const res = await fetch("/api/demo-status");
      const data = await res.json();
      if (data.demo) demoBanner.classList.remove("hidden");
    } catch {}
  }

  async function checkSession() {
    const res = await fetch("/api/admin/me");
    if (res.ok) {
      showDashboard();
    } else {
      loginSection.classList.remove("hidden");
    }
  }

  function showDashboard() {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    loadData();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.classList.add("hidden");
    const fd = new FormData(loginForm);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    if (res.ok) {
      showDashboard();
    } else {
      const data = await res.json();
      loginError.textContent = data.error || "Login failed.";
      loginError.classList.remove("hidden");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  });

  filterStatus.addEventListener("change", loadData);

  async function loadData() {
    const status = filterStatus.value;
    const res = await fetch(`/api/admin/registrations${status ? `?status=${status}` : ""}`);
    if (!res.ok) return;
    const data = await res.json();
    renderSummary(data.summary, data.totals);
    renderTable(data.registrations);
    renderCourseFilter(data.summary);
  }

  function renderSummary(summary, totals) {
    const cards = document.getElementById("summary-cards");
    const totalPaid = totals.paid;
    const totalPending = totals.pending;
    let html = `
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-gray-500 text-sm">Total Paid Registrations</p>
        <p class="text-2xl font-bold text-[var(--ibm-green)]">${totalPaid}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-gray-500 text-sm">Pending Payment</p>
        <p class="text-2xl font-bold text-amber-600">${totalPending}</p>
      </div>`;
    const perCourse = Object.entries(summary)
      .filter(([, v]) => v.paid > 0 || v.pending > 0)
      .map(([, v]) => `<div class="flex justify-between"><span>${v.name}</span><span class="font-semibold">${v.paid}</span></div>`)
      .join("");
    html += `
      <div class="bg-white rounded-xl shadow-sm p-4 sm:col-span-2 lg:col-span-2">
        <p class="text-gray-500 text-sm mb-2">Paid, by course</p>
        <div class="text-sm space-y-1 max-h-32 overflow-y-auto">${perCourse || '<p class="text-gray-400">No registrations yet.</p>'}</div>
      </div>`;
    cards.innerHTML = html;
  }

  function renderCourseFilter(summary) {
    if (messageCourseSelect.dataset.loaded) return;
    messageCourseSelect.dataset.loaded = "1";
    let opts = `<option value="all">All courses</option>`;
    opts += Object.entries(summary).map(([id, v]) => `<option value="${id}">${v.name}</option>`).join("");
    messageCourseSelect.innerHTML = opts;
  }

  function renderTable(rows) {
    const tbody = document.getElementById("reg-table-body");
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-gray-400">No registrations yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows
      .map(
        (r) => `
      <tr class="border-b last:border-0">
        <td class="py-2 pr-3 font-medium">${r.fullName}</td>
        <td class="py-2 pr-3">${r.email}</td>
        <td class="py-2 pr-3"><a class="text-[var(--ibm-green)] underline" href="${waLink(r.whatsapp, `Hi ${r.fullName}, this is IBM School regarding your registration.`)}" target="_blank" rel="noopener">${r.whatsapp}</a></td>
        <td class="py-2 pr-3">${r.courses.join(", ")}</td>
        <td class="py-2 pr-3">${nairaFromKobo(r.totalKobo)}</td>
        <td class="py-2 pr-3">
          <span class="px-2 py-1 rounded-full text-xs font-semibold ${r.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}">${r.status}</span>
        </td>
        <td class="py-2 pr-3">
          ${r.status !== "paid" ? `<button class="mark-paid-btn rounded-lg border border-[var(--ibm-green)] text-[var(--ibm-green)] px-3 py-1 text-xs font-bold hover:bg-[var(--ibm-green-light)]" data-reference="${r.reference}">Mark Paid</button>` : ""}
        </td>
      </tr>`
      )
      .join("");

    tbody.querySelectorAll(".mark-paid-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Confirm you have seen this payment land in the bank account?")) return;
        btn.disabled = true;
        btn.textContent = "Marking...";
        const res = await fetch("/api/admin/mark-paid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: btn.dataset.reference }),
        });
        if (res.ok) {
          loadData();
        } else {
          const data = await res.json();
          alert(data.error || "Could not mark as paid.");
          btn.disabled = false;
          btn.textContent = "Mark Paid";
        }
      });
    });
  }

  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageResult.classList.add("hidden");
    const fd = new FormData(messageForm);
    const res = await fetch("/api/admin/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: fd.get("courseId"),
        subject: fd.get("subject"),
        message: fd.get("message"),
      }),
    });
    const data = await res.json();
    messageResult.classList.remove("hidden");
    if (res.ok) {
      messageResult.className = "text-sm text-[var(--ibm-green)]";
      messageResult.textContent = `Sent to ${data.sentTo} recipient(s).`;
      messageForm.reset();
    } else {
      messageResult.className = "text-sm text-red-600";
      messageResult.textContent = data.error || "Could not send message.";
    }
  });

  checkDemoMode();
  checkSession();
})();
