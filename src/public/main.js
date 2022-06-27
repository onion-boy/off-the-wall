const query = document.querySelector.bind(document);
const all = document.querySelectorAll.bind(document);

let loadCount = 0;

function handleRewind() {
  window.addEventListener("popstate", () => {
    console.log('hi');
    navigate(location.pathname, true);
  });
}

function loadPage(path) {
  return new Promise((resolve, reject) => {
    fetch("/load" + path)
      .then((response) => response.text())
      .then((html) => {
        loadCount++;
        query("#container").innerHTML = html;
        resolve();
      })
      .catch((reason) => {
        reject(reason);
      });
  });
}

function resetLinks() {
  const links = Array.from(all(".link"));
  const navLabels = Array.from(all(".nav-label"));

  if (loadCount === 1) {
    links.push(...Array.from(all(".nav-link")));
    for (let i in navLabels) {
      const label = navLabels[i];
      const input = label.previousSibling;
      label.addEventListener("click", () => {
        input.checked = true;
      });
    }
  } else {
    for (let i in navLabels) {
      const label = navLabels[i];
      const input = label.previousSibling;
      const link = label.firstChild;
      if (link.getAttribute("href") === location.pathname) {
        input.checked = true;
      }
    }
  }

  for (let i in links) {
    const link = links[i];
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      event.preventDefault();
      if (href !== location.pathname) {
        navigate(href);
      }
    });
  }
}

function navigate(href = location.pathname, replace = false) {
  if (replace) {
    history.replaceState({}, "", href);
  } else {
    history.pushState({}, "", href);
  }
  loadPage(href)
    .then(() => {
      resetLinks();
    });
}

(function start() {
  handleRewind();
  navigate(location.pathname, true);
})();
