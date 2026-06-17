// Close mobile menu when a nav link is tapped (not the dropdown parent toggle)
document.querySelectorAll("#navmenu a:not(.dd-toggle)").forEach(function (a) {
  a.addEventListener("click", function () {
    document.body.classList.remove("menu-open");
    var h = document.querySelector(".hamburger");
    if (h) h.setAttribute("aria-expanded", "false");
  });
});

// Package dropdown — hover on desktop (CSS), tap-to-expand accordion on mobile
document.querySelectorAll(".dd-toggle").forEach(function (t) {
  t.addEventListener("click", function (e) {
    e.preventDefault();
    if (window.matchMedia("(max-width:980px)").matches) {
      t.closest(".menu-item").classList.toggle("open");
    }
  });
});

// Foxico autoplay hero slider
(function () {
  var hero = document.getElementById("heroSlider");
  if (!hero) return;
  var slides = [].slice.call(hero.querySelectorAll(".fx-slide"));
  var conts = [].slice.call(hero.querySelectorAll(".fx-cnt"));
  var rail = document.getElementById("fxRail");
  var cards = document.getElementById("fxCards");
  var cur = document.getElementById("fxCur");
  var n = slides.length,
    i = 0,
    timer = null,
    DUR = 2500;
  var pad = function (k) {
    return ("0" + k).slice(-2);
  };
  var stars = function (k) {
    return "★★★★★".slice(0, k);
  };
  document.getElementById("fxTot").textContent = pad(n);

  // graceful fallback if any hero image fails to load
  function guard(im) {
    function fail() {
      im.style.display = "none";
      im.parentNode.style.background =
        "linear-gradient(135deg,#2a5d6b,#0d131e)";
    }
    im.addEventListener("error", fail);
    if (im.complete && im.naturalWidth === 0) fail();
  }
  hero.querySelectorAll(".fx-bg img").forEach(guard);

  // build the left timeline rail
  for (var d = 0; d < n; d++) {
    if (d) {
      var seg = document.createElement("div");
      seg.className = "seg";
      rail.appendChild(seg);
    }
    var dot = document.createElement("div");
    dot.className = "fx-dot";
    dot.textContent = d + 1;
    dot.dataset.i = d;
    dot.addEventListener("click", function () {
      go(parseInt(this.dataset.i, 10));
      start();
    });
    rail.appendChild(dot);
  }
  var dots = [].slice.call(rail.querySelectorAll(".fx-dot"));

  // x-positions (px) for each visible card slot within .fx-cards
  // offset 1 = NEXT (big), offsets 2-4 = smaller cards left to right
  var SLOT_X = [0, 218, 402, 586];
  var OFF_L = -240; // hidden off the left edge
  var OFF_R = 820; // hidden off the right edge

  // Create all n cards once and keep them in the DOM permanently
  var cardEls = [];
  (function () {
    for (var s = 0; s < n; s++) {
      var sl = slides[s];
      var card = document.createElement("button");
      card.className = "fx-card";
      card.innerHTML =
        '<div class="lbl">' +
        sl.dataset.label.toUpperCase() +
        ' <span class="stars">' +
        stars(parseInt(sl.dataset.stars, 10)) +
        "</span></div>" +
        '<div class="pic"><img src="' +
        sl.dataset.card +
        '" alt="' +
        sl.dataset.label +
        '" /></div>';
      (function (idx) {
        card.addEventListener("click", function () {
          go(idx);
          start();
        });
      })(s);
      guard(card.querySelector("img"));
      cards.appendChild(card);
      cardEls.push(card);
    }
  })();

  // Snap every card to its correct position with no animation (used on first render)
  function placeCards() {
    for (var s = 0; s < n; s++) {
      var offset = (s - i + n) % n;
      var x =
        offset === 0
          ? OFF_L
          : offset - 1 < SLOT_X.length
            ? SLOT_X[offset - 1]
            : OFF_R;
      var c = cardEls[s];
      c.style.transition = "none";
      c.style.transform = "translateY(-50%) translateX(" + x + "px)";
      if (offset === 1) c.classList.add("next");
      else c.classList.remove("next");
    }
  }

  // Slide each card individually to its new slot
  function slideCards(dir) {
    // The card that was previously active is now off-screen (at OFF_L or OFF_R).
    // Snap it to the incoming edge so it slides INTO view (not across the screen).
    var oldActiveIdx = (i - (dir > 0 ? 1 : -1) + n) % n;
    var enterFrom = dir > 0 ? OFF_R : OFF_L;
    cardEls[oldActiveIdx].style.transition = "none";
    cardEls[oldActiveIdx].style.transform =
      "translateY(-50%) translateX(" + enterFrom + "px)";

    // Force reflow so the no-transition snap commits before animation starts
    cards.offsetWidth; // eslint-disable-line no-unused-expressions

    // Animate every card to its new position simultaneously
    for (var s = 0; s < n; s++) {
      var offset = (s - i + n) % n;
      var x;
      if (offset === 0)
        x = dir > 0 ? OFF_L : OFF_R; // newly active → exits in travel direction
      else if (offset - 1 < SLOT_X.length)
        x = SLOT_X[offset - 1]; // visible slots
      else x = dir > 0 ? OFF_R : OFF_L; // beyond visible → stays off-screen

      cardEls[s].style.transition = ""; // restore CSS transition
      cardEls[s].style.transform = "translateY(-50%) translateX(" + x + "px)";
      if (offset === 1) cardEls[s].classList.add("next");
      else cardEls[s].classList.remove("next");
    }
  }

  function go(k, instant) {
    var raw = (k - i + n) % n;
    var dir = raw > n / 2 ? raw - n : raw; // normalise to -n/2 … n/2
    i = (k + n) % n;
    slides.forEach(function (s, x) {
      s.classList.toggle("active", x === i);
    });
    conts.forEach(function (c, x) {
      c.classList.toggle("on", x === i);
    });
    dots.forEach(function (dt, x) {
      dt.classList.toggle("active", x === i);
    });
    cur.textContent = pad(i + 1);
    if (instant) placeCards();
    else slideCards(dir);
  }
  function start() {
    stop();
    timer = setInterval(function () {
      go(i + 1);
    }, DUR);
  }
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);

  // Wire prev/next buttons
  document.getElementById("fxPrev").addEventListener("click", function () {
    go(i - 1);
    start();
  });
  document.getElementById("fxNext").addEventListener("click", function () {
    go(i + 1);
    start();
  });

  go(0, true);
  start();
})();

