(function () {
  "use strict";
  document.querySelectorAll('form[data-preview-form], form#enquiryForm').forEach(function (form) {
    form.setAttribute("data-preview-form", "true");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var result = form.querySelector(".form-result");
      if (!form.checkValidity()) {
        form.reportValidity();
        result.hidden = false;
        result.textContent = "Please complete the required fields. Nothing has been sent or saved.";
        return;
      }
      result.hidden = false;
      result.textContent = "Your answers look complete. This was only a preview: nothing was sent or saved.";
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
    });
  });
}());
