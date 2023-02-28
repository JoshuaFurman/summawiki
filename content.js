const popup = document.createElement("div");
popup.style.cssText = `
  position: absolute;
  z-index: 9999;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  max-width: 400px;
  padding: 16px;
  text-align: left;
  display: none; /* hide the popup by default */
`;

const title = document.createElement("h2");
title.style.cssText = `
  color: #333;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const summary = document.createElement("p");
summary.style.cssText = `
  color: #666;
`;

const readMoreLink = document.createElement("a");
readMoreLink.style.cssText = `
  color: #0072c6;
  display: block;
  margin-top: 16px;
`;

popup.appendChild(title);
popup.appendChild(summary);
popup.appendChild(readMoreLink);
document.body.appendChild(popup); /* add the popup to the document */

document.addEventListener("mouseover", (e) => {
  if (
    e.target.tagName === "A" &&
    e.target.href.startsWith("https://en.wikipedia.org/wiki/") &&
    !popup.contains(e.target) /* check if the link is not inside the popup */
  ) {
    const pageTitle = e.target.href.split("/").slice(-1)[0];
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`)
      .then((response) => response.json())
      .then((data) => {
        title.innerText = data.title;
        summary.innerText = data.extract;
        readMoreLink.innerText = "Read more on Wikipedia";
        readMoreLink.href = data.content_urls.desktop.page;
        popup.style.top = `${e.pageY}px`;
        popup.style.left = `${e.pageX}px`;
        popup.style.display = "block"; /* show the popup */
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

popup.addEventListener("mouseleave", (e) => {
  popup.style.display = "none"; /* hide the popup when the mouse leaves it */
});

document.addEventListener("mousemove", (e) => {
  if (
    popup.style.display === "block" /* only move the popup if it's visible */ &&
    e.target.tagName !== "DIV" /* ignore mousemove events over the popup */ &&
    e.target.tagName !== "H2" &&
    e.target.tagName !== "P" &&
    e.target.tagName !== "A"
  ) {
    popup.style.top = `${e.pageY}px`;
    popup.style.left = `${e.pageX}px`;
  }
});
