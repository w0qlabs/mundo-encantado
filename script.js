(function () {
  "use strict";

  var hasGsap = Boolean(window.gsap);
  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var header = document.querySelector(".site-header");

  var motion = {
    duration: {
      micro: 0.24,
      panel: 0.48,
      text: 0.68,
      reveal: 0.88,
      hero: 1.08
    },
    ease: {
      interaction: "power3.out",
      text: "power4.out",
      reveal: "power3.out",
      smooth: "expo.out"
    }
  };

  document.documentElement.dataset.gsapReady = hasGsap ? "true" : "false";

  function setupMobileNavigation() {
    var button = document.querySelector(".menu-toggle");
    var navigation = document.getElementById("mobile-nav");

    if (!button || !navigation) {
      return;
    }

    function closeMenu() {
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Abrir menu");
      navigation.hidden = true;
    }

    button.addEventListener("click", function () {
      var shouldOpen = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(shouldOpen));
      button.setAttribute("aria-label", shouldOpen ? "Fechar menu" : "Abrir menu");
      navigation.hidden = !shouldOpen;
    });

    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    }, true);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
        button.focus();
      }
    });

    var desktopQuery = window.matchMedia("(min-width: 981px)");
    var handleDesktopChange = function (event) {
      if (event.matches) {
        closeMenu();
      }
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", handleDesktopChange);
    } else {
      desktopQuery.addListener(handleDesktopChange);
    }
  }

  function setupTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".category-tab"));
    var panels = Array.prototype.slice.call(document.querySelectorAll(".category-panel"));

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        var panel = document.getElementById("panel-" + target);

        if (!panel || tab.classList.contains("is-active")) {
          return;
        }

        tabs.forEach(function (item) {
          item.classList.remove("is-active");
          item.setAttribute("aria-selected", "false");
        });

        panels.forEach(function (item) {
          item.classList.remove("is-active");
        });

        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        panel.classList.add("is-active");

        if (!hasGsap || reduceMotionQuery.matches) {
          return;
        }

        var media = panel.querySelector(".panel-media");
        var content = panel.querySelectorAll(".panel-content > *");
        var animatedItems = [media].concat(Array.prototype.slice.call(content));
        gsap.killTweensOf(animatedItems);

        gsap.timeline()
          .fromTo(
            media,
            { autoAlpha: 0, scale: 1.018 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: motion.duration.panel + 0.12,
              ease: motion.ease.smooth,
              overwrite: "auto"
            }
          )
          .fromTo(
            content,
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              duration: motion.duration.panel,
              ease: motion.ease.reveal,
              stagger: 0.055,
              overwrite: "auto"
            },
            "-=0.4"
          );
      });
    });
  }

  function setupFaqCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".faq-list details"));

    cards.forEach(function (card) {
      var summary = card.querySelector("summary");
      var answer = card.querySelector(".faq-answer");

      if (!summary || !answer) {
        return;
      }

      if (hasGsap && !reduceMotionQuery.matches) {
        gsap.set(answer, {
          height: card.open ? "auto" : 0,
          autoAlpha: card.open ? 1 : 0
        });
      }

      summary.addEventListener("click", function (event) {
        if (!hasGsap || reduceMotionQuery.matches) {
          return;
        }

        event.preventDefault();
        gsap.killTweensOf([card, answer]);

        if (card.open) {
          gsap.set(answer, { height: answer.offsetHeight, autoAlpha: 1 });
          gsap.to(answer, {
            height: 0,
            autoAlpha: 0,
            duration: motion.duration.panel,
            ease: motion.ease.interaction,
            overwrite: "auto",
            onComplete: function () {
              card.open = false;
              gsap.set(answer, { height: 0 });
              refreshScrollTriggers();
            }
          });
          return;
        }

        card.open = true;
        gsap.set(answer, { height: 0, autoAlpha: 0 });

        gsap.timeline({
          onComplete: function () {
            gsap.set(answer, { height: "auto" });
            refreshScrollTriggers();
          }
        })
          .to(answer, {
            height: answer.scrollHeight,
            autoAlpha: 1,
            duration: motion.duration.panel,
            ease: motion.ease.smooth,
            overwrite: "auto"
          })
          .fromTo(card, {
            y: 4,
            scale: 0.992
          }, {
            y: 0,
            scale: 1,
            duration: motion.duration.micro,
            ease: motion.ease.interaction,
            overwrite: "auto"
          }, 0);
      });
    });
  }

  function setupSmoothNavigation() {
    var internalLinks = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

    internalLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var hash = link.getAttribute("href");
        var target = hash && hash.length > 1 ? document.querySelector(hash) : null;

        if (!target) {
          return;
        }

        event.preventDefault();

        if (window.location.hash !== hash) {
          window.history.pushState(null, "", hash);
        }

        if (!hasGsap || !window.ScrollToPlugin || reduceMotionQuery.matches) {
          target.scrollIntoView({ block: "start" });
          return;
        }

        var headerOffset = (header ? header.offsetHeight : 0) + 10;
        var targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        var distance = Math.abs(window.scrollY - targetY);
        var duration = gsap.utils.clamp(0.46, 0.92, distance / 1600);

        gsap.killTweensOf(window);
        gsap.to(window, {
          duration: duration,
          ease: motion.ease.smooth,
          overwrite: "auto",
          scrollTo: {
            y: target,
            offsetY: headerOffset,
            autoKill: true
          }
        });
      });
    });
  }

  function setupNavIndicator(canHover) {
    var nav = document.querySelector(".site-nav");
    if (!nav || reduceMotionQuery.matches) {
      return function () {};
    }

    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var indicator = document.createElement("span");
    var currentLink = links[0];
    var hoverHandlers = [];

    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    nav.appendChild(indicator);

    var xTo = gsap.quickTo(indicator, "x", {
      duration: 0.34,
      ease: motion.ease.interaction
    });
    var scaleTo = gsap.quickTo(indicator, "scaleX", {
      duration: 0.34,
      ease: motion.ease.interaction
    });

    function moveIndicator(link, immediate) {
      if (!link) {
        return;
      }

      var navRect = nav.getBoundingClientRect();
      var linkRect = link.getBoundingClientRect();
      var x = linkRect.left - navRect.left;

      if (immediate) {
        gsap.set(indicator, { x: x, scaleX: linkRect.width, autoAlpha: 1 });
        return;
      }

      xTo(x);
      scaleTo(linkRect.width);
      gsap.to(indicator, {
        autoAlpha: 1,
        duration: motion.duration.micro,
        overwrite: "auto"
      });
    }

    function setCurrent(link) {
      currentLink = link;
      links.forEach(function (item) {
        var isCurrent = item === link;
        item.classList.toggle("is-current", isCurrent);
        if (isCurrent) {
          item.setAttribute("aria-current", "page");
        } else {
          item.removeAttribute("aria-current");
        }
      });
      moveIndicator(link, false);
    }

    links.forEach(function (link, index) {
      var target = document.querySelector(link.getAttribute("href"));
      if (!target) {
        return;
      }

      ScrollTrigger.create({
        id: "nav-section-" + index,
        trigger: target,
        start: index === 0 ? "top top" : "clamp(top 45%)",
        onEnter: function () {
          setCurrent(link);
        },
        onEnterBack: function () {
          setCurrent(link);
        }
      });

      if (canHover) {
        var enter = function () {
          moveIndicator(link, false);
        };
        var leave = function () {
          moveIndicator(currentLink, false);
        };

        link.addEventListener("mouseenter", enter);
        link.addEventListener("mouseleave", leave);
        hoverHandlers.push({ link: link, enter: enter, leave: leave });
      }
    });

    function handleResize() {
      moveIndicator(currentLink, true);
    }

    setCurrent(currentLink);
    requestAnimationFrame(function () {
      moveIndicator(currentLink, true);
    });
    window.addEventListener("resize", handleResize, { passive: true });

    return function () {
      window.removeEventListener("resize", handleResize);
      hoverHandlers.forEach(function (handlers) {
        handlers.link.removeEventListener("mouseenter", handlers.enter);
        handlers.link.removeEventListener("mouseleave", handlers.leave);
      });
      links.forEach(function (link) {
        link.classList.remove("is-current");
        link.removeAttribute("aria-current");
      });
      indicator.remove();
    };
  }

  function createRevealTimeline(trigger, start) {
    return gsap.timeline({
      defaults: {
        duration: motion.duration.reveal,
        ease: motion.ease.reveal
      },
      scrollTrigger: {
        trigger: trigger,
        start: start || "top 78%",
        once: true
      }
    });
  }

  function addHeadingSequence(timeline, root, position) {
    var kicker = root.querySelector(".section-kicker");
    var title = root.querySelector("h2");
    var description = root.querySelector(".section-head > p:last-child");

    timeline
      .from(kicker, { autoAlpha: 0, y: 18, duration: 0.5 }, position)
      .from(title, {
        autoAlpha: 0,
        y: 44,
        duration: motion.duration.reveal,
        ease: motion.ease.text
      }, "-=0.34");

    if (description) {
      timeline.from(description, {
        autoAlpha: 0,
        y: 22,
        duration: motion.duration.text
      }, "-=0.5");
    }

    return timeline;
  }

  function setupSectionTimelines(isMobile) {
    var trustTimeline = createRevealTimeline(".trust-strip", "top 86%");
    trustTimeline.from(".trust-grid article", {
      autoAlpha: 0,
      y: isMobile ? 24 : 34,
      duration: 0.68,
      stagger: isMobile ? 0.07 : 0.1,
      ease: motion.ease.reveal
    });

    var about = document.querySelector(".about");
    var aboutTimeline = createRevealTimeline(about);
    aboutTimeline
      .from(about.querySelector(".section-kicker"), { autoAlpha: 0, y: 18, duration: 0.5 })
      .from(about.querySelector("h2"), {
        autoAlpha: 0,
        y: 46,
        duration: motion.duration.reveal,
        ease: motion.ease.text
      }, "-=0.34")
      .from(about.querySelectorAll(".about-copy p"), {
        autoAlpha: 0,
        x: isMobile ? 0 : 26,
        y: isMobile ? 22 : 0,
        duration: motion.duration.text,
        stagger: 0.1
      }, "-=0.5");

    var catalog = document.querySelector(".catalog");
    var catalogTimeline = createRevealTimeline(catalog, "top 76%");
    addHeadingSequence(catalogTimeline, catalog, 0)
      .from(".category-tabs", {
        autoAlpha: 0,
        y: 20,
        duration: 0.62
      }, "-=0.42")
      .from(".category-panel.is-active .panel-layout", {
        autoAlpha: 0,
        y: 38,
        scale: 0.985,
        duration: 0.9,
        ease: motion.ease.smooth
      }, "-=0.38");

    var process = document.querySelector(".process");
    var processTimeline = createRevealTimeline(process);
    addHeadingSequence(processTimeline, process, 0)
      .from(".steps article", {
        autoAlpha: 0,
        y: 42,
        scale: 0.985,
        duration: 0.78,
        stagger: isMobile ? 0.07 : 0.1
      }, "-=0.4");

    var latest = document.querySelector(".latest");
    var latestTimeline = createRevealTimeline(latest);
    latestTimeline
      .from(latest.querySelector(".section-kicker"), { autoAlpha: 0, y: 18, duration: 0.5 })
      .from(latest.querySelector("h2"), {
        autoAlpha: 0,
        y: 46,
        duration: motion.duration.reveal,
        ease: motion.ease.text
      }, "-=0.34")
      .from(latest.querySelector(".latest-copy > p:last-child"), {
        autoAlpha: 0,
        y: 22,
        duration: motion.duration.text
      }, "-=0.48")
      .from(latest.querySelector(".latest-photo"), {
        autoAlpha: 0,
        x: isMobile ? 0 : 34,
        y: isMobile ? 34 : 0,
        scale: 0.985,
        duration: 0.94,
        ease: motion.ease.smooth
      }, isMobile ? "-=0.34" : "<0.12");

    var faq = document.querySelector(".faq");
    var faqTimeline = createRevealTimeline(faq);
    faqTimeline
      .from(faq.querySelector(".section-kicker"), { autoAlpha: 0, y: 18, duration: 0.5 })
      .from(faq.querySelector("h2"), {
        autoAlpha: 0,
        y: 44,
        duration: motion.duration.reveal,
        ease: motion.ease.text
      }, "-=0.34")
      .from(faq.querySelectorAll("details"), {
        autoAlpha: 0,
        y: 26,
        duration: 0.64,
        stagger: 0.075
      }, "-=0.44");

    var contact = document.querySelector(".contact-band");
    var contactTimeline = createRevealTimeline(contact, "top 82%");
    contactTimeline
      .from(contact.querySelector(".section-kicker"), { autoAlpha: 0, y: 16, duration: 0.48 })
      .from(contact.querySelector("h2"), {
        autoAlpha: 0,
        y: 42,
        duration: motion.duration.reveal,
        ease: motion.ease.text
      }, "-=0.32")
      .from(contact.querySelector(".contact-grid > div:first-child > p:last-child"), {
        autoAlpha: 0,
        y: 20,
        duration: motion.duration.text
      }, "-=0.48")
      .from(contact.querySelectorAll(".whats-link"), {
        autoAlpha: 0,
        y: 24,
        duration: 0.62,
        stagger: 0.08
      }, "-=0.38")
      .from(contact.querySelector("address"), {
        autoAlpha: 0,
        y: 18,
        duration: 0.58
      }, "-=0.42");
  }

  function setupHeroIntro(isMobile) {
    gsap.set(".title-forever", { "--underline-scale": 0 });

    var navigationTargets = isMobile ? ".header-action" : ".site-nav a, .header-action";
    var timeline = gsap.timeline({
      defaults: { ease: motion.ease.reveal }
    });

    timeline
      .from(".brand", { autoAlpha: 0, y: -12, duration: 0.46 })
      .from(navigationTargets, {
        autoAlpha: 0,
        y: -10,
        duration: 0.42,
        stagger: 0.045
      }, "<0.08")
      .from(".hero .eyebrow", { autoAlpha: 0, y: 20, duration: 0.52 }, "-=0.18")
      .from(".hero h1", {
        autoAlpha: 0,
        y: isMobile ? 36 : 52,
        clipPath: "inset(0 0 18% 0)",
        duration: isMobile ? 0.88 : motion.duration.hero,
        ease: motion.ease.text
      }, "-=0.24")
      .from(".hero-text", {
        autoAlpha: 0,
        y: 26,
        duration: motion.duration.text
      }, "-=0.58")
      .from(".hero-actions .btn", {
        autoAlpha: 0,
        y: 18,
        duration: 0.54,
        stagger: 0.08
      }, "-=0.42")
      .from(".hero-showcase", {
        autoAlpha: 0,
        x: isMobile ? 0 : 34,
        y: isMobile ? 28 : 18,
        scale: 0.985,
        rotation: -1.2,
        duration: isMobile ? 0.88 : 1.16,
        ease: motion.ease.smooth
      }, 0.3)
      .from(".birthday-seal", {
        autoAlpha: 0,
        scale: 0.82,
        rotation: -12,
        duration: 0.68,
        ease: motion.ease.smooth
      }, "-=0.56")
      .from(".doodle", {
        autoAlpha: 0,
        scale: 0.78,
        duration: 0.48,
        stagger: 0.07
      }, "-=0.46")
      .to(".title-forever", {
        "--underline-scale": 1,
        duration: 0.64,
        ease: motion.ease.smooth
      }, "-=0.56");
  }

  function setupParallax() {
    gsap.to(".hero-showcase img", {
      yPercent: 3,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.fromTo(
      ".latest-photo img",
      { yPercent: -2, scale: 1.035 },
      {
        yPercent: 2,
        scale: 1.035,
        ease: "none",
        scrollTrigger: {
          trigger: ".latest",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );
  }

  function refreshScrollTriggers() {
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  if (hasGsap) {
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
    if (window.ScrollToPlugin) {
      gsap.registerPlugin(ScrollToPlugin);
    }
  }

  setupTabs();
  setupFaqCards();
  setupSmoothNavigation();
  setupMobileNavigation();

  if (!hasGsap || !window.ScrollTrigger) {
    return;
  }

  var media = gsap.matchMedia();
  media.add(
    {
      isDesktop: "(min-width: 981px)",
      isMobile: "(max-width: 980px)",
      canHover: "(hover: hover) and (pointer: fine)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    function (context) {
      var conditions = context.conditions;

      if (conditions.reduceMotion) {
        return;
      }

      var cleanupNav = setupNavIndicator(conditions.canHover);
      setupHeroIntro(conditions.isMobile);
      setupSectionTimelines(conditions.isMobile);

      if (conditions.isDesktop) {
        setupParallax();
      }

      return function () {
        cleanupNav();
      };
    }
  );

  if (document.readyState === "complete") {
    refreshScrollTriggers();
  } else {
    window.addEventListener("load", refreshScrollTriggers, { once: true });
  }
})();
