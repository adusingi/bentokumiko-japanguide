(() => {
  const reviewCarousel = document.querySelector("#review-carousel");
  if (!reviewCarousel) return;

  const reviewTrack = reviewCarousel.querySelector(".review-carousel__track");
  const reviewRange = reviewCarousel.querySelector("#review-carousel-range");
  const reviewDots = reviewCarousel.querySelector("#review-carousel-dots");
  const reviewPrevious = reviewCarousel.querySelector("#review-carousel-previous");
  const reviewNext = reviewCarousel.querySelector("#review-carousel-next");
  const reviewDialog = document.querySelector("#review-dialog");
  const reviewDialogClose = document.querySelector("#review-dialog-close");
  const reviewDialogEyebrow = document.querySelector("#review-dialog-eyebrow");
  const reviewDialogTitle = document.querySelector("#review-dialog-title");
  const reviewDialogContent = document.querySelector("#review-dialog-content");
  const requiredElements = [
    reviewTrack,
    reviewRange,
    reviewDots,
    reviewPrevious,
    reviewNext,
    reviewDialog,
    reviewDialogClose,
    reviewDialogEyebrow,
    reviewDialogTitle,
    reviewDialogContent,
  ];
  if (requiredElements.some((element) => !element)) return;

  const reviewCards = [...reviewTrack.querySelectorAll("[data-review-card]")];
  const reviewTriggers = [...reviewCarousel.querySelectorAll("[data-review-story]")];
  if (!reviewCards.length || !reviewTriggers.length) return;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const reviewSources = {
    everyln: {
      title: "Everyln & Fabiola",
      eyebrow: "Guest testimonial",
      template: document.querySelector("#review-source-everyln"),
    },
    marc: {
      title: "Marc L.",
      eyebrow: "Complete testimonial",
      template: document.querySelector("#review-source-marc"),
    },
    heri: {
      title: "Heri R.",
      eyebrow: "Proposed translation + approved French original",
      template: document.querySelector("#review-source-heri"),
    },
    laure: {
      title: "Laure D.",
      eyebrow: "Complete testimonial",
      template: document.querySelector("#review-source-laure"),
    },
  };

  let reviewStart = 0;
  let reviewScrollFrame = 0;
  let reviewResizeFrame = 0;
  let dialogReturnFocus = null;

  function isEditingTarget(target) {
    return target instanceof Element && target.matches("input, textarea, select, [contenteditable='true']");
  }

  function reviewMetrics() {
    if (!reviewTrack.clientWidth) return null;
    const cardWidth = reviewCards[0].getBoundingClientRect().width;
    if (!cardWidth) return null;
    const gap = Number.parseFloat(window.getComputedStyle(reviewTrack).columnGap) || 0;
    const visible = Math.max(1, Math.min(reviewCards.length, Math.round((reviewTrack.clientWidth + gap) / (cardWidth + gap))));
    return { visible, maxStart: reviewCards.length - visible };
  }

  function reviewCardLeft(index) {
    return reviewCards[index].offsetLeft - reviewCards[0].offsetLeft;
  }

  function nearestReviewStart(metrics) {
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    for (let index = 0; index <= metrics.maxStart; index += 1) {
      const nextDistance = Math.abs(reviewCardLeft(index) - reviewTrack.scrollLeft);
      if (nextDistance < distance) {
        nearest = index;
        distance = nextDistance;
      }
    }
    return nearest;
  }

  function renderReviewDots(metrics) {
    const count = metrics.maxStart + 1;
    if (reviewDots.children.length !== count) {
      reviewDots.replaceChildren();
      for (let index = 0; index < count; index += 1) {
        const dot = document.createElement("button");
        const end = Math.min(reviewCards.length, index + metrics.visible);
        dot.type = "button";
        dot.setAttribute("aria-label", `Show reviews ${index + 1}–${end} of ${reviewCards.length}`);
        dot.addEventListener("click", () => goToReviewStart(index));
        reviewDots.append(dot);
      }
    }

    [...reviewDots.children].forEach((dot, index) => {
      dot.setAttribute("aria-current", String(index === reviewStart));
    });
  }

  function renderReviewState(metrics = reviewMetrics()) {
    if (!metrics) return;
    reviewStart = Math.max(0, Math.min(reviewStart, metrics.maxStart));
    const end = Math.min(reviewCards.length, reviewStart + metrics.visible);
    const rangeText = `${reviewStart + 1}–${end} of ${reviewCards.length}`;
    reviewRange.value = rangeText;
    reviewRange.textContent = rangeText;
    reviewPrevious.disabled = reviewStart === 0;
    reviewNext.disabled = reviewStart === metrics.maxStart;

    reviewCards.forEach((card, index) => {
      const visible = index >= reviewStart && index < end;
      card.setAttribute("aria-hidden", String(!visible));
      const trigger = card.querySelector(".review-card__read");
      if (trigger) trigger.tabIndex = visible ? 0 : -1;
    });
    renderReviewDots(metrics);
  }

  function scrollToReviewStart(index, behavior) {
    const left = reviewCardLeft(index);
    if (typeof reviewTrack.scrollTo === "function") reviewTrack.scrollTo({ left, behavior });
    else reviewTrack.scrollLeft = left;
  }

  function goToReviewStart(nextStart, { smooth = true } = {}) {
    const metrics = reviewMetrics();
    if (!metrics) return;
    reviewStart = Math.max(0, Math.min(nextStart, metrics.maxStart));
    const behavior = smooth && !reduceMotion?.matches ? "smooth" : "auto";
    scrollToReviewStart(reviewStart, behavior);
    renderReviewState(metrics);
  }

  function refreshReviewCarousel() {
    reviewResizeFrame = 0;
    const metrics = reviewMetrics();
    if (!metrics) return;
    reviewStart = Math.max(0, Math.min(reviewStart, metrics.maxStart));
    scrollToReviewStart(reviewStart, "auto");
    renderReviewState(metrics);
  }

  function queueCarouselRefresh() {
    if (reviewResizeFrame) window.cancelAnimationFrame(reviewResizeFrame);
    reviewResizeFrame = window.requestAnimationFrame(refreshReviewCarousel);
  }

  function updateReviewStateFromScroll() {
    reviewScrollFrame = 0;
    const metrics = reviewMetrics();
    if (!metrics) return;
    reviewStart = nearestReviewStart(metrics);
    renderReviewState(metrics);
  }

  function buildReviewDialog(story) {
    const source = reviewSources[story];
    if (!source?.template) return false;
    reviewDialogEyebrow.textContent = source.eyebrow;
    reviewDialogTitle.textContent = source.title;
    reviewDialogContent.replaceChildren(source.template.content.cloneNode(true));
    return true;
  }

  function restoreDialogFocus() {
    if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus({ preventScroll: true });
    dialogReturnFocus = null;
  }

  function closeReviewDialog() {
    if (typeof reviewDialog.close === "function") {
      if (reviewDialog.open) reviewDialog.close();
      return;
    }
    reviewDialog.removeAttribute("open");
    reviewDialog.removeAttribute("aria-modal");
    restoreDialogFocus();
  }

  function openReviewDialog(trigger) {
    if (!buildReviewDialog(trigger.dataset.reviewStory)) return;
    dialogReturnFocus = trigger;
    if (typeof reviewDialog.showModal === "function") {
      reviewDialog.showModal();
    } else {
      reviewDialog.setAttribute("open", "");
      reviewDialog.setAttribute("role", "dialog");
      reviewDialog.setAttribute("aria-modal", "true");
    }
    reviewDialogClose.focus({ preventScroll: true });
  }

  reviewCarousel.addEventListener("keydown", (event) => {
    if (isEditingTarget(event.target)) return;
    const focusWasInsideCard = event.target instanceof Element && Boolean(event.target.closest(".review-card"));
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToReviewStart(reviewStart - 1);
      if (focusWasInsideCard) reviewTrack.focus({ preventScroll: true });
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToReviewStart(reviewStart + 1);
      if (focusWasInsideCard) reviewTrack.focus({ preventScroll: true });
    }
  });

  reviewTrack.addEventListener("scroll", () => {
    if (reviewScrollFrame) window.cancelAnimationFrame(reviewScrollFrame);
    reviewScrollFrame = window.requestAnimationFrame(updateReviewStateFromScroll);
  }, { passive: true });

  reviewPrevious.addEventListener("click", () => goToReviewStart(reviewStart - 1));
  reviewNext.addEventListener("click", () => goToReviewStart(reviewStart + 1));
  reviewTriggers.forEach((trigger) => trigger.addEventListener("click", () => openReviewDialog(trigger)));

  reviewDialogClose.addEventListener("click", closeReviewDialog);
  reviewDialog.addEventListener("click", (event) => {
    if (event.target === reviewDialog) closeReviewDialog();
  });
  reviewDialog.addEventListener("close", restoreDialogFocus);
  reviewDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && typeof reviewDialog.close !== "function") {
      event.preventDefault();
      closeReviewDialog();
    }
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(queueCarouselRefresh).observe(reviewTrack);
  } else {
    window.addEventListener("resize", queueCarouselRefresh, { passive: true });
  }

  queueCarouselRefresh();
})();
