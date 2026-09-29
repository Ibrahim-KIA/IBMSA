(function () {
  const denied = document.getElementById("denied");
  const loading = document.getElementById("loading");
  const content = document.getElementById("content");

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

  const STATUS_LABELS = { not_started: "Not Started", in_progress: "In Progress", done: "Done" };
  const STATUS_COLORS = {
    not_started: "bg-gray-100 text-gray-500",
    in_progress: "bg-amber-100 text-amber-700",
    done: "bg-green-100 text-green-700",
  };

  function tutorName() {
    return localStorage.getItem("ibmsa_tutor_name") || "";
  }

  function promptForName() {
    const name = prompt("What's your name? (So we know who updated each week — optional, but helpful.)");
    if (name) localStorage.setItem("ibmsa_tutor_name", name.trim());
  }

  // Keeps the token working on reload without it sitting in the visible URL —
  // the API call below sets a cookie on first load, so we don't need it again.
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
  }

  async function loadCurriculum() {
    const url = token ? `/api/tutor/curriculum?token=${encodeURIComponent(token)}` : "/api/tutor/curriculum";
    const res = await fetch(url);
    if (res.status === 401) {
      loading.classList.add("hidden");
      denied.classList.remove("hidden");
      return;
    }
    const data = await res.json();
    loading.classList.add("hidden");
    content.classList.remove("hidden");
    render(data.courses);
  }

  function render(courses) {
    content.innerHTML = courses.map(renderCourseCard).join("");

    content.querySelectorAll(".save-week-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const courseId = btn.dataset.course;
        const week = Number(btn.dataset.week);
        const card = btn.closest(".week-row");
        const status = card.querySelector(".status-select").value;
        const note = card.querySelector(".note-input").value;

        if (!tutorName()) promptForName();

        btn.disabled = true;
        btn.textContent = "Saving...";
        try {
          const res = await fetch("/api/tutor/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId, week, status, note, updatedBy: tutorName() }),
          });
          if (!res.ok) throw new Error((await res.json()).error || "Could not save.");
          btn.textContent = "Saved ✓";
          setTimeout(() => (btn.textContent = "Save"), 1500);
          // Refresh just this course's progress bar and badge color without a full reload.
          loadCurriculum();
        } catch (err) {
          alert(err.message);
          btn.disabled = false;
          btn.textContent = "Save";
        }
      });
    });
  }

  function renderCourseCard(course) {
    const icon = COURSE_ICONS[course.id] || "🎯";
    const weekRows = course.weeks
      .map(
        (w) => `
      <div class="week-row border-t border-gray-100 py-3" data-course="${course.id}" data-week="${w.number}">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <span class="font-semibold text-sm">Week ${w.number}: ${w.topic}</span>
            <p class="text-gray-500 text-xs mt-0.5">${w.activities}</p>
          </div>
          <span class="shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[w.progress.status]}">${STATUS_LABELS[w.progress.status]}</span>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <select class="status-select rounded-lg border border-gray-300 text-sm px-2 py-1.5">
            <option value="not_started" ${w.progress.status === "not_started" ? "selected" : ""}>Not Started</option>
            <option value="in_progress" ${w.progress.status === "in_progress" ? "selected" : ""}>In Progress</option>
            <option value="done" ${w.progress.status === "done" ? "selected" : ""}>Done</option>
          </select>
          <input type="text" class="note-input flex-1 rounded-lg border border-gray-300 text-sm px-2 py-1.5" placeholder="Add a note (optional)" value="${(w.progress.note || "").replace(/"/g, "&quot;")}" />
          <button class="save-week-btn rounded-lg bg-[var(--ibm-green)] text-white text-sm font-semibold px-4 py-1.5 hover:bg-[var(--ibm-green-dark)]" data-course="${course.id}" data-week="${w.number}">Save</button>
        </div>
        ${w.progress.updatedBy ? `<p class="text-xs text-gray-400 mt-1">Last updated by ${w.progress.updatedBy}</p>` : ""}
      </div>`
      )
      .join("");

    return `
      <div class="bg-white rounded-2xl shadow-md p-5">
        <div class="flex items-center gap-3 mb-2">
          <span class="course-icon">${icon}</span>
          <div class="flex-1">
            <h2 class="heading-font font-bold">${course.name}</h2>
            <p class="text-gray-500 text-xs">${course.duration}</p>
          </div>
          <span class="text-sm font-bold text-[var(--ibm-green)]">${course.percentComplete}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div class="bg-[var(--ibm-green)] h-2 rounded-full" style="width:${course.percentComplete}%"></div>
        </div>
        <p class="text-gray-600 text-sm mb-1">${course.overview}</p>
        <p class="text-gray-500 text-xs mb-2"><strong>Final project:</strong> ${course.finalProject}</p>
        <div>${weekRows}</div>
      </div>`;
  }

  loadCurriculum();
})();
