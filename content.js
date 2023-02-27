const popup = document.createElement("div");
popup.style.cssText = `
  position: absolute;
  z-index: 9999;
  background-color: white;
  border: 1px solid black;
  padding: 10px;
  font-size: 14px;
`;

document.addEventListener("mouseover", (e) => {
  if (
    e.target.tagName === "A" &&
    e.target.href.startsWith("https://en.wikipedia.org/wiki/")
  ) {
    const pageTitle = e.target.href.split("/").slice(-1)[0];
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`)
      .then((response) => response.json())
      .then((data) => {
        popup.innerHTML = `
          <h3>${data.title}</h3>
          <p>${data.extract}</p>
          <a href="${data.content_urls.desktop.page}" target="_blank">Read more</a>
        `;
        popup.style.top = `${e.pageY}px`;
        popup.style.left = `${e.pageX}px`;
        document.body.appendChild(popup);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

document.addEventListener("mouseout", (e) => {
  if (
    e.target.tagName === "A" &&
    e.target.href.startsWith("https://en.wikipedia.org/wiki/")
  ) {
    document.body.removeChild(popup);
  }
});
