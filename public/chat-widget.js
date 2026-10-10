// Stand-in for a third-party "help chat" widget (the kind a support company
// gives you as a <script> tag). It adds a floating help button to the page.
(function () {
  // pretend to do the setup work a real widget does before it can show anything
  var start = Date.now();
  while (Date.now() - start < 150) {}

  function mount() {
    var button = document.createElement("a");
    button.href = "tel:8000";
    button.className = "help-chat";
    button.textContent = "Need help? Call 8000";
    document.body.appendChild(button);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
