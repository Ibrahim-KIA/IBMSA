(function () {
  const SUPPORT_NUMBER = "2348026559663";
  const defaultMessage = "Hi, I need help with my registration for the IBM School Skill Acquisition Program.";

  const link = document.createElement("a");
  link.href = `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;
  link.target = "_blank";
  link.rel = "noopener";
  link.className = "support-float";
  link.setAttribute("aria-label", "Chat with us on WhatsApp");
  link.title = "Need help? Chat with us on WhatsApp";
  link.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.01 3C9.38 3 4 8.37 4 15c0 2.23.61 4.32 1.67 6.11L4 29l8.1-1.62A11.94 11.94 0 0 0 16.01 27C22.63 27 28 21.63 28 15S22.63 3 16.01 3Z" fill="white" fill-opacity="0.12"/>
      <path d="M16 5c5.52 0 10 4.48 10 10s-4.48 10-10 10c-1.77 0-3.43-.46-4.87-1.27l-.5-.28-3.63.97.98-3.55-.3-.53A9.95 9.95 0 0 1 6 15C6 9.48 10.48 5 16 5Zm-3.9 5.45c-.2 0-.5.07-.77.37-.26.3-1 1-1 2.4s1.03 2.77 1.17 2.96c.15.2 2 3.2 4.94 4.36 2.44.97 2.94.78 3.47.73.53-.05 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.56-.35-.3-.15-1.7-.84-1.97-.94-.26-.1-.46-.15-.65.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.08-.3-.15-1.24-.46-2.37-1.47-.87-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.65-1.65-.92-2.25-.23-.53-.47-.5-.65-.5Z" fill="white"/>
    </svg>
  `;
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(link));
})();
