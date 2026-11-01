/* ------------------------------------------------------------------
   Glance for Windows — site behaviour
   Ports the production site's reveal, frost, video and carousel logic.
------------------------------------------------------------------- */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- */
  /* Frost strips                                                      */
  /* ---------------------------------------------------------------- */

  // Height (%) and opacity pairs, in source order. The wing flags control
  // which strips are visible at each breakpoint; the extra-gap flag widens
  // the gap just right of centre.
  const STRIPS = [
    [26, 0.62, "wing wing-lg"],
    [40, 0.75, "wing wing-lg"],
    [32, 0.72, "wing wing-lg"],
    [28, 0.5, "wing wing-lg"],
    [20, 0.65, "wing"],
    [26, 0.78, "wing"],
    [42, 0.78, "wing"],
    [28, 0.7, "wing"],
    [17, 0.88, ""],
    [25, 0.96, ""],
    [14, 0.7, "optional"],
    [20, 0.76, "optional"],
    [33, 0.68, ""],
    [22, 0.92, ""],
    [16, 0.92, "optional"],
    [14, 0.8, "extra-gap"],
    [14, 0.66, "optional"],
    [20, 0.74, ""],
    [36, 0.8, ""],
    [42, 0.9, ""],
    [32, 0.84, ""],
    [19, 0.64, "optional"],
    [31, 0.78, ""],
    [48, 0.92, ""],
    [68, 1, ""],
    [60, 0.9, ""],
    [48, 0.82, ""],
    [40, 0.94, ""],
    [50, 1, ""],
    [72, 0.8, ""],
    [100, 0.98, ""],
    [80, 0.88, ""],
    [94, 0.95, ""],
    [84, 0.78, ""],
    [70, 0.86, "wing"],
    [40, 0.74, "wing"],
    [48, 0.92, "wing"],
    [44, 0.8, "wing"],
    [36, 0.68, "wing wing-lg"],
    [68, 0.84, "wing wing-lg"],
    [48, 0.72, "wing wing-lg"],
    [58, 0.78, "wing wing-lg"],
  ];

  $$("[data-frost-field]").forEach((field) => {
    const fragment = document.createDocumentFragment();

    STRIPS.forEach(([height, opacity, flags], index) => {
      const strip = document.createElement("span");
      strip.className = "frost__strip";
      if (flags) {
        flags.split(" ").forEach((flag) => {
          strip.classList.add(flag === "extra-gap" ? "frost__strip--extra-gap" : `frost__${flag}`);
        });
      }
      strip.style.setProperty("--h", String(height));
      strip.style.setProperty("--o", String(opacity));
      strip.style.setProperty("--i", String(index));
      fragment.appendChild(strip);
    });

    field.appendChild(fragment);
  });

  /* ---------------------------------------------------------------- */
  /* Reveals                                                           */
  /* ---------------------------------------------------------------- */

  const revealAll = (root) => {
    $$(".reveal", root).forEach((el) => el.classList.add("is-revealed"));
  };

  const revealOnEnter = (root, threshold, options = {}) => {
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          revealAll(root);
          observer.disconnect();
        }
      },
      { threshold, ...options }
    );
    observer.observe(root);
  };

  // Hero reveal fires on the first frame after paint.
  requestAnimationFrame(() => {
    const hero = $("#hero");
    if (hero) revealAll(hero);
  });

  revealOnEnter($("#design"), 0.15);
  revealOnEnter($(".cta"), 0.75);

  const subpage = $(".page") || $(".feedback");
  if (subpage) {
    requestAnimationFrame(() => revealAll(subpage));
  }

  const carouselPrev = $('[data-nav="carousel-prev"]');
  const carouselNext = $('[data-nav="carousel-next"]');

  /* ---------------------------------------------------------------- */
  /* Design videos                                                     */
  /* ---------------------------------------------------------------- */

  // Single looping video with a pause between plays.
  const idleVideo = $('[data-video="idle"]');

  if (idleVideo) {
    idleVideo.src = "assets/design/idleanimation.mp4";
    idleVideo.preload = "metadata";

    let replayTimer = null;

    const playIfVisible = (visible) => {
      if (visible) {
        if (replayTimer) return;
        if (
          idleVideo.duration &&
          idleVideo.currentTime >= idleVideo.duration - 0.05
        ) {
          idleVideo.currentTime = 0;
        }
        idleVideo.play().catch(() => {});
      } else {
        idleVideo.pause();
        if (replayTimer) {
          clearTimeout(replayTimer);
          replayTimer = null;
        }
      }
    };

    idleVideo.addEventListener("ended", () => {
      replayTimer = window.setTimeout(() => {
        replayTimer = null;
        idleVideo.currentTime = 0;
        idleVideo.play().catch(() => {});
      }, 3000);
    });

    new IntersectionObserver(
      ([entry]) => playIfVisible(entry.isIntersecting),
      { threshold: 0.4 }
    ).observe(idleVideo);
  }

  // Pill lock-screen loops: two stacked videos crossfade so the reset is
  // never visible, with a hold at the end of each pass.
  const initCrossfade = (pill, src, hold) => {
    const videos = $$("video", pill);
    if (videos.length < 2) return;

    videos.forEach((video) => {
      video.src = src;
      video.preload = "metadata";
      video.style.opacity = "0";
    });
    videos[0].style.opacity = "1";

    let front = videos[0];
    let back = videos[1];
    let holdTimer = null;
    let visible = false;

    const startFront = () => {
      if (!visible) return;
      if (front.duration && front.currentTime >= front.duration - 0.05) {
        front.currentTime = 0;
      }
      front.play().catch(() => {});
    };

    const onEnded = () => {
      if (!visible) return;
      holdTimer = window.setTimeout(() => {
        holdTimer = null;
        if (!visible) return;
        back.currentTime = 0;
        back.play().catch(() => {});
        front.style.opacity = "0";
        back.style.opacity = "1";
        const previous = front;
        front = back;
        back = previous;
      }, hold);
    };

    videos.forEach((video) => video.addEventListener("ended", onEnded));

    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          startFront();
        } else {
          videos.forEach((video) => video.pause());
          if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
          }
        }
      },
      { threshold: 0.4 }
    ).observe(pill);
  };

  $$('[data-crossfade="unlock"]').forEach((pill) =>
    initCrossfade(pill, "assets/design/unlockanimation.mp4", 1500)
  );
  $$('[data-crossfade="unsuccessful"]').forEach((pill) =>
    initCrossfade(pill, "assets/design/unsuccessfulunlockanimation.mp4", 1500)
  );

  /* ---------------------------------------------------------------- */
  /* Security section: reveal, 3D flip-in, cards                       */
  /* ---------------------------------------------------------------- */

  const securitySection = $("#security");
  const securityCarousel = $("#security-carousel");
  const scroller = $("#security-scroller");

  if (securitySection) {
    const securityReveals = $$(".reveal", securitySection);

    new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        securityReveals.forEach((el) => el.classList.add("is-revealed"));
        window.setTimeout(() => {
          securityReveals.forEach((el) => el.classList.add("is-settled"));
        }, 500);
        observer.disconnect();
      },
      { threshold: 0.15 }
    ).observe(securitySection);
  }

  if (securityCarousel && scroller) {
    const inners = $$(".security__card-inner", securityCarousel);
    const cards = $$(".security__card", securityCarousel);
    const flipButtons = $$(".security__flip-button", securityCarousel);

    const setEnabled = (enabled) => {
      flipButtons.forEach((button) => {
        button.disabled = !enabled;
      });
    };

    new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        securityCarousel.classList.add("is-flip-in");

        window.setTimeout(
          () => {
            securityCarousel.classList.add("is-flip-settled");
            setEnabled(true);
          },
          90 * (inners.length - 1) + 700
        );

        observer.disconnect();
      },
      { threshold: 0.2, rootMargin: "0px 0px -22% 0px" }
    ).observe(securityCarousel);

    if (reduced) setEnabled(true);

    /* Flip cards ---------------------------------------------------- */

    const syncFaces = (inner, flipped) => {
      const front = $(".security__face:not(.security__face--back)", inner);
      const back = $(".security__face--back", inner);
      const frontButton = $(".security__flip-button", front);

      front.setAttribute("aria-hidden", String(flipped));
      back.setAttribute("aria-hidden", String(!flipped));
      front.toggleAttribute("inert", flipped);
      back.toggleAttribute("inert", !flipped);
      frontButton.setAttribute("aria-expanded", String(flipped));
    };

    securityCarousel.addEventListener("click", (event) => {
      const button = event.target.closest(".security__flip-button");
      if (!button) return;

      const inner = button.closest(".security__card-inner");
      if (!inner) return;

      const isBack = Boolean(button.closest(".security__face--back"));
      inner.classList.toggle("is-flipped", !isBack);
      syncFaces(inner, !isBack);
    });

    /* Carousel navigation ------------------------------------------ */

    let index = 0;
    let ticking = false;

    const paddingStart = () =>
      Number.parseFloat(getComputedStyle(scroller).paddingInlineStart) || 0;

    const updateIndex = () => {
      let nearest = 0;
      let distance = Infinity;

      cards.forEach((card, cardIndex) => {
        const delta = Math.abs(
          card.offsetLeft - paddingStart() - scroller.scrollLeft
        );
        if (delta < distance) {
          distance = delta;
          nearest = cardIndex;
        }
      });

      index = nearest;
      carouselPrev.disabled = index === 0;
      carouselNext.disabled = index === cards.length - 1;
    };

    const goTo = (nextIndex) => {
      const clamped = Math.min(cards.length - 1, Math.max(0, nextIndex));
      const card = cards[clamped];
      if (!card) return;
      scroller.scrollTo({
        left: card.offsetLeft - paddingStart(),
        behavior: reduced ? "auto" : "smooth",
      });
    };

    carouselPrev.addEventListener("click", () => goTo(index - 1));
    carouselNext.addEventListener("click", () => goTo(index + 1));

    scroller.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          updateIndex();
          ticking = false;
        });
      },
      { passive: true }
    );

    window.addEventListener("resize", updateIndex);
    updateIndex();

    // Arrow state depends on the carousel's own index.
    const syncCarouselArrows = () => {
      carouselPrev.disabled = index === 0;
      carouselNext.disabled = index === cards.length - 1;
    };
    scroller.addEventListener("scrollend", syncCarouselArrows);
  }

  /* ---------------------------------------------------------------- */
  /* Feedback form                                                     */
  /* ---------------------------------------------------------------- */

  const feedbackForm = $("#feedback-form");

  if (feedbackForm) {
    const typeButton = $("#feedback-type");
    const typeLabel = $("[data-type-label]", typeButton);
    const menu = $("#feedback-menu");
    const options = $$(".feedback__option", menu);
    const chevron = $("[data-chevron]");
    const send = $("#feedback-send");

    let selectedType = "";
    let open = false;
    let activeIndex = -1;
    let error = null;

    const clearError = () => {
      if (error) {
        error.remove();
        error = null;
      }
    };

    const showError = (message) => {
      clearError();
      error = document.createElement("p");
      error.className = "feedback__error";
      error.setAttribute("role", "alert");
      error.textContent = message;
      send.insertAdjacentElement("beforebegin", error);
    };

    const paintActive = () => {
      options.forEach((option, index) => {
        option.classList.toggle("feedback__option--active", index === activeIndex);
      });
    };

    const openMenu = (index = 0) => {
      open = true;
      activeIndex = index;
      menu.hidden = false;
      typeButton.setAttribute("aria-expanded", "true");
      chevron.classList.add("feedback__chevron--open");
      paintActive();
      options[activeIndex]?.focus();
    };

    const closeMenu = (restoreFocus = false) => {
      open = false;
      menu.hidden = true;
      typeButton.setAttribute("aria-expanded", "false");
      chevron.classList.remove("feedback__chevron--open");
      if (restoreFocus) typeButton.focus();
    };

    const choose = (option) => {
      selectedType = option.dataset.value || option.textContent;
      typeLabel.textContent = selectedType;
      typeButton.classList.remove("feedback__placeholder");
      typeButton.classList.add("feedback__filled");
      options.forEach((item) => {
        item.setAttribute("aria-selected", String(item === option));
      });
      closeMenu(true);
      clearError();
    };

    typeButton.addEventListener("click", () => {
      if (open) closeMenu(true);
      else openMenu(Math.max(0, options.indexOf($('[aria-selected="true"]', menu))));
    });

    typeButton.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openMenu(0);
      }
    });

    options.forEach((option, index) => {
      option.addEventListener("click", () => choose(option));
      option.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          choose(option);
        }
        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu(true);
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          activeIndex = (index + 1) % options.length;
          paintActive();
          options[activeIndex].focus();
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          activeIndex = (index - 1 + options.length) % options.length;
          paintActive();
          options[activeIndex].focus();
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!open) return;
      if (event.target.closest(".feedback__type-wrap")) return;
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (open && event.key === "Escape") closeMenu(true);
    });

    feedbackForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!selectedType) {
        showError("Please choose a feedback type.");
        typeButton.focus();
        return;
      }

      if (!feedbackForm.checkValidity()) {
        feedbackForm.reportValidity();
        return;
      }

      clearError();
      send.disabled = true;
      send.classList.add("is-sent");

      window.setTimeout(() => {
        feedbackForm.reset();
        selectedType = "";
        typeLabel.textContent = "Type...";
        typeButton.classList.add("feedback__placeholder");
        typeButton.classList.remove("feedback__filled");
        options.forEach((option) => option.setAttribute("aria-selected", "false"));
        send.classList.remove("is-sent");
        send.disabled = false;
      }, 2200);
    });
  }

  /* ---------------------------------------------------------------- */
  /* GitHub releases                                                    */
  /* ---------------------------------------------------------------- */

  const releasePanel = $("#release-panel");

  if (releasePanel) {
    const releaseStatus = $("#release-status", releasePanel);
    const featuredRelease = $("#featured-release", releasePanel);
    const releaseHistory = $("#release-history", releasePanel);
    const fallbackInstaller = releasePanel.dataset.fallbackInstaller;
    const releasesEndpoint =
      "https://api.github.com/repos/Sampath0411/glance-windows/releases?per_page=20";

    const isGitHubUrl = (value, pathPattern) => {
      try {
        const url = new URL(value);
        return (
          url.protocol === "https:" &&
          url.hostname === "github.com" &&
          !url.username &&
          !url.password &&
          !url.port &&
          pathPattern.test(url.pathname)
        );
      } catch {
        return false;
      }
    };

    const safeReleaseLink = (value) =>
      isGitHubUrl(value, /^\/Sampath0411\/glance-windows\/releases\/tag\/[^/]+\/?$/)
        ? value
        : null;

    const safeInstallerLink = (value) =>
      isGitHubUrl(value, /^\/Sampath0411\/glance-windows\/releases\/download\/.+\.exe$/i)
        ? value
        : null;

    const normalizeRelease = (item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const tag = typeof item.tag_name === "string" ? item.tag_name.trim() : "";
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const title = tag || name;
      const notesUrl = safeReleaseLink(item.html_url);
      const date = typeof item.published_at === "string" ? new Date(item.published_at) : null;
      if (!title || !notesUrl || !date || Number.isNaN(date.valueOf())) return null;

      const assets = Array.isArray(item.assets) ? item.assets : [];
      const exeAssets = assets
        .filter((asset) => asset && typeof asset.name === "string" && /\.exe$/i.test(asset.name))
        .map((asset) => ({ asset, url: safeInstallerLink(asset.browser_download_url) }))
        .filter(({ url }) => url);
      exeAssets.sort((left, right) => {
        const leftExact = left.asset.name.toLowerCase() === "glancesetup.exe" ? 0 : 1;
        const rightExact = right.asset.name.toLowerCase() === "glancesetup.exe" ? 0 : 1;
        return leftExact - rightExact;
      });

      return {
        title,
        notesUrl,
        date,
        preview: item.prerelease === true,
        installer: exeAssets[0] || null,
      };
    };

    const makeLink = (href, text, className, dataName) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      link.className = className;
      link.target = "_blank";
      link.rel = "noopener";
      if (dataName) link.dataset[dataName] = "";
      return link;
    };

    const makeStatusBadge = (preview) => {
      const badge = document.createElement("span");
      badge.className = `release-badge release-badge--${preview ? "preview" : "stable"}`;
      badge.textContent = preview ? "Preview" : "Stable";
      return badge;
    };

    const formatDate = (date) =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);

    const formatAssetSize = (asset) =>
      Number.isFinite(asset?.size) && asset.size > 0
        ? `${(asset.size / 1_000_000).toFixed(1)} MB`
        : "";

    const makeInstallerLink = (release, featured = false) => {
      if (!release.installer) return null;
      const label = featured ? "Download for Windows" : `Download ${release.title}`;
      const link = makeLink(
        release.installer.url,
        label,
        featured ? "btn btn--primary" : "release-history__download",
        "releaseDownload"
      );
      if (featured) {
        const labelSpan = document.createElement("span");
        labelSpan.className = "btn__label";
        labelSpan.textContent = label;
        link.replaceChildren(labelSpan);
      }
      const sizeLabel = formatAssetSize(release.installer.asset);
      if (!featured && sizeLabel) {
        const size = document.createElement("span");
        size.className = "release-history__size";
        size.textContent = sizeLabel;
        link.appendChild(size);
      }
      return link;
    };

    const renderFeatured = (release) => {
      const icon = document.createElement("img");
      icon.className = "release-featured__icon";
      icon.src = "assets/icon.png";
      icon.width = 112;
      icon.height = 112;
      icon.alt = "Glance app icon";

      const content = document.createElement("div");
      content.className = "release-featured__content";
      const heading = document.createElement("div");
      heading.className = "release-featured__heading";
      const details = document.createElement("div");
      const eyebrow = document.createElement("p");
      eyebrow.className = "release-featured__eyebrow";
      eyebrow.textContent = "Latest release";
      const version = document.createElement("h3");
      version.className = "release-featured__version";
      version.textContent = release.title;
      const date = document.createElement("p");
      date.className = "release-featured__date";
      const sizeLabel = formatAssetSize(release.installer?.asset);
      date.textContent = `Published ${formatDate(release.date)} · Windows 11 · 64-bit${sizeLabel ? ` · ${sizeLabel}` : ""}`;
      details.append(eyebrow, version, date);
      heading.append(details, makeStatusBadge(release.preview));

      const actions = document.createElement("div");
      actions.className = "release-featured__actions";
      const installer = makeInstallerLink(release, true);
      if (installer) {
        actions.appendChild(installer);
      } else {
        const unavailable = document.createElement("span");
        unavailable.className = "release-featured__unavailable";
        unavailable.textContent = "Windows installer unavailable";
        actions.appendChild(unavailable);
      }
      actions.appendChild(makeLink(release.notesUrl, "View release notes", "release-featured__notes"));

      content.append(heading, actions);
      featuredRelease.replaceChildren(icon, content);
    };

    const renderHistoryEntry = (release) => {
      const item = document.createElement("li");
      item.className = "release-history__item";
      const details = document.createElement("div");
      details.className = "release-history__details";
      const title = document.createElement("h4");
      title.className = "release-history__version";
      title.textContent = release.title;
      const meta = document.createElement("p");
      meta.className = "release-history__date";
      meta.textContent = `Published ${formatDate(release.date)}`;
      details.append(title, meta, makeStatusBadge(release.preview));

      const actions = document.createElement("div");
      actions.className = "release-history__actions";
      const installer = makeInstallerLink(release);
      if (installer) {
        actions.appendChild(installer);
      } else {
        const unavailable = document.createElement("span");
        unavailable.className = "release-history__unavailable";
        unavailable.textContent = "Windows installer unavailable";
        actions.appendChild(unavailable);
      }
      actions.appendChild(makeLink(release.notesUrl, "Release notes", "release-history__notes"));
      item.append(details, actions);
      return item;
    };

    const showFallbackMessage = (message) => {
      releaseStatus.textContent = message;
      featuredRelease.setAttribute("aria-label", "Known stable Glance release fallback");
      const fallbackLink = $("#release-fallback-link", releasePanel);
      if (fallbackLink && fallbackInstaller) fallbackLink.href = fallbackInstaller;
    };

    const loadReleases = async () => {
      releaseStatus.textContent = "Loading GitHub releases…";
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(releasesEndpoint, {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("GitHub returned an invalid release list");
        if (data.length === 0) {
          showFallbackMessage("No releases were returned by GitHub. Showing the known v0.1.7 download.");
          return;
        }

        const releases = data.map(normalizeRelease).filter(Boolean);
        if (releases.length === 0) throw new Error("GitHub returned no usable release entries");
        renderFeatured(releases[0]);
        releaseHistory.replaceChildren();
        const history = releases.slice(1);
        if (history.length) {
          history.forEach((release) => releaseHistory.appendChild(renderHistoryEntry(release)));
        } else {
          const empty = document.createElement("li");
          empty.className = "release-history__empty";
          empty.textContent = "No previous releases were returned.";
          releaseHistory.appendChild(empty);
        }
        releaseStatus.textContent = `Showing ${releases.length} recent release${releases.length === 1 ? "" : "s"} from GitHub.`;
      } catch {
        showFallbackMessage("GitHub releases could not be loaded. Showing the known v0.1.7 download.");
      } finally {
        window.clearTimeout(timeout);
      }
    };

    loadReleases();
  }

})();
