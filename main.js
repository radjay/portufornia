const spots = [
  {
    town: "Sao Pedro do Estoril",
    spot: "Bico",
    streamId: "5fcf6d21-f52c-422a-3035-3530-6d61-63-98fa-626cced74f41d",
    region: "Linha",
    sports: ["surf"],
  },
  {
    town: "Carcavelos",
    spot: "Praia de Carcavelos",
    streamId: "7dbfbd58-2c72-4c87-3135-3530-6d61-63-a1b9-8dc2ff272a5cd",
    region: "Linha",
    sports: ["surf"],
  },
  {
    town: "Guincho",
    spot: "Praia do Guincho (S)",
    streamId: "61f5d898-0c04-4515-3934-3530-6d61-63-87e5-3432badee226d",
    region: "Cascais",
    sports: ["kite", "surf"],
  },
  {
    town: "Guincho",
    spot: "Praia do Guincho (N)",
    streamId: "8d2e5d1c-5771-49c8-3834-3530-6d61-63-a417-988a6df6a2f2d",
    region: "Cascais",
    sports: ["kite", "surf"],
  },
  {
    town: "Caparica",
    spot: "Praia do Sao Joao",
    streamId: "f829148a-5ae5-4a90-3735-3530-6d61-63-b215-b6a95fb68802d",
    region: "Almada",
    sports: ["surf"],
  },
  {
    town: "Caparica",
    spot: "Praia do CDS",
    streamId: "b969e298-ceb4-4132-3635-3530-6d61-63-82b6-c59507e55b39d",
    region: "Almada",
    sports: ["surf"],
  },
  {
    town: "Caparica",
    spot: "Praia do Riviera",
    streamId: "033c1cda-143d-4a55-3835-3530-6d61-63-a933-f44c0821ad62d",
    region: "Almada",
    sports: ["surf"],
  },
  {
    town: "Fonte da Telha",
    spot: "Praia da Fonte Telha",
    streamId: "a31a9026-5ced-4668-3935-3530-6d61-63-aa32-b07694268059d",
    region: "Almada",
    sports: ["kite"],
  },
  {
    town: "Colares",
    spot: "Praia Grande - Sul",
    streamId: "f05e1d93-57cf-4e07-3734-3530-6d61-63-8b8c-a57a96c1fc1ed",
    region: "Sintra",
    sports: ["surf"],
  },
  // feeds to add:
  // - https://www.playocean.net/camaras/costa-da-caparica-panoramica
];

const loadStream = (streamId, playerEl) => {
  const streamUrl =
    "https://deliverys5.quanteec.com/contents/encodings/live/" +
    streamId +
    "/media_0.m3u8";

  playerEl.playsInline = true;
  playerEl.muted = true;

  const playButton = document.createElement("button");
  playButton.innerHTML = "▶";
  playButton.className = "play-button";
  playerEl.parentNode.appendChild(playButton);

  const startPlayback = () => {
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(playerEl);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        playerEl
          .play()
          .catch((error) => console.log("Playback failed:", error));
      });
    } else if (playerEl.canPlayType("application/vnd.apple.mpegurl")) {
      playerEl.src = streamUrl;
      playerEl.addEventListener("loadedmetadata", function () {
        playerEl
          .play()
          .catch((error) => console.log("Playback failed:", error));
      });
    }
    playButton.style.display = "none";
  };

  playButton.addEventListener("click", startPlayback);

  startPlayback();
};

const renderSpots = (mode) => {
  document.getElementById("players").innerHTML = "";

  spots.forEach((spot) => {
    if (spot.sports.includes(mode)) {
      const wrapperEl = document.createElement("div");
      wrapperEl.setAttribute("class", "playerWrapper");
      const playerEl = document.createElement("video");
      playerEl.setAttribute("id", spot.streamId);
      playerEl.setAttribute("class", "player");
      playerEl.muted = true;

      const titleEl = document.createElement("h3");
      titleEl.innerText = spot.spot;
      const subTitleEl = document.createElement("h4");
      subTitleEl.innerText = spot.town;
      const titleWrapperEl = document.createElement("div");
      titleWrapperEl.appendChild(titleEl);
      titleWrapperEl.appendChild(subTitleEl);
      titleWrapperEl.setAttribute("class", "titleWrapper");

      wrapperEl.appendChild(titleWrapperEl);
      wrapperEl.appendChild(playerEl);

      document.getElementById("players").appendChild(wrapperEl);
      loadStream(spot.streamId, playerEl);
    }
  });

  $(".playerWrapper").each((index, player) => {
    $(player).on("click", () => {
      $(player).toggleClass("focused");
    });
  });
};

const toggleFocus = (playerWrapperEl) => {
  if (playerWrapperEl.classList.contains("focused")) {
    playerWrapperEl.classList.remove("focused");
  } else {
    playerWrapperEl.classList.add("focused");
  }
};

document.addEventListener("keydown", function (e) {
  const currentIndex = $(".playerWrapper.focused").index();
  if (e.keyCode == 27) {
    $(".playerWrapper").removeClass("focused");
  }
  if (e.keyCode == 39) {
    if (currentIndex >= 0) {
      $(".playerWrapper.focused").removeClass("focused");
      const nextIndex =
        $(".playerWrapper").length > currentIndex + 1 ? currentIndex + 1 : 0;
      $($(".playerWrapper")[nextIndex]).addClass("focused");
    }
  }
  if (e.keyCode == 37) {
    if (currentIndex >= 0) {
      $(".playerWrapper.focused").removeClass("focused");
      const nextIndex =
        currentIndex - 1 < 0
          ? $(".playerWrapper").length - 1
          : currentIndex - 1;
      $($(".playerWrapper")[nextIndex]).addClass("focused");
    }
  }
});

const updateMode = (newMode) => {
  $("#modeSelector > a").removeClass("btn-accent");
  $("#modeSelector > a[data-mode=" + newMode + "]").addClass("btn-accent");
  localStorage.setItem("mode", newMode);
  renderSpots(newMode);
};

$(() => {
  const mode = localStorage.getItem("mode") || "surf";
  updateMode(mode);

  $("#modeSelector > a").each((index, mode) => {
    $(mode).on("click", () => {
      const newMode = $(mode).data("mode");
      updateMode(newMode);
    });
  });
});

// Stream sources:
//
// Go surf - Sao Pedro: https://deliverys5.quanteec.com/contents/encodings/live/5fcf6d21-f52c-422a-3035-3530-6d61-63-98fa-626cced74f41d/media_0.m3u8
// Go surf - Carcavelos: https://deliverys6.quanteec.com/contents/encodings/live/7dbfbd58-2c72-4c87-3135-3530-6d61-63-a1b9-8dc2ff272a5cd/media_0.m3u8
