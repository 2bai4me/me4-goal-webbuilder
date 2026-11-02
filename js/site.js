/* ME4 Goal Webbuilder - minimales JS, ohne externe Bibliothek. */
(function () {
  "use strict";
  var stamp = document.querySelector("meta[name='build-stamp']");
  if (stamp) {
    stamp.setAttribute("data-generator", stamp.getAttribute("content") || "");
  }

  // Anker-Navigation ohne History-API: sanft scrollen, Fokus setzen.
  var links = document.querySelectorAll('a[href^="#"]');
  for (var i = 0; i < links.length; i += 1) {
    links[i].addEventListener("click", function (event) {
      var targetId = this.getAttribute("href").slice(1);
      if (!targetId) { return; }
      var target = document.getElementById(targetId);
      if (!target) { return; }
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  // Aktiven Navigationspunkt markieren.
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".site-nav a");
  function markActive() {
    var current = "";
    for (var i = 0; i < sections.length; i += 1) {
      if (sections[i].getBoundingClientRect().top <= 80) {
        current = sections[i].id;
      }
    }
    for (var j = 0; j < navLinks.length; j += 1) {
      var href = navLinks[j].getAttribute("href") || "";
      if (href === "#" + current) {
        navLinks[j].setAttribute("aria-current", "page");
      } else {
        navLinks[j].removeAttribute("aria-current");
      }
    }
  }
  window.addEventListener("scroll", markActive, { passive: true });
  markActive();
})();
