// Define initial state
let state = {
  isBlockingEnabled: false,
  blockedWebsites: [],
  timerId: null,
};

// Load state from storage
chrome.storage.sync.get(
  ["isBlockingEnabled", "blockedWebsites"],
  function (data) {
    if (data.isBlockingEnabled !== undefined) {
      state.isBlockingEnabled = data.isBlockingEnabled;
    }
    if (data.blockedWebsites) {
      state.blockedWebsites = data.blockedWebsites;
    }
  }
);

// Function to update state and storage
function updateState(newState) {
  state = { ...state, ...newState };
  chrome.storage.sync.set(state);
}

// Function to start the timer
function startTimer(countdown = 1) {
  chrome.storage.sync.set({ blockingTimestamp: Date.now() });
  updateState({
    timerId: setTimeout(() => {
      updateState({ isBlockingEnabled: false, timerId: null });
      console.log("Timer off");
    }, countdown * 60 * 1000),
  }); // default 1 minute
}

// Function to stop the timer
function stopTimer() {
  clearTimeout(state.timerId);
  updateState({ timerId: null });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    isBlockingEnabled &&
    blockedWebsites.some((website) => tab.url.includes(website))
  ) {
    chrome.tabs.remove(tabId, function () {
      console.log("Blocked website:", tab.url);
    });
    // chrome.tabs.update(tabId, { url: "https://example.com/blocked.html" });
  }
});

// Listen for messages from the popup or content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.action) {
    case "addBlockedWebsite":
      updateState({
        blockedWebsites: [...state.blockedWebsites, message.website],
      });
      sendResponse({ result: "Website added to the blocked list" });
      break;
    case "removeBlockedWebsite":
      updateState({
        blockedWebsites: state.blockedWebsites.filter(
          (item) => item !== message.website
        ),
      });
      sendResponse({ result: "Website removed from the blocked list" });
      break;
    case "toggleBlock":
      updateState({ isBlockingEnabled: message.isBlock });
      sendResponse({ result: "Block is toggled" });
      if (message.isBlock) {
        startTimer();
      } else {
        stopTimer();
      }
      break;
    case "startTimer":
      startTimer(message.countdown);
      sendResponse({
        result: `Timer has started for ${message.countdown} minutes`,
      });
      break;
    case "stopTimer":
      stopTimer();
      sendResponse({ result: `Timer has stopped` });
      break;
    default:
      break;
  }
});
