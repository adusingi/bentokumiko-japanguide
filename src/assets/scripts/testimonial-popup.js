(function () {
  "use strict";

  var card = document.getElementById("heri-testimonial");
  var trigger = document.getElementById("heri-quote-trigger");
  var quote = document.getElementById("heri-quote");
  if (!card || !trigger || !quote) return;

  var credit = card.querySelector(".guest-card-credit");
  var stars = card.querySelector(".guest-stars");
  var author = credit.querySelector("strong");
  var context = credit.querySelector("span");
  var hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)");
  var layer = document.createElement("div");
  var popup = null;
  var closeTimer = null;
  var repositionFrame = null;
  var suppressFocusOpen = false;

  layer.className = "testimonial-popup-layer";
  document.body.appendChild(layer);

  function clearCloseTimer() {
    if (closeTimer) window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  function makePopup() {
    var surface = document.createElement("section");
    var header = document.createElement("header");
    var headingGroup = document.createElement("div");
    var eyebrow = document.createElement("p");
    var heading = document.createElement("h2");
    var close = document.createElement("button");
    var popupStars = stars.cloneNode(true);
    var blockquote = document.createElement("blockquote");
    var popupQuote = quote.cloneNode(true);
    var popupContext = document.createElement("p");

    surface.className = "testimonial-popup";
    surface.id = "testimonial-reading-surface";
    surface.setAttribute("role", "dialog");
    surface.setAttribute("aria-labelledby", "testimonial-reading-title");

    header.className = "testimonial-popup-header";
    eyebrow.className = "testimonial-popup-eyebrow";
    eyebrow.textContent = "Complete testimonial";
    heading.id = "testimonial-reading-title";
    heading.textContent = author.textContent;
    close.className = "testimonial-popup-close";
    close.type = "button";
    close.setAttribute("aria-label", "Close complete testimonial");
    close.textContent = "×";

    popupStars.className = "testimonial-popup-stars";
    popupStars.setAttribute("aria-hidden", "true");
    popupQuote.removeAttribute("id");
    popupQuote.className = "testimonial-popup-quote";
    popupContext.className = "testimonial-popup-context";
    popupContext.textContent = context.textContent;

    headingGroup.append(eyebrow, heading);
    header.append(headingGroup, close);
    blockquote.appendChild(popupQuote);
    surface.append(header, popupStars, blockquote, popupContext);

    close.addEventListener("click", function () { closePopup(true); });
    surface.addEventListener("pointerenter", clearCloseTimer);
    surface.addEventListener("pointerleave", scheduleHoverClose);
    surface.addEventListener("focusin", clearCloseTimer);
    surface.addEventListener("focusout", scheduleFocusClose);
    return surface;
  }

  function positionPopup() {
    if (!popup) return;

    var anchor = card.getBoundingClientRect();
    var viewportPadding = 16;
    var width = Math.min(520, window.innerWidth - viewportPadding * 2);
    popup.style.width = width + "px";
    popup.style.left = "0px";
    popup.style.top = "0px";

    var panel = popup.getBoundingClientRect();
    var activeInsidePopup = popup.contains(document.activeElement);
    if ((anchor.bottom < 0 || anchor.top > window.innerHeight) && !activeInsidePopup) {
      closePopup(false);
      return;
    }

    var left = Math.max(viewportPadding, Math.min(anchor.left, window.innerWidth - panel.width - viewportPadding));
    var top = anchor.bottom + 12;
    if (top + panel.height > window.innerHeight - viewportPadding) top = anchor.top - panel.height - 12;
    top = Math.max(viewportPadding, Math.min(top, window.innerHeight - panel.height - viewportPadding));

    popup.style.left = left + "px";
    popup.style.top = top + "px";
    popup.classList.add("is-positioned");
  }

  function requestReposition() {
    if (!popup || repositionFrame) return;
    repositionFrame = window.requestAnimationFrame(function () {
      repositionFrame = null;
      positionPopup();
    });
  }

  function openPopup(reason) {
    clearCloseTimer();
    if (!popup) {
      popup = makePopup();
      layer.replaceChildren(popup);
      trigger.setAttribute("aria-expanded", "true");
      positionPopup();
    }
    if (reason === "activation") {
      popup.querySelector(".testimonial-popup-close").focus({ preventScroll: true });
    }
  }

  function closePopup(returnFocus) {
    clearCloseTimer();
    if (!popup) return;
    if (repositionFrame) window.cancelAnimationFrame(repositionFrame);
    repositionFrame = null;
    popup = null;
    layer.replaceChildren();
    trigger.setAttribute("aria-expanded", "false");
    if (returnFocus) {
      suppressFocusOpen = true;
      trigger.focus({ preventScroll: true });
      window.requestAnimationFrame(function () { suppressFocusOpen = false; });
    }
  }

  function scheduleHoverClose() {
    if (!hoverCapable.matches) return;
    clearCloseTimer();
    closeTimer = window.setTimeout(function () {
      if (trigger === document.activeElement || (popup && popup.contains(document.activeElement))) return;
      closePopup(false);
    }, 220);
  }

  function scheduleFocusClose() {
    clearCloseTimer();
    closeTimer = window.setTimeout(function () {
      if (trigger === document.activeElement || (popup && popup.contains(document.activeElement))) return;
      closePopup(false);
    }, 0);
  }

  card.addEventListener("pointerenter", function () {
    if (hoverCapable.matches) openPopup("hover");
  });
  card.addEventListener("pointerleave", scheduleHoverClose);
  trigger.addEventListener("focus", function () {
    if (!suppressFocusOpen) openPopup("focus");
  });
  trigger.addEventListener("focusout", scheduleFocusClose);
  trigger.addEventListener("click", function () { openPopup("activation"); });

  document.addEventListener("pointerdown", function (event) {
    if (!popup || card.contains(event.target) || popup.contains(event.target)) return;
    closePopup(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && popup) {
      event.preventDefault();
      closePopup(true);
    }
  });
  window.addEventListener("scroll", requestReposition, { passive: true });
  window.addEventListener("resize", requestReposition);

  trigger.disabled = false;
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "testimonial-reading-surface");
  trigger.setAttribute("aria-haspopup", "dialog");
  card.classList.add("testimonial-popup-ready");
}());
