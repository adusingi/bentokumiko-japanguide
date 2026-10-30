(function () {
  "use strict";

  var chooser = document.querySelector("[data-service-chooser]");
  if (!chooser) return;

  var tablist = chooser.querySelector("[data-service-tabs]");
  var tabs = Array.from(chooser.querySelectorAll("[data-service-tab]"));
  var panels = Array.from(chooser.querySelectorAll("[data-service-panel]"));
  var status = chooser.querySelector("[data-service-status]");
  var selectedService = chooser.querySelector("[data-selected-service]");
  if (!tablist || tabs.length !== 2 || panels.length !== 2) return;

  function selectService(key, focus, updateHash) {
    tabs.forEach(function (tab) {
      var selected = tab.dataset.serviceTab === key;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
      if (selected && updateHash) window.history.replaceState(null, "", tab.getAttribute("href"));
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.servicePanel !== key;
    });
    selectedService.textContent = key === "trip" ? chooser.dataset.tripLabel : chooser.dataset.shoppingLabel;
  }

  tablist.setAttribute("role", "tablist");
  tabs.forEach(function (tab) {
    var key = tab.dataset.serviceTab;
    var panel = panels.find(function (candidate) { return candidate.dataset.servicePanel === key; });
    tab.id = `service-tab-${key}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);

    tab.addEventListener("click", function (event) {
      event.preventDefault();
      selectService(key, false, true);
    });

    tab.addEventListener("keydown", function (event) {
      if (event.key === " ") {
        event.preventDefault();
        selectService(key, false, true);
        return;
      }
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      var index = tabs.indexOf(tab);
      if (event.key === "ArrowLeft") index = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") index = (index + 1) % tabs.length;
      if (event.key === "Home") index = 0;
      if (event.key === "End") index = tabs.length - 1;
      selectService(tabs[index].dataset.serviceTab, true, true);
    });
  });

  chooser.classList.add("is-enhanced");
  status.hidden = false;
  selectService(window.location.hash === "#shopping" ? "shopping" : "trip", false, false);
}());
