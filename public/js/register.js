(function () {
  const courseListEl = document.getElementById("course-list");
  const form = document.getElementById("reg-form");
  const submitBtn = document.getElementById("submit-btn");
  const formError = document.getElementById("form-error");
  const demoBanner = document.getElementById("demo-banner");
  const startDateInline = document.getElementById("start-date-inline");

  let courses = [];
  let config = {};

  function nairaFromKobo(kobo) {
    return "₦" + (kobo / 100).toLocaleString("en-NG");
  }

  function selectedCourseIds() {
    return [...courseListEl.querySelectorAll("input[type=checkbox]:checked")].map((el) => el.value);
  }

  function renderCourses() {
    courseListEl.innerHTML = courses
      .map(
        (c) => `
      <label class="course-card rounded-xl p-4 flex items-start gap-3 cursor-pointer" data-id="${c.id}">
        <input type="checkbox" value="${c.id}" class="mt-1 h-5 w-5 rounded border-gray-300 text-[var(--ibm-green)]" />
        <span>
          <span class="block font-semibold">${c.name}</span>
          <span class="block text-gray-500 text-sm">${c.duration}</span>
          <span class="block text-[var(--ibm-green)] font-bold mt-1">${nairaFromKobo(c.priceKobo)}</span>
        </span>
      </label>`
      )
      .join("");

    courseListEl.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      cb.addEventListener("change", () => {
        cb.closest(".course-card").classList.toggle("selected", cb.checked);
        updateSummary();
      });
    });
  }

  function updateSummary() {
    const ids = selectedCourseIds();
    const selected = courses.filter((c) => ids.includes(c.id));
    const subtotal = selected.reduce((s, c) => s + c.priceKobo, 0);
    const discount = selected.length >= (config.comboDiscountMinCourses || 2) ? config.comboDiscountKobo || 0 : 0;
    const total = subtotal + (config.regFeeKobo || 0) - discount;

    document.getElementById("sum-subtotal").textContent = nairaFromKobo(subtotal);
    document.getElementById("sum-regfee").textContent = nairaFromKobo(config.regFeeKobo || 0);
    document.getElementById("sum-discount").textContent = "-" + nairaFromKobo(discount);
    document.getElementById("sum-total").textContent = nairaFromKobo(total);
  }

  async function loadCourses() {
    const res = await fetch("/api/courses");
    const data = await res.json();
    courses = data.courses;
    config = data.config;
    renderCourses();
    updateSummary();
    if (config.programStartDateLabel) startDateInline.textContent = config.programStartDateLabel;
  }

  async function checkDemoMode() {
    try {
      const res = await fetch("/api/demo-status");
      const data = await res.json();
      if (data.demo) demoBanner.classList.remove("hidden");
    } catch {
      // ignore — non-critical
    }
  }

  function showError(msg) {
    formError.textContent = msg;
    formError.classList.remove("hidden");
  }
  function hideError() {
    formError.classList.add("hidden");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const fd = new FormData(form);
    const courseIds = selectedCourseIds();

    if (courseIds.length === 0) {
      showError("Please select at least one course.");
      return;
    }
    if (!fd.get("agree")) {
      showError("Please confirm you understand the certificate fee terms.");
      return;
    }

    const payload = {
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      whatsapp: fd.get("whatsapp"),
      address: fd.get("address"),
      kinName: fd.get("kinName"),
      kinPhone: fd.get("kinPhone"),
      courseIds,
      agree: true,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      if (data.paymentMethod === "bank_transfer") {
        window.location.href = `/pay.html?reference=${encodeURIComponent(data.reference)}`;
      } else {
        window.location.href = data.authorizationUrl;
      }
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Pay & Register Now";
    }
  });

  loadCourses();
  checkDemoMode();
})();
