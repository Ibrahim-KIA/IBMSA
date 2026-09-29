// The week-by-week curriculum for every course, structured so tutors can
// track progress week by week in the tutor portal. Course ids match
// src/courses.js exactly — that's how registration counts and curriculum
// content stay linked without duplicating course names/prices here.

const CURRICULUM = {
  bag_making: {
    overview: "Teaches learners to design, cut, and construct a lined, finished bag ready for sale.",
    finalProject: "A fully lined tote bag with pocket and zipper closure, ready for sale, with a costed price.",
    weeks: [
      { number: 1, topic: "Materials & pattern basics", activities: "Tools/machine safety, fabric types, tracing and cutting a basic tote pattern" },
      { number: 2, topic: "Stitching fundamentals", activities: "Hand-stitching, sewing machine basics, straight seams, hemming practice pieces" },
      { number: 3, topic: "Assembly", activities: "Joining panels, adding pockets, attaching lining" },
      { number: 4, topic: "Finishing & business", activities: "Handles/straps, zipper insertion, costing & pricing, final project" },
    ],
  },
  computer_literacy: {
    overview: "Gets a first-time user confidently operating a computer, online, and communicating professionally by email.",
    finalProject: "Set up an email account, build an organised folder structure, send a properly formatted email with an attachment, and complete an online form.",
    weeks: [
      { number: 1, topic: "Computer fundamentals", activities: "Parts of a PC, power on/off, mouse & keyboard, desktop navigation, files & folders" },
      { number: 2, topic: "Typing & system basics", activities: "Typing practice, installing/uninstalling software, basic settings" },
      { number: 3, topic: "Internet & email", activities: "Browsers, search skills, setting up email, email etiquette, online safety & passwords" },
      { number: 4, topic: "Cloud & assessment", activities: "Google Drive basics, simple troubleshooting, final assessment task" },
    ],
  },
  productivity_tools: {
    overview: "Builds practical skill in the word processor, spreadsheet, and presentation tools used in almost every office job.",
    finalProject: "A small business report package — a Word report, a supporting Excel budget sheet, and a PowerPoint summary presentation.",
    weeks: [
      { number: 1, topic: "Word processing", activities: "Formatting, headers/footers, tables, an intro to mail merge" },
      { number: 2, topic: "Spreadsheets", activities: "Data entry, SUM/AVERAGE/basic formulas, formatting, simple charts" },
      { number: 3, topic: "Presentations", activities: "Slide design, transitions, inserting images/charts, presenting tips" },
      { number: 4, topic: "Integration project", activities: "Combining the three tools into one linked project" },
    ],
  },
  graphic_design: {
    overview: "Takes a learner from design fundamentals to producing print- and social-ready graphics for a real or mock client brief.",
    finalProject: "A brand mini-kit — logo, one flyer, and three social media posts — for a fictional or real client brief.",
    weeks: [
      { number: 1, topic: "Design fundamentals", activities: "Color theory, typography, layout, intro to Canva/Photoshop" },
      { number: 2, topic: "Print design", activities: "Flyers & posters, working with images" },
      { number: 3, topic: "Branding basics", activities: "Simple logo design, brand colors, social media templates" },
      { number: 4, topic: "Portfolio project", activities: "Full brand mini-kit for a mock business, correct export formats" },
    ],
  },
  ai: {
    overview: "A practical, non-coding introduction to using today's AI tools productively and responsibly.",
    finalProject: "Use AI tools to plan and produce one real deliverable, with a short written reflection on what the AI got right and what it got wrong.",
    weeks: [
      { number: 1, topic: "What AI actually is", activities: "Plain-language intro, tour of everyday tools (ChatGPT, Claude, image generators), prompt-writing basics" },
      { number: 2, topic: "AI for productivity", activities: "Using AI for writing help, research, summarising, drafting emails" },
      { number: 3, topic: "AI for creativity & ethics", activities: "Image generation basics, business use cases, bias/misinformation, verifying AI output" },
      { number: 4, topic: "Applied project", activities: "Using AI to plan/produce a real deliverable, safe and responsible use, presentations" },
    ],
  },
  agro_skills: {
    overview: "Covers three income-earning tracks — crop farming, poultry, and fishery — from setup and daily management through to a costed harvest or sales plan.",
    finalProject: "Plan and run a small demonstration project in farming, poultry, or fishery (learner's choice), from setup through to a costed harvest/sales plan, presented to the class.",
    weeks: [
      { number: 1, topic: "Agriculture as a business", activities: "Overview of farming, poultry & fishery as income streams; soil types & basic soil testing" },
      { number: 2, topic: "Farming: land preparation & planting", activities: "Farm tools, techniques, safety, seasonal crop choice and planting techniques" },
      { number: 3, topic: "Farming: crop care", activities: "Nursery/seedling management, irrigation, organic-first pest & disease control" },
      { number: 4, topic: "Poultry: setup & brooding", activities: "Poultry housing, equipment, brooding day-old chicks, feeding basics" },
      { number: 5, topic: "Poultry: management & health", activities: "Vaccination schedule, common diseases, egg/meat production management" },
      { number: 6, topic: "Fishery: pond/tank setup", activities: "Pond or tank construction, water quality management, fish stocking" },
      { number: 7, topic: "Fishery: feeding & harvesting", activities: "Feeding schedules, growth monitoring, harvesting techniques" },
      { number: 8, topic: "Agribusiness", activities: "Costing, record keeping, marketing produce across all three tracks, final project" },
    ],
  },
  catering_snacks: {
    overview: "Teaches production, packaging, and pricing of popular Nigerian snacks at a sellable standard.",
    finalProject: "Produce, package, and price a mixed snack order (minimum 3 items) for a mock client brief.",
    weeks: [
      { number: 1, topic: "Hygiene & tools", activities: "Kitchen hygiene, food safety, equipment" },
      { number: 2, topic: "Ingredients & costing", activities: "Basic ingredients, measurements, costing snacks" },
      { number: 3, topic: "Fried snacks", activities: "Puff-puff, chin-chin, samosa" },
      { number: 4, topic: "Baked snacks", activities: "Meat pie, sausage roll basics" },
      { number: 5, topic: "Small chops", activities: "Variety production & presentation" },
      { number: 6, topic: "Packaging & branding", activities: "Packaging materials, branding snacks for sale" },
      { number: 7, topic: "Bulk production", activities: "Planning & order management" },
      { number: 8, topic: "Final assessment", activities: "Produce and package a snack order for a mock client" },
    ],
  },
  catering_meals: {
    overview: "Teaches core Nigerian meal cooking, plating, and menu costing for events and bulk orders.",
    finalProject: "Plan, cook, and present a 3-course meal (or bulk order) for a mock client event brief, with a costed menu.",
    weeks: [
      { number: 1, topic: "Hygiene & knife skills", activities: "Kitchen hygiene, food safety, equipment, knife skills" },
      { number: 2, topic: "Sourcing & costing", activities: "Ingredient sourcing, measurements, costing meals" },
      { number: 3, topic: "Soups & stews", activities: "Nigerian soup and stew fundamentals (jollof, stews, soups)" },
      { number: 4, topic: "Rice & sides", activities: "Rice dish and side variety" },
      { number: 5, topic: "Protein preparation", activities: "Chicken, fish, and meat techniques" },
      { number: 6, topic: "Plating & presentation", activities: "Portion control, presentation" },
      { number: 7, topic: "Event planning", activities: "Bulk meal planning & logistics" },
      { number: 8, topic: "Final assessment", activities: "Plan and cook a full meal for a mock event order" },
    ],
  },
  ict_ai_mastery: {
    overview: "An accelerated combination of Basic Computer Literacy, Productivity Tools, Graphic Design, and AI — each condensed from 4 weeks to 3, run back-to-back.",
    finalProject: "A \"small business starter toolkit\" using all four skill sets together — a Word proposal, an Excel budget, a PowerPoint pitch, and a designed flyer, produced with AI assistance and presented as one package.",
    weeks: [
      { number: 1, topic: "Computer Literacy (1/3)", activities: "Fundamentals + typing/system basics merged" },
      { number: 2, topic: "Computer Literacy (2/3)", activities: "Continued fundamentals" },
      { number: 3, topic: "Computer Literacy (3/3)", activities: "Internet, email & cloud" },
      { number: 4, topic: "Productivity Tools (1/3)", activities: "Word" },
      { number: 5, topic: "Productivity Tools (2/3)", activities: "Excel" },
      { number: 6, topic: "Productivity Tools (3/3)", activities: "PowerPoint + integration" },
      { number: 7, topic: "Graphic Design (1/3)", activities: "Fundamentals + software" },
      { number: 8, topic: "Graphic Design (2/3)", activities: "Print/branding" },
      { number: 9, topic: "Graphic Design (3/3)", activities: "Portfolio project" },
      { number: 10, topic: "AI (1/3)", activities: "Tools & prompting" },
      { number: 11, topic: "AI (2/3)", activities: "Productivity/creativity/ethics" },
      { number: 12, topic: "AI (3/3) — Capstone", activities: "Applied capstone combining all four modules" },
    ],
  },
  catering_combined: {
    overview: "Combines Catering: Snacks Only and Catering: Meals Only — shared foundations taught once, then each track condensed from 8 weeks to 5.",
    finalProject: "Produce a packaged snack order AND a full costed meal for one mock client event.",
    weeks: [
      { number: 1, topic: "Shared foundations", activities: "Kitchen hygiene, food safety, equipment & tools" },
      { number: 2, topic: "Shared foundations", activities: "Ingredient sourcing, measurement, costing & pricing" },
      { number: 3, topic: "Snacks: fried snacks", activities: "Puff-puff, chin-chin, samosa" },
      { number: 4, topic: "Snacks: baked snacks", activities: "Meat pie, sausage roll basics" },
      { number: 5, topic: "Snacks: small chops", activities: "Variety production & presentation" },
      { number: 6, topic: "Snacks: packaging & branding", activities: "Packaging materials, branding" },
      { number: 7, topic: "Snacks: bulk production", activities: "Planning & order management" },
      { number: 8, topic: "Meals: soups & stews", activities: "Nigerian soup and stew fundamentals" },
      { number: 9, topic: "Meals: rice & sides", activities: "Rice dish and side variety" },
      { number: 10, topic: "Meals: protein preparation", activities: "Chicken, fish, and meat techniques" },
      { number: 11, topic: "Meals: plating & presentation", activities: "Portion control, presentation" },
      { number: 12, topic: "Event planning & final assessment", activities: "Bulk logistics + combined final assessment" },
    ],
  },
  tailoring: {
    overview: "Takes a learner from sewing-machine basics to constructing a full wearable outfit from measurement to finished garment.",
    finalProject: "A complete, wearable outfit built from the learner's own measurements, with a costed price.",
    weeks: [
      { number: 1, topic: "Machine basics", activities: "Sewing machine parts & safety, hand-stitching" },
      { number: 2, topic: "Measurement & fabric", activities: "Fabric types, taking body measurements" },
      { number: 3, topic: "Pattern drafting", activities: "Drafting a simple skirt/trouser block" },
      { number: 4, topic: "Cutting & seams", activities: "Cutting techniques, seam types & finishing" },
      { number: 5, topic: "Skirt construction", activities: "Building a simple skirt" },
      { number: 6, topic: "Trouser construction", activities: "Building trousers" },
      { number: 7, topic: "Top construction", activities: "Building a simple top/blouse" },
      { number: 8, topic: "Closures", activities: "Zippers, buttons, other closures" },
      { number: 9, topic: "Fitting", activities: "Alterations & fitting adjustments" },
      { number: 10, topic: "Advanced techniques", activities: "Collars, sleeves" },
      { number: 11, topic: "Advanced garment", activities: "Shirt or dress construction" },
      { number: 12, topic: "Final project", activities: "Full outfit from measurement to finish, costing & presentation" },
    ],
  },
  fashion_design: {
    overview: "Takes a learner from an original sketch to a finished garment and a small presented collection concept.",
    finalProject: "One complete wearable garment from an original design, plus a presented 3–5 look mini-collection portfolio.",
    weeks: [
      { number: 1, topic: "Intro & sketching", activities: "Fashion sketching basics (croquis, figure drawing)" },
      { number: 2, topic: "Design principles", activities: "Line, silhouette, color, texture" },
      { number: 3, topic: "Fabric & trends", activities: "Fabric selection & sourcing, trend research" },
      { number: 4, topic: "Concept development", activities: "Design concept & mood board" },
      { number: 5, topic: "Technical drawing", activities: "Flat sketching / technical drawings" },
      { number: 6, topic: "Pattern making", activities: "Basic pattern making from a design sketch" },
      { number: 7, topic: "Draping", activities: "Draping basics on a form" },
      { number: 8, topic: "Construction (part 1)", activities: "Cutting & assembly from own design" },
      { number: 9, topic: "Construction (part 2)", activities: "Finishing details" },
      { number: 10, topic: "Mini-collection", activities: "3–5 look mini-collection sketches" },
      { number: 11, topic: "Portfolio", activities: "Portfolio development, photographing/presenting work" },
      { number: 12, topic: "Final presentation", activities: "Complete garment + presented mini-collection portfolio" },
    ],
  },
};

function getCurriculum(courseId) {
  return CURRICULUM[courseId] || null;
}

module.exports = { CURRICULUM, getCurriculum };
