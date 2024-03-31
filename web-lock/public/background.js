// Set the default extension icon when the background script initializes
chrome.runtime.onInstalled.addListener(function () {
  chrome.action.setIcon({
    path: {
      16: "images/open-state/16.png",
      32: "images/open-state/32.png",
      48: "images/open-state/48.png",
      128: "images/open-state/128.png",
    },
  });
});

const motivationVideos = [
  "https://www.youtube.com/shorts/srYlzVR9jCg",
  "https://www.youtube.com/shorts/3TAxutVuSCE",
  "https://www.youtube.com/shorts/dSRAXW2mqvc",
  "https://www.youtube.com/shorts/MbN_FTCg4rk",
  "https://www.youtube.com/shorts/kt04TZi72P0",
];

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
function startTimer(countdown) {
  console.log(countdown);
  if (countdown) {
    chrome.storage.sync.set({
      blockingTimestamp: Date.now(),
      countdown: countdown,
    });

    chrome.action.setIcon({
      path: {
        16: "images/block-state/16.png",
        32: "images/block-state/32.png",
        48: "images/block-state/48.png",
        128: "images/block-state/128.png",
      },
    });
    updateState({
      timerId: setTimeout(() => {
        updateState({ isBlockingEnabled: false, timerId: null, countdown: 0 });
        console.log("Timer off");
        chrome.action.setIcon({
          path: {
            16: "images/open-state/16.png",
            32: "images/open-state/32.png",
            48: "images/open-state/48.png",
            128: "images/open-state/128.png",
          },
        });
      }, countdown),
    }); // default 1 minute
  }
}

// Function to stop the timer
function stopTimer() {
  clearTimeout(state.timerId);
  updateState({ timerId: null });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    state.isBlockingEnabled &&
    state.blockedWebsites.some((website) => tab.url.includes(website))
  ) {
    if (state.blockedWebsites.join().includes("youtube.com")) {
      chrome.tabs.remove(tabId, function () {
        console.log("Blocked website:", tab.url);
      });
    } else {
      chrome.tabs.update(tabId, {
        url: motivationVideos[Math.floor(Math.random() * 5)],
      });
    }
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
      if (!message.isBlock) {
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