// ========== PACKAGES SLIDER ==========
(function () {
  var grid = document.querySelector(".pkg-grid");
  if (!grid) return;
  var cards = [].slice.call(grid.querySelectorAll(".pkg"));
  var idx = 0;

  function cardWidth() {
    return cards[0].getBoundingClientRect().width + 26;
  }

  function goTo(i, instant) {
    idx = (i + cards.length) % cards.length;
    grid.scrollTo({
      left: idx * cardWidth(),
      behavior: instant ? "auto" : "smooth",
    });
  }

  var arrows = document.querySelectorAll(".arrows .arrow");
  if (arrows[0]) {
    arrows[0].addEventListener("click", function () {
      goTo(idx - 1);
    });
  }
  if (arrows[1]) {
    arrows[1].addEventListener("click", function () {
      goTo(idx + 1);
    });
  }

  window.addEventListener("resize", function () {
    goTo(idx, true);
  });
})();

// ========== LOGOS CAROUSEL (INFINITE SCROLL) ==========
(function () {
  var track = document.getElementById("logoTrack");
  if (!track) return;
  var items = [].slice.call(track.querySelectorAll(".logo-item"));

  // Duplicate items for seamless infinite loop
  items.forEach(function (item) {
    track.appendChild(item.cloneNode(true));
  });
})();

