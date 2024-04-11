// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
const motivationVideos = [
  "srYlzVR9jCg",
  "3TAxutVuSCE",
  "dSRAXW2mqvc",
  "MbN_FTCg4rk",
  "kt04TZi72P0",
];
const videoId = motivationVideos[Math.floor(Math.random() * 4)];

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "360",
    width: "100%",
    videoId: videoId,
    playerVars: {
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  // Your logic for player state change (if needed)
}

const amount = document.getElementById("amount");

paypal
  .Buttons({
    createOrder: function (data, actions) {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: amount.value,
            },
          },
        ],
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        alert(
          "transaction completed. thank you " + details.payer.name.given_name
        );
      });
    },
    style: {
      layout: "vertical",
      color: "blue",
      shape: "rect",
      label: "paypal",
    },
  })
  .render("#paypal");
