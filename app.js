/**
 * job-hunt — client for data/shortlist.json
 * Vanilla JS, no build step.
 */
(function () {
  "use strict";

  var DATA_URL = "data/shortlist.json";

  var els = {
    found: document.getElementById("stat-found"),
    filtered: document.getElementById("stat-filtered"),
    shortlisted: document.getElementById("stat-shortlisted"),
    scanDate: document.getElementById("stat-scan-date"),
    search: document.getElementById("search-input"),
    jobList: document.getElementById("job-list"),
    empty: document.getElementById("empty-state"),
    footerScan: document.getElementById("footer-scan"),
    target: document.getElementById("target-line"),
    filterBtns: document.querySelectorAll("[data-priority]"),
  };

  var allJobs = [];
  var priorityFilter = "all";
  var searchQuery = "";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(n) {
    var num = Number(n);
    if (!isFinite(num)) return "—";
    return num.toLocaleString("en-US");
  }

  function setText(el, text) {
    if (el) el.textContent = text == null ? "" : String(text);
  }

  function safeHref(url) {
    try {
      var u = new URL(String(url), window.location.href);
      if (u.protocol === "https:" || u.protocol === "http:") {
        return u.href;
      }
    } catch (_) {
      /* ignore */
    }
    return null;
  }

  function populateMeta(data) {
    var funnel = data.funnel || {};
    setText(els.found, formatNumber(funnel.found));
    setText(els.filtered, formatNumber(funnel.filtered));
    setText(els.shortlisted, formatNumber(funnel.shortlisted));
    setText(els.scanDate, data.scan_date || "—");
    setText(els.footerScan, data.scan_date || "—");

    if (els.target && data.target) {
      setText(els.target, data.target);
      els.target.hidden = false;
    }
  }

  function matchesJob(job) {
    if (priorityFilter !== "all" && job.priority !== priorityFilter) {
      return false;
    }
    if (!searchQuery) return true;
    var hay = [job.company, job.title, job.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.indexOf(searchQuery) !== -1;
  }

  function renderApplyLinks(urls) {
    var list = Array.isArray(urls) ? urls : [];
    var parts = [];
    for (var i = 0; i < list.length; i++) {
      var href = safeHref(list[i]);
      if (!href) continue;
      var label = list.length > 1 ? "Apply " + (i + 1) : "Apply";
      parts.push(
        '<a class="cta job-card__apply" href="' +
          escapeHtml(href) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(label) +
          "</a>"
      );
    }
    return parts.join(" ");
  }

  function renderJobCard(job, index) {
    var priority = job.priority === "B" ? "B" : "A";
    var badgeClass = priority === "A" ? "badge badge--a" : "badge badge--b";
    var noteHtml = "";
    if (job.note) {
      noteHtml =
        '<p class="job-card__meta job-card__note">' +
        escapeHtml(job.note) +
        "</p>";
    }

    return (
      '<li class="job-card" style="--i: ' +
      index +
      '" data-id="' +
      escapeHtml(job.id || "") +
      '">' +
      '<div class="job-card__top">' +
      '<span class="' +
      badgeClass +
      '">Priority ' +
      escapeHtml(priority) +
      "</span>" +
      "</div>" +
      '<h3 class="job-card__title">' +
      escapeHtml(job.title) +
      "</h3>" +
      '<p class="job-card__company">' +
      escapeHtml(job.company) +
      "</p>" +
      '<p class="job-card__meta">' +
      escapeHtml(job.location || "") +
      "</p>" +
      noteHtml +
      '<div class="job-card__actions">' +
      renderApplyLinks(job.urls) +
      "</div>" +
      "</li>"
    );
  }

  function render() {
    if (!els.jobList) return;

    var matched = allJobs.filter(matchesJob);
    els.jobList.innerHTML = matched
      .map(function (job, i) {
        return renderJobCard(job, i);
      })
      .join("");

    if (els.empty) {
      els.empty.hidden = matched.length > 0;
    }
  }

  function setPriorityFilter(value) {
    priorityFilter = value || "all";
    els.filterBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-priority") === priorityFilter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    render();
  }

  function bindControls() {
    els.filterBtns.forEach(function (btn) {
      btn.setAttribute(
        "aria-pressed",
        btn.classList.contains("is-active") ? "true" : "false"
      );
      btn.addEventListener("click", function () {
        setPriorityFilter(btn.getAttribute("data-priority") || "all");
      });
    });

    if (els.search) {
      els.search.addEventListener("input", function () {
        searchQuery = (els.search.value || "").trim().toLowerCase();
        render();
      });
    }
  }

  function showLoadError(message) {
    setText(els.found, "—");
    setText(els.filtered, "—");
    setText(els.shortlisted, "—");
    setText(els.scanDate, "—");
    setText(els.footerScan, "—");
    if (els.jobList) els.jobList.innerHTML = "";
    if (els.empty) {
      els.empty.hidden = false;
      var title = els.empty.querySelector(".empty-title");
      var copy = els.empty.querySelector(".empty-copy");
      if (title) title.textContent = "Could not load shortlist";
      if (copy) copy.textContent = message;
    }
  }

  function init() {
    bindControls();

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status + " loading " + DATA_URL);
        }
        return res.json();
      })
      .then(function (data) {
        populateMeta(data);
        allJobs = Array.isArray(data.jobs) ? data.jobs : [];
        render();
      })
      .catch(function (err) {
        console.error(err);
        showLoadError(
          "Run the build script to generate data/shortlist.json, then refresh."
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
