(function () {
  const courseListEl = document.getElementById("course-list");
  const form = document.getElementById("reg-form");
  const submitBtn = document.getElementById("submit-btn");
  const formError = document.getElementById("form-error");
  const demoBanner = document.getElementById("demo-banner");
  const startDateInline = document.getElementById("start-date-inline");
  const step1El = document.getElementById("step-1");
  const step2El = document.getElementById("step-2");
  const nextBtn = document.getElementById("next-btn");
  const backBtn = document.getElementById("back-btn");
  const stepLabel = document.getElementById("step-label");
  const dot1 = document.getElementById("progress-dot-1");
  const dot2 = document.getElementById("progress-dot-2");

  let courses = [];
  let config = {};

  const COURSE_ICONS = {
    bag_making: "👜",
    computer_literacy: "💻",
    productivity_tools: "📊",
    graphic_design: "🎨",
    ai: "🤖",
    agro_skills: "🌾",
    catering_snacks: "🍿",
    catering_meals: "🍲",
    ict_ai_mastery: "🖥️",
    catering_combined: "🍽️",
    tailoring: "🧵",
    fashion_design: "👗",
  };

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
        <span class="check-badge">✓</span>
        <span class="course-icon">${COURSE_ICONS[c.id] || "🎯"}</span>
        <input type="checkbox" value="${c.id}" class="sr-only" />
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

    const note = document.getElementById("payment-method-note");
    if (config.paymentMethod === "bank_transfer") {
      note.textContent = "You'll get our bank details on the next page — your spot is confirmed once we see your transfer.";
    } else {
      note.textContent = "Payments are processed securely by Paystack.";
    }
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

  function activeDotStyle(el) {
    el.style.background = "var(--ibm-green)";
    el.style.color = "white";
    el.style.borderColor = "var(--ibm-green)";
    el.classList.add("active");
  }
  function inactiveDotStyle(el) {
    el.style.background = "#f3f4f6";
    el.style.color = "#9ca3af";
    el.style.borderColor = "#f3f4f6";
    el.classList.remove("active");
  }

  function goToStep(step) {
    if (step === 1) {
      step1El.classList.remove("hidden");
      step2El.classList.add("hidden");
      activeDotStyle(dot1);
      inactiveDotStyle(dot2);
      stepLabel.textContent = "Step 1 of 2";
      window.scrollTo({ top: form.offsetTop - 20, behavior: "smooth" });
    } else {
      step1El.classList.add("hidden");
      step2El.classList.remove("hidden");
      activeDotStyle(dot1);
      activeDotStyle(dot2);
      stepLabel.textContent = "Step 2 of 2";
      window.scrollTo({ top: form.offsetTop - 20, behavior: "smooth" });
    }
  }

  nextBtn.addEventListener("click", () => {
    const requiredInputs = step1El.querySelectorAll("input[required]");
    for (const input of requiredInputs) {
      if (!input.reportValidity()) return; // stops here and shows the browser's native validation bubble
    }
    goToStep(2);
  });

  backBtn.addEventListener("click", () => goToStep(1));

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
