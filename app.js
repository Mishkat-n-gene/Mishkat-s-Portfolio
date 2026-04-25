const track = document.getElementById("pages-track");
const pages = Array.from(document.querySelectorAll(".page"));
const dotsWrap = document.getElementById("page-dots");
const toc = document.getElementById("toc");
const progress = document.getElementById("progress");
const arrowUp = document.getElementById("arrow-up");
const arrowDown = document.getElementById("arrow-down");
const modal = document.getElementById("project-modal");
const modalContent = document.getElementById("project-modal-content");

let activeIndex = 0;

const projectItems = Array.from(document.querySelectorAll(".compact-project-item"));
const projectData = projectItems.map((item) => {
  const title = item.querySelector(".compact-project-title")?.textContent?.trim() || "Project";
  const meta = item.querySelector(".compact-project-meta")?.textContent?.trim() || "";
  return {
    title,
    meta,
    summary:
      "Highlights and technical details available on request. This work reflects a blend of computational rigor and applied science.",
    tags: ["Bioinformatics", "Research", "Analysis"],
  };
});

const setActiveIndex = (index) => {
  activeIndex = index;
  updateDots();
  updateToc();
  arrowUp.classList.toggle("hidden", activeIndex === 0);
  arrowDown.classList.toggle("hidden", activeIndex === pages.length - 1);
};

const updateDots = () => {
  const dots = Array.from(dotsWrap.querySelectorAll("button"));
  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === activeIndex);
  });
};

const updateToc = () => {
  const items = Array.from(toc.querySelectorAll("button"));
  items.forEach((item, idx) => {
    item.classList.toggle("active", idx === activeIndex);
  });
};

const scrollToPage = (index) => {
  const page = pages[index];
  if (!page) return;
  page.scrollIntoView({ behavior: "smooth", block: "start" });
};

window.goTo = scrollToPage;

window.openProject = (index) => {
  const data = projectData[index];
  if (!data) return;
  modalContent.innerHTML = `
    <div class="modal-title">${data.title}</div>
    <div class="modal-meta">${data.meta}</div>
    <p>${data.summary}</p>
    <div class="tag-wrap" style="margin-top: 1rem;">
      ${data.tags.map((tag) => `<span class="tag"><span class="tag-dot"></span>${tag}</span>`).join("")}
    </div>
  `;
  modal.classList.add("open");
};

window.closeProject = () => {
  modal.classList.remove("open");
};

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    window.closeProject();
  }
});

const buildDots = () => {
  pages.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "page-dot";
    dot.setAttribute("aria-label", `Go to page ${index + 1}`);
    dot.addEventListener("click", () => scrollToPage(index));
    dotsWrap.appendChild(dot);
  });
};

const buildToc = () => {
  pages.forEach((page, index) => {
    const label =
      page.querySelector(".section-title")?.textContent?.trim() ||
      page.querySelector(".label")?.textContent?.trim() ||
      `Page ${index + 1}`;
    const item = document.createElement("button");
    item.className = "toc-item";
    item.textContent = label;
    item.addEventListener("click", () => scrollToPage(index));
    toc.appendChild(item);
  });
};

const updateProgress = () => {
  const maxScroll = track.scrollHeight - track.clientHeight;
  const ratio = maxScroll > 0 ? track.scrollTop / maxScroll : 0;
  progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
};

const pageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = pages.indexOf(entry.target);
        if (index >= 0) {
          setActiveIndex(index);
        }
      }
    });
  },
  { root: track, threshold: 0.6 }
);

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { root: track, threshold: 0.4 }
);

pages.forEach((page) => {
  pageObserver.observe(page);
  page.querySelectorAll(".fi").forEach((el) => fadeObserver.observe(el));
});

buildDots();
buildToc();
setActiveIndex(0);
updateProgress();

arrowUp.addEventListener("click", () => scrollToPage(activeIndex - 1));
arrowDown.addEventListener("click", () => scrollToPage(activeIndex + 1));

track.addEventListener("scroll", () => {
  updateProgress();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    scrollToPage(activeIndex + 1);
  }
  if (event.key === "ArrowUp") {
    scrollToPage(activeIndex - 1);
  }
  if (event.key === "Escape") {
    window.closeProject();
  }
});
