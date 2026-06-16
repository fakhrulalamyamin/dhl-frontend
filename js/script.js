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

  // render the upcoming-slide cards (active slide is the big background, so excluded)
  function renderCards() {
    cards.innerHTML = "";
    for (var k = 1; k < n; k++) {
      var s = slides[(i + k) % n];
      var card = document.createElement("button");
      card.className = "fx-card" + (k === 1 ? " next" : "");
      card.dataset.i = (i + k) % n;
      card.innerHTML =
        '<div class="lbl">' +
        s.dataset.label.toUpperCase() +
        ' <span class="stars">' +
        stars(parseInt(s.dataset.stars, 10)) +
        "</span></div>" +
        '<div class="pic"><img src="' +
        s.dataset.card +
        '" alt="' +
        s.dataset.label +
        '" /></div>';
      card.addEventListener("click", function () {
        go(parseInt(this.dataset.i, 10));
        start();
      });
      guard(card.querySelector("img"));
      cards.appendChild(card);
    }
  }

  function go(k) {
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
    renderCards();
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

  go(0);
  start();
})();

// ========== PACKAGES SLIDER ==========
(function () {
  var grid = document.querySelector(".pkg-grid");
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
  if (!modal || !playBtn) return;

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

  playBtn.addEventListener("click", openModal);
  playBtn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") openModal();
  });
  closeBtn.addEventListener("click", closeModal);
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
