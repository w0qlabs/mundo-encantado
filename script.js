(function () {
  "use strict";

  var hasGsap = Boolean(window.gsap);
  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var header = document.querySelector(".site-header");
  var balloonController = null;

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

        requestAnimationFrame(function () {
          if (balloonController) {
            balloonController.refresh();
          }
        });

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

  function setupInteractiveBalloons(options) {
    var mode = options.mode;
    var reduceMotion = options.reduceMotion;
    var canHover = options.canHover;
    var layers = [];
    var states = [];
    var delayedCalls = [];
    var pointerFrame = 0;
    var resizeFrame = 0;
    var pointer = { x: -10000, y: -10000 };
    var isCleanedUp = false;

    var balloonConfigs = [
      {
        host: ".hero",
        color: "orange",
        size: { desktop: 58, tablet: 48, mobile: 39 },
        positions: {
          desktop: [{ left: "1.2%", top: "12%" }, { left: "4.5%", top: "62%" }],
          tablet: [{ left: "-1%", top: "56%" }, { left: "3%", top: "72%" }],
          mobile: [{ left: "-18px", top: "48%" }, { left: "-14px", top: "70%" }]
        }
      },
      {
        host: ".hero",
        color: "purple",
        size: { desktop: 72, tablet: 56, mobile: 44 },
        positions: {
          desktop: [{ right: "0.8%", top: "13%" }, { right: "3%", top: "55%" }],
          tablet: [{ right: "-1%", top: "64%" }, { right: "2%", top: "79%" }],
          mobile: null
        }
      },
      {
        host: ".hero",
        color: "yellow",
        foreground: true,
        size: { desktop: 46, tablet: 42, mobile: 36 },
        positions: {
          desktop: [{ left: "80%", top: "3%" }, { right: "43%", top: "7%" }],
          tablet: [{ right: "8%", top: "5%" }, { right: "14%", top: "9%" }],
          mobile: null
        }
      },
      {
        host: ".about",
        color: "pink",
        size: { desktop: 54, tablet: 47, mobile: 38 },
        positions: {
          desktop: [{ right: "2%", top: "14%" }, { right: "5%", top: "61%" }],
          tablet: [{ right: "-1%", top: "18%" }, { right: "2%", top: "66%" }],
          mobile: [{ right: "-18px", top: "8%" }, { right: "-14px", top: "68%" }]
        }
      },
      {
        host: ".catalog",
        color: "teal",
        size: { desktop: 62, tablet: 50, mobile: 38 },
        positions: {
          desktop: [{ left: "1%", top: "8%" }, { left: "3%", top: "76%" }],
          tablet: [{ left: "-1%", top: "5%" }, { left: "1%", top: "72%" }],
          mobile: null
        }
      },
      {
        host: ".process",
        color: "purple",
        size: { desktop: 48, tablet: 44, mobile: 37 },
        positions: {
          desktop: [{ right: "2%", top: "18%" }, { right: "5%", top: "67%" }],
          tablet: null,
          mobile: null
        }
      },
      {
        host: ".latest",
        color: "orange",
        size: { desktop: 66, tablet: 51, mobile: 40 },
        positions: {
          desktop: [{ left: "1.4%", top: "58%" }, { left: "5%", top: "12%" }],
          tablet: [{ right: "-1%", top: "16%" }, { right: "2%", top: "67%" }],
          mobile: [{ right: "-18px", top: "48%" }, { right: "-14px", top: "75%" }]
        }
      }
    ];

    function applyPosition(state, position) {
      ["left", "right", "top", "bottom"].forEach(function (property) {
        state.anchor.style[property] = position[property] || "";
      });
    }

    function refreshPositions() {
      if (isCleanedUp) {
        return;
      }

      var measurements = states.map(function (state) {
        return state.anchor.getBoundingClientRect();
      });

      measurements.forEach(function (rect, index) {
        states[index].centerX = rect.left + window.scrollX + rect.width / 2;
        states[index].centerY = rect.top + window.scrollY + rect.height / 2;
      });
    }

    function createParticles(state) {
      var particleCount = 6;

      for (var index = 0; index < particleCount; index += 1) {
        var particle = document.createElement("span");
        var angle = (Math.PI * 2 * index) / particleCount + gsap.utils.random(-0.22, 0.22);
        var distance = gsap.utils.random(24, 42);

        particle.className = "balloon-particle";
        particle.setAttribute("aria-hidden", "true");
        state.anchor.appendChild(particle);

        gsap.fromTo(particle, {
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
          rotation: gsap.utils.random(-30, 30)
        }, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          scale: 0.2,
          autoAlpha: 0,
          rotation: gsap.utils.random(-100, 100),
          duration: 0.38,
          ease: "power3.out",
          onComplete: function (target) {
            target.remove();
          },
          onCompleteParams: [particle]
        });
      }
    }

    function respawnBalloon(state) {
      if (isCleanedUp) {
        return;
      }

      state.positionIndex = (state.positionIndex + 1) % state.positions.length;
      applyPosition(state, state.positions[state.positionIndex]);

      if (!hasGsap) {
        state.reactor.style.opacity = "1";
        state.reactor.style.transform = "scale(1)";
        state.anchor.style.pointerEvents = "auto";
        state.isPopped = false;
        refreshPositions();
        return;
      }

      gsap.set(state.reactor, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: reduceMotion ? 1 : 0.82,
        autoAlpha: 0
      });
      gsap.to(state.reactor, {
        scale: 1,
        autoAlpha: 1,
        duration: reduceMotion ? 0.14 : 0.46,
        ease: reduceMotion ? "power1.out" : "back.out(1.8)",
        overwrite: "auto",
        onComplete: function () {
          state.anchor.style.pointerEvents = "auto";
          state.isPopped = false;
          refreshPositions();
        }
      });
    }

    function popBalloon(state) {
      if (state.isPopped) {
        return;
      }

      state.isPopped = true;
      state.anchor.style.pointerEvents = "none";

      if (!hasGsap) {
        state.reactor.style.transition = "opacity 140ms ease, transform 140ms ease";
        state.reactor.style.opacity = "0";
        state.reactor.style.transform = "scale(0)";
        window.setTimeout(function () {
          respawnBalloon(state);
        }, 4000);
        return;
      }

      if (state.xTo) {
        state.xTo(0);
        state.yTo(0);
        state.rotationTo(0);
      }

      if (!reduceMotion) {
        createParticles(state);
      }

      var timeline = gsap.timeline({
        onComplete: function () {
          var delayed = gsap.delayedCall(gsap.utils.random(3, 8), function () {
            respawnBalloon(state);
          });
          delayedCalls.push(delayed);
        }
      });

      if (reduceMotion) {
        timeline.to(state.reactor, {
          autoAlpha: 0,
          duration: 0.12,
          ease: "power1.out"
        });
        return;
      }

      timeline
        .to(state.reactor, {
          scale: 0.84,
          duration: 0.08,
          ease: "power2.in"
        })
        .to(state.reactor, {
          scale: 1.12,
          duration: 0.1,
          ease: "back.out(2.6)"
        })
        .to(state.reactor, {
          scale: 0,
          autoAlpha: 0,
          rotation: gsap.utils.random(-12, 12),
          duration: 0.16,
          ease: "power4.in"
        });
    }

    function animateFloat(state) {
      var float = state.float;

      gsap.fromTo(float, {
        y: gsap.utils.random(-18, -9)
      }, {
        y: gsap.utils.random(18, 32),
        duration: gsap.utils.random(3.8, 6.4),
        delay: gsap.utils.random(0, 1.4),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.fromTo(float, {
        x: gsap.utils.random(-12, -6)
      }, {
        x: gsap.utils.random(7, 17),
        duration: gsap.utils.random(4.6, 7),
        delay: gsap.utils.random(0, 1.8),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.fromTo(float, {
        rotation: gsap.utils.random(-6, -2)
      }, {
        rotation: gsap.utils.random(2, 7),
        duration: gsap.utils.random(5, 7.6),
        delay: gsap.utils.random(0, 1.2),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    function resetRepulsion() {
      states.forEach(function (state) {
        if (!state.isInfluenced || state.isPopped) {
          return;
        }

        state.isInfluenced = false;
        state.xTo(0);
        state.yTo(0);
        state.rotationTo(0);
      });
    }

    function updateRepulsion() {
      pointerFrame = 0;
      var radius = mode === "desktop" ? 142 : 118;
      var maxPush = mode === "desktop" ? 22 : 17;

      states.forEach(function (state) {
        if (state.isPopped) {
          return;
        }

        var deltaX = state.centerX - pointer.x;
        var deltaY = state.centerY - pointer.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance >= radius) {
          if (state.isInfluenced) {
            state.isInfluenced = false;
            state.xTo(0);
            state.yTo(0);
            state.rotationTo(0);
          }
          return;
        }

        var safeDistance = Math.max(distance, 1);
        var influence = gsap.utils.clamp(0, 1, 1 - distance / radius);
        var force = influence * influence * maxPush;

        state.isInfluenced = true;
        state.xTo((deltaX / safeDistance) * force);
        state.yTo((deltaY / safeDistance) * force);
        state.rotationTo(gsap.utils.clamp(-6, 6, (deltaX / radius) * 7));
      });
    }

    function handlePointerMove(event) {
      pointer.x = event.pageX;
      pointer.y = event.pageY;

      if (!pointerFrame) {
        pointerFrame = requestAnimationFrame(updateRepulsion);
      }
    }

    function handleResize() {
      if (!resizeFrame) {
        resizeFrame = requestAnimationFrame(function () {
          resizeFrame = 0;
          refreshPositions();
        });
      }
    }

    balloonConfigs.forEach(function (config, index) {
      var positions = config.positions[mode];
      var host = positions ? document.querySelector(config.host) : null;

      if (!host) {
        return;
      }

      var layerRecord = layers.find(function (record) {
        return record.host === host && record.foreground === Boolean(config.foreground);
      });

      if (!layerRecord) {
        var layer = document.createElement("div");
        layer.className = config.foreground ? "balloon-layer balloon-layer-foreground" : "balloon-layer";
        layer.setAttribute("aria-hidden", "true");
        host.classList.add("balloon-host");
        host.appendChild(layer);
        layerRecord = {
          host: host,
          layer: layer,
          foreground: Boolean(config.foreground)
        };
        layers.push(layerRecord);
      }

      var anchor = document.createElement("button");
      var float = document.createElement("span");
      var reactor = document.createElement("span");
      var body = document.createElement("span");
      var knot = document.createElement("span");
      var string = document.createElement("span");

      anchor.type = "button";
      anchor.tabIndex = -1;
      anchor.className = "balloon-anchor";
      anchor.dataset.color = config.color;
      anchor.setAttribute("aria-hidden", "true");
      anchor.style.setProperty("--balloon-size", config.size[mode] + "px");
      float.className = "balloon-float";
      reactor.className = "balloon-reactor";
      body.className = "balloon-body";
      knot.className = "balloon-knot";
      string.className = "balloon-string";

      reactor.appendChild(body);
      reactor.appendChild(knot);
      reactor.appendChild(string);
      float.appendChild(reactor);
      anchor.appendChild(float);
      layerRecord.layer.appendChild(anchor);

      var state = {
        anchor: anchor,
        float: float,
        reactor: reactor,
        positions: positions,
        positionIndex: index % positions.length,
        centerX: 0,
        centerY: 0,
        isInfluenced: false,
        isPopped: false,
        xTo: null,
        yTo: null,
        rotationTo: null
      };

      applyPosition(state, positions[state.positionIndex]);
      anchor.addEventListener("click", function () {
        popBalloon(state);
      });
      states.push(state);

      if (hasGsap && !reduceMotion) {
        state.xTo = gsap.quickTo(reactor, "x", {
          duration: 0.42,
          ease: motion.ease.interaction
        });
        state.yTo = gsap.quickTo(reactor, "y", {
          duration: 0.42,
          ease: motion.ease.interaction
        });
        state.rotationTo = gsap.quickTo(reactor, "rotation", {
          duration: 0.48,
          ease: motion.ease.interaction
        });
        animateFloat(state);
      }
    });

    requestAnimationFrame(refreshPositions);
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("load", refreshPositions, { once: true });

    if (hasGsap && canHover && !reduceMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", resetRepulsion);
    }

    return {
      refresh: refreshPositions,
      cleanup: function () {
        isCleanedUp = true;
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("load", refreshPositions);
        window.removeEventListener("pointermove", handlePointerMove);
        document.documentElement.removeEventListener("mouseleave", resetRepulsion);

        if (pointerFrame) {
          cancelAnimationFrame(pointerFrame);
        }
        if (resizeFrame) {
          cancelAnimationFrame(resizeFrame);
        }

        delayedCalls.forEach(function (call) {
          call.kill();
        });

        states.forEach(function (state) {
          if (hasGsap) {
            gsap.killTweensOf([state.anchor, state.float, state.reactor]);
          }
        });

        layers.forEach(function (record) {
          if (hasGsap) {
            gsap.killTweensOf(record.layer.querySelectorAll("*"));
          }
          record.layer.remove();
          record.host.classList.remove("balloon-host");
        });
      }
    };
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

  if (!hasGsap || !window.ScrollTrigger) {
    balloonController = setupInteractiveBalloons({
      mode: window.innerWidth <= 640 ? "mobile" : window.innerWidth <= 980 ? "tablet" : "desktop",
      canHover: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
      reduceMotion: reduceMotionQuery.matches
    });
    return;
  }

  var media = gsap.matchMedia();
  media.add(
    {
      isDesktop: "(min-width: 981px)",
      isMobile: "(max-width: 980px)",
      isSmallMobile: "(max-width: 640px)",
      canHover: "(hover: hover) and (pointer: fine)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    function (context) {
      var conditions = context.conditions;
      var mode = conditions.isSmallMobile ? "mobile" : conditions.isMobile ? "tablet" : "desktop";
      var balloons = setupInteractiveBalloons({
        mode: mode,
        canHover: conditions.canHover,
        reduceMotion: conditions.reduceMotion
      });

      balloonController = balloons;

      if (conditions.reduceMotion) {
        return function () {
          balloons.cleanup();
          if (balloonController === balloons) {
            balloonController = null;
          }
        };
      }

      var cleanupNav = setupNavIndicator(conditions.canHover);
      setupHeroIntro(conditions.isMobile);
      setupSectionTimelines(conditions.isMobile);

      if (conditions.isDesktop) {
        setupParallax();
      }

      return function () {
        cleanupNav();
        balloons.cleanup();
        if (balloonController === balloons) {
          balloonController = null;
        }
      };
    }
  );

  if (document.readyState === "complete") {
    refreshScrollTriggers();
  } else {
    window.addEventListener("load", refreshScrollTriggers, { once: true });
  }
})();
