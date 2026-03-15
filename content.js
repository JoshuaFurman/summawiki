// Create popup container with unique class to avoid conflicts
const popup = document.createElement("div");
popup.className = "summawiki-popup";
popup.style.cssText = `
  position: absolute;
  z-index: 2147483647;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  max-width: 400px;
  padding: 16px;
  text-align: center;
  display: none;
  box-sizing: border-box;
`;

const title = document.createElement("h2");
title.className = "summawiki-title";
title.style.cssText = `
  color: #333;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px 0;
`;

const thumbnail = document.createElement("img");
thumbnail.className = "summawiki-thumbnail";
thumbnail.style.cssText = `
  max-width: 80%;
  max-height: 200px;
  margin: 0 auto 16px auto;
  display: none;
`;

const summary = document.createElement("p");
summary.className = "summawiki-summary";
summary.style.cssText = `
  color: #666;
  margin: 0;
`;

const readMoreLink = document.createElement("a");
readMoreLink.className = "summawiki-link";
readMoreLink.style.cssText = `
  color: #0072c6;
  display: block;
  margin-top: 16px;
  text-decoration: none;
`;
readMoreLink.target = "_blank";
readMoreLink.rel = "noopener noreferrer";

popup.appendChild(title);
popup.appendChild(thumbnail);
popup.appendChild(summary);
popup.appendChild(readMoreLink);
document.body.appendChild(popup);

// Regex to match any Wikipedia language subdomain
const wikipediaRegex = /^https?:\/\/([a-z]{2,3})\.wikipedia\.org\/wiki\/(.+)$/i;

// State management
let currentLink = null;
let hideTimeout = null;
let hoverTimeout = null;
let currentRequest = null;

// Cache for API responses
const cache = new Map();

/**
 * Position the popup within viewport bounds
 */
function positionPopup(x, y) {
  // Temporarily show popup (invisible) to get accurate dimensions
  popup.style.visibility = "hidden";
  popup.style.display = "block";

  const popupRect = popup.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  // Offset from cursor
  let left = x + 15;
  let top = y + 15;

  // Adjust if popup would overflow right edge
  if (left + popupRect.width > scrollX + viewportWidth) {
    left = x - popupRect.width - 15;
  }

  // Adjust if popup would overflow bottom edge
  if (top + popupRect.height > scrollY + viewportHeight) {
    top = y - popupRect.height - 15;
  }

  // Ensure popup doesn't go off left or top edge
  left = Math.max(scrollX + 5, left);
  top = Math.max(scrollY + 5, top);

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  popup.style.visibility = "visible";
}

/**
 * Show the popup with Wikipedia data
 */
function showPopup(data, x, y) {
  title.innerText = data.title || "Unknown";
  summary.innerText = data.extract || "No summary available.";

  // Handle thumbnail - hide if not available
  if (data.thumbnail?.source) {
    thumbnail.src = data.thumbnail.source;
    thumbnail.alt = data.title || "Wikipedia thumbnail";
    thumbnail.style.display = "block";
  } else {
    thumbnail.src = "";
    thumbnail.style.display = "none";
  }

  // Handle read more link - use original URL if content_urls not available
  if (data.content_urls?.desktop?.page) {
    readMoreLink.href = data.content_urls.desktop.page;
    readMoreLink.style.display = "block";
  } else if (data.originalUrl) {
    readMoreLink.href = data.originalUrl;
    readMoreLink.style.display = "block";
  } else {
    readMoreLink.style.display = "none";
  }
  readMoreLink.innerText = "Read more on Wikipedia";

  positionPopup(x, y);
}

/**
 * Show error state in popup
 */
function showError(message, x, y) {
  title.innerText = "Preview Unavailable";
  summary.innerText = message;
  thumbnail.style.display = "none";
  readMoreLink.style.display = "none";

  positionPopup(x, y);
}

/**
 * Hide the popup
 */
function hidePopup() {
  popup.style.display = "none";
  currentLink = null;
  if (currentRequest) {
    currentRequest = null;
  }
}

/**
 * Fetch Wikipedia summary with caching
 */
async function fetchWikipediaSummary(lang, pageTitle, originalUrl) {
  const cacheKey = `${lang}:${pageTitle}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  data.originalUrl = originalUrl;

  // Cache the result
  cache.set(cacheKey, data);

  return data;
}

/**
 * Handle mouse entering a Wikipedia link
 */
function handleLinkHover(e) {
  const link = e.target.closest("a");

  if (!link || popup.contains(link)) {
    return;
  }

  const match = link.href?.match(wikipediaRegex);
  if (!match) {
    return;
  }

  const [, lang, pageTitle] = match;

  // Clear any pending hide timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  // Debounce: wait before fetching to avoid spam on quick mouse movements
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }

  currentLink = link;

  hoverTimeout = setTimeout(async () => {
    // Check if we're still hovering the same link
    if (currentLink !== link) {
      return;
    }

    const requestId = Symbol();
    currentRequest = requestId;

    try {
      const data = await fetchWikipediaSummary(lang, pageTitle, link.href);

      // Check if this request is still relevant
      if (currentRequest !== requestId) {
        return;
      }

      showPopup(data, e.pageX, e.pageY);
    } catch (error) {
      console.error("SummaWiki: Failed to fetch Wikipedia summary", error);

      if (currentRequest === requestId) {
        showError("Could not load preview.", e.pageX, e.pageY);
      }
    }
  }, 200);
}

/**
 * Handle mouse leaving a link
 */
function handleLinkLeave(e) {
  const link = e.target.closest("a");

  if (!link) {
    return;
  }

  // Clear hover timeout if we leave before it fires
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  // Set a timeout to hide the popup, giving user time to move to the popup
  hideTimeout = setTimeout(() => {
    hidePopup();
  }, 150);
}

/**
 * Handle mouse entering the popup
 */
function handlePopupEnter() {
  // Cancel hide timeout when entering popup
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

/**
 * Handle mouse leaving the popup
 */
function handlePopupLeave() {
  hidePopup();
}

// Event listeners
document.addEventListener("mouseover", handleLinkHover);
document.addEventListener("mouseout", handleLinkLeave);
popup.addEventListener("mouseenter", handlePopupEnter);
popup.addEventListener("mouseleave", handlePopupLeave);
