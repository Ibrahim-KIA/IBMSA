// Single source of truth for course names, durations and prices.
// The browser NEVER gets to decide a price — it only sends course IDs,
// and the server looks up the price from this file. Change prices here only.
// All money is stored as integer KOBO (1 naira = 100 kobo) — never floats.

const COURSES = [
  { id: "bag_making", name: "Bag Making", duration: "4 weeks", priceKobo: 1_000_000 },
  { id: "computer_literacy", name: "Basic Computer Literacy", duration: "4 weeks", priceKobo: 1_200_000 },
  { id: "productivity_tools", name: "Productivity Tools", duration: "4 weeks", priceKobo: 1_500_000 },
  { id: "graphic_design", name: "Graphic Design", duration: "4 weeks", priceKobo: 2_000_000 },
  { id: "ai", name: "Artificial Intelligence (AI)", duration: "4 weeks", priceKobo: 2_000_000 },
  { id: "agro_skills", name: "Agro Skills", duration: "8 weeks", priceKobo: 2_500_000 },
  { id: "catering_snacks", name: "Catering: Snacks Only", duration: "8 weeks", priceKobo: 3_000_000 },
  { id: "catering_meals", name: "Catering: Meals Only", duration: "8 weeks", priceKobo: 3_000_000 },
  { id: "ict_ai_mastery", name: "Full ICT & AI Mastery (All 4 modules)", duration: "12 weeks", priceKobo: 3_500_000 },
  { id: "catering_combined", name: "Catering: Combined (Snacks + Meals)", duration: "12 weeks", priceKobo: 4_500_000 },
  { id: "tailoring", name: "Tailoring: Basic to Advanced", duration: "12 weeks", priceKobo: 5_000_000 },
  { id: "fashion_design", name: "Fashion Design", duration: "12 weeks", priceKobo: 6_000_000 },
];

const CONFIG = {
  regFeeKobo: 100_000, // ₦1,000 mandatory registration fee, always added
  comboDiscountKobo: 200_000, // ₦2,000 off when 2+ courses are selected
  comboDiscountMinCourses: 2,
  certificateFeeKobo: 300_000, // ₦3,000, charged separately at end of program — informational only
  programStartDate: "2026-10-12",
  programStartDateLabel: "October 12, 2026",
};

function getCourseById(id) {
  return COURSES.find((c) => c.id === id);
}

// Computes the total server-side from a list of course IDs sent by the browser.
// Throws on any invalid/unknown course id so a tampered request is rejected outright.
function computeTotals(courseIds) {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    throw new Error("Select at least one course.");
  }
  const uniqueIds = [...new Set(courseIds)];
  const selected = uniqueIds.map((id) => {
    const course = getCourseById(id);
    if (!course) throw new Error(`Unknown course: ${id}`);
    return course;
  });

  const subtotalKobo = selected.reduce((sum, c) => sum + c.priceKobo, 0);
  const discountKobo =
    selected.length >= CONFIG.comboDiscountMinCourses ? CONFIG.comboDiscountKobo : 0;
  const totalKobo = subtotalKobo + CONFIG.regFeeKobo - discountKobo;

  return {
    courses: selected,
    subtotalKobo,
    regFeeKobo: CONFIG.regFeeKobo,
    discountKobo,
    totalKobo,
  };
}

module.exports = { COURSES, CONFIG, getCourseById, computeTotals };