// ========== YOUTUBE MODAL ==========
(function () {
  var modal = document.getElementById("ytModal");
  var frame = document.getElementById("ytFrame");
  var closeBtn = document.getElementById("ytClose");
  var playBtn = document.getElementById("vidPlayBtn");
  if (!modal) return;

  function openModal() {
    var videoId = playBtn.dataset.video;
    frame.src =
      "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    frame.src = "";
    document.body.style.overflow = "";
  }

  if (playBtn) {
    playBtn.addEventListener("click", openModal);
    playBtn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") openModal();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
})();

// ========== TESTIMONIALS CAROUSEL ==========
(function () {
  var testimonials = [
    {
      quote:
        "Assalamu Alaikum. I am MD Mokarrom Hossain, currently serving as Head of Treasury at Crown Cement Limited.\n\nI have known Discover Holidays Limited for a long time and had been planning to take their services. Recently, we traveled to Sri Lanka with a large team, and the entire package was arranged by Discover Holidays.",
      name: "MD. Mokarrom Hossain, CMA (AUS)",
      title: "Director, HR & OD · T.K. Group",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80",
    },
    {
      quote:
        "Excellent service from start to finish. The team handled our visa, air tickets and hotel bookings flawlessly — a truly stress-free experience for our family.",
      name: "Tanvir Ahmed",
      title: "Senior Manager · BRAC",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    },
    {
      quote:
        "We booked a group Umrah package and everything was perfectly organized — accommodation, transport and guidance. Highly recommended for peace of mind.",
      name: "Rezaul Karim",
      title: "Director · Square Group",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    },
    {
      quote:
        "Our corporate retreat to Thailand was seamless from start to finish. Professional, responsive and great value — we'll travel with them again.",
      name: "Sadia Islam",
      title: "HR Lead · Robi Axiata",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
    },
  ];
  var idx = 0;
  var mainTxt = document.getElementById("featMain");
  var prevBtn = document.getElementById("featPrev");
  var nextBtn = document.getElementById("featNext");
  if (!mainTxt || !prevBtn || !nextBtn) return;

  function updateTestimonial(i) {
    idx = (i + testimonials.length) % testimonials.length;
    var t = testimonials[idx];
    mainTxt.style.opacity = "0";
    setTimeout(function () {
      mainTxt.innerHTML =
        '<div class="quote">"</div>' +
        "<p>" +
        t.quote.split("\n\n")[0] +
        "</p>" +
        (t.quote.split("\n\n")[1]
          ? "<p>" + t.quote.split("\n\n")[1] + "</p>"
          : "") +
        '<div class="who"><div class="av"><img src="' +
        t.avatar +
        '" alt="" onerror="this.style.display=\'none\'" /></div>' +
        "<div><b>" +
        t.name +
        "</b><small>" +
        t.title +
        "</small></div></div>";
      mainTxt.style.opacity = "1";
    }, 200);
  }

  prevBtn.addEventListener("click", function () {
    updateTestimonial(idx - 1);
  });
  nextBtn.addEventListener("click", function () {
    updateTestimonial(idx + 1);
  });
})();

// ========== MOBILE MENU (hamburger toggle) ==========
(function () {
  document.querySelectorAll(".hamburger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
      btn.setAttribute(
        "aria-expanded",
        document.body.classList.contains("menu-open"),
      );
    });
  });
})();

// ========== DATE INPUTS (text → native date picker on focus) ==========
(function () {
  document.querySelectorAll(".js-date").forEach(function (inp) {
    inp.addEventListener("focus", function () {
      inp.type = "date";
    });
    inp.addEventListener("blur", function () {
      if (!inp.value) inp.type = "text";
    });
  });
})();

// ========== IMAGE PLACEHOLDER FALLBACK ==========
// Markup hooks (replace old inline onerror handlers):
//   data-ph="Label"   -> on load failure, parent gets .ph + data-l="Label"
//   data-ph-bg="..."  -> on load failure, parent background is set to the value
(function () {
  function applyPh(img) {
    if (img.dataset.phDone) return;
    img.dataset.phDone = "1";
    var p = img.parentNode;
    if (img.dataset.phBg !== undefined) {
      if (p) p.style.background = img.dataset.phBg;
      img.style.display = "none";
      return;
    }
    if (p) {
      p.classList.add("ph");
      if (img.dataset.ph) p.dataset.l = img.dataset.ph;
    }
    img.style.display = "none";
  }
  // Catch errors that fire after this script runs (error doesn't bubble → capture)
  document.addEventListener(
    "error",
    function (e) {
      var t = e.target;
      if (t && t.tagName === "IMG") {
        if (t.hasAttribute("data-hide-on-error")) {
          t.style.display = "none";
        } else if (t.dataset.ph !== undefined || t.dataset.phBg !== undefined) {
          applyPh(t);
        }
      }
    },
    true,
  );
  // Catch images that already failed before this script ran
  function scan() {
    document
      .querySelectorAll("img[data-ph], img[data-ph-bg]")
      .forEach(function (img) {
        if (img.complete && img.naturalWidth === 0) applyPh(img);
      });
    document
      .querySelectorAll("img[data-hide-on-error]")
      .forEach(function (img) {
        if (img.complete && img.naturalWidth === 0) img.style.display = "none";
      });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }
})();

// ========== UMRAH PAGE — package cards + duration filter ==========
(function () {
  var grid = document.getElementById("umrahGrid");
  if (!grid) return;

  var packages = [
    {
      dur: "7",
      badge: "Best Seller",
      title: "Umrah After Hajj, 2026",
      loc: "মক্কা মুকাররমা",
      days: "৭ দিন · ৬ রাত",
      pax: "২–৩০ জন",
      hotel: "৪★ হোটেল",
      rating: "4.8",
      reviews: "214",
      old: "৳১,২০,০০০",
      now: "১,৪৫,০০০",
      img: "assets/images/umrah.jpeg",
    },
    {
      dur: "10",
      badge: "Group Favourite",
      title: "Short Umrah Package, July 2026",
      loc: "মক্কা ও মদিনা",
      days: "১০ দিন · ৯ রাত",
      pax: "২–৪০ জন",
      hotel: "৫★ হোটেল",
      rating: "4.9",
      reviews: "318",
      old: "৳১,৪০,০০০",
      now: "১,১২,০০০",
      img: "uploads/hajj-reg-img.png",
    },
    {
      dur: "15",
      badge: "Best Seller",
      title: "Umrah After Hajj, 2026",
      loc: "মক্কা ও মদিনা",
      days: "১৫ দিন · ১৪ রাত",
      pax: "২–৫০ জন",
      hotel: "৫★ হোটেল",
      rating: "4.9",
      reviews: "196",
      old: "৳১,৮০,০০০",
      now: "১,৪৯,০০০",
      img: "assets/images/umrah.jpeg",
    },
    {
      dur: "7",
      badge: "Best Seller",
      title: "Umrah After Hajj, 2026",
      loc: "মক্কা মুকাররমা",
      days: "৭ দিন · ৬ রাত",
      pax: "২–৩০ জন",
      hotel: "৪★ হোটেল",
      rating: "4.8",
      reviews: "178",
      old: "৳১,২০,০০০",
      now: "৯৯,০০০",
      img: "uploads/hajj-reg-img.png",
    },
    {
      dur: "10",
      badge: "Group Favourite",
      title: "Short Umrah Package, July 2026",
      loc: "মক্কা ও মদিনা",
      days: "১০ দিন · ৯ রাত",
      pax: "২–৪০ জন",
      hotel: "৫★ হোটেল",
      rating: "4.9",
      reviews: "256",
      old: "৳১,৪০,০০০",
      now: "১,১২,০০০",
      img: "assets/images/umrah.jpeg",
    },
    {
      dur: "custom",
      badge: "Customized",
      title: "Umrah After Hajj, 2026",
      loc: "মক্কা ও মদিনা",
      days: "১৫ দিন · ১৪ রাত",
      pax: "২–৬০ জন",
      hotel: "৫★ হোটেল",
      rating: "4.9",
      reviews: "142",
      old: "৳১,৮০,০০০",
      now: "১,৪৯,০০০",
      img: "uploads/hajj-reg-img.png",
    },
  ];

  var heartSVG =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  var pinSVG =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';
  var clkSVG =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var paxSVG =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><path d="M2 20c0-3 3.5-5 7-5s7 2 7 5"/><circle cx="17" cy="8" r="2.5"/></svg>';
  var bedSVG =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M4 12V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5M4 12v6M20 12v6"/></svg>';
  var arrSVG =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function buildCard(p) {
    return (
      '<article class="pkg" data-dur="' +
      p.dur +
      '">' +
      '<div class="top"><img src="' +
      p.img +
      '" alt="' +
      p.title +
      '" data-ph="' +
      p.title +
      '" />' +
      '<span class="tag">' +
      p.badge +
      '</span><span class="fav">' +
      heartSVG +
      "</span></div>" +
      '<div class="body">' +
      '<div class="loc">' +
      pinSVG +
      p.loc +
      "</div>" +
      "<h3>" +
      p.title +
      "</h3>" +
      '<div class="meta"><span>' +
      clkSVG +
      p.days +
      "</span><span>" +
      paxSVG +
      p.pax +
      "</span><span>" +
      bedSVG +
      p.hotel +
      "</span></div>" +
      '<div class="rate"><span class="star">★</span><b>' +
      p.rating +
      "</b> (" +
      p.reviews +
      " reviews)</div>" +
      '<div class="sep"></div>' +
      '<div class="foot"><div class="price"><s>' +
      p.old +
      '</s> from<div class="now"><span class="tk">৳</span>' +
      p.now +
      "</div></div>" +
      '<a class="vp" href="#">View package ' +
      arrSVG +
      "</a></div>" +
      "</div></article>"
    );
  }

  grid.innerHTML = packages.map(buildCard).join("");

  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var f = btn.dataset.filter;
      grid.querySelectorAll(".pkg").forEach(function (card) {
        if (f === "all" || card.dataset.dur === f) {
          card.classList.remove("u-hidden");
        } else {
          card.classList.add("u-hidden");
        }
      });
    });
  });
})();

// ========== DESTINATION PAGE — region filter ==========
(function () {
  var cards = document.querySelectorAll(".dest-card");
  if (!cards.length) return;
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var r = btn.dataset.region;
      cards.forEach(function (card) {
        if (r === "all" || card.dataset.region === r) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });
})();

// ========== HAJJ PAGE — file upload + track demo ==========
(function () {
  var upInput = document.getElementById("upInput");
  if (upInput) {
    var upName = document.getElementById("upName");
    var upBrowse = document.getElementById("upBrowse");
    if (upBrowse) {
      upBrowse.addEventListener("click", function () {
        upInput.click();
      });
    }
    upInput.addEventListener("change", function () {
      if (upInput.files && upInput.files.length) {
        upName.textContent = upInput.files[0].name;
        upName.classList.add("has-file");
      } else {
        upName.textContent = "Upload";
        upName.classList.remove("has-file");
      }
    });
  }

  var trackBtn = document.getElementById("trackBtn");
  var trackBox = document.getElementById("trackBox");
  if (trackBtn && trackBox) {
    trackBtn.addEventListener("click", function () {
      trackBox.style.boxShadow = "0 0 0 2px rgba(237,28,36,0.25)";
      setTimeout(function () {
        trackBox.style.boxShadow = "";
      }, 700);
    });
  }
})();
