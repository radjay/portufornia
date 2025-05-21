const spots = [
  {
    town: "Sao Pedro do Estoril",
    spot: "Bico",
    streamId: "5fcf6d21-f52c-422a-3035-3530-6d61-63-98fa-626cced74f41d",
    region: "Linha",
    sports: ["surf"],
    streamSource: "quanteec",
  },
  {
    town: "Carcavelos",
    spot: "Praia de Carcavelos",
    streamId: "7dbfbd58-2c72-4c87-3135-3530-6d61-63-a1b9-8dc2ff272a5cd",
    region: "Linha",
    sports: ["surf", "kite"],
    streamSource: "quanteec",
  },
  {
    town: "Guincho",
    spot: "Praia do Guincho (S)",
    streamId: "61f5d898-0c04-4515-3934-3530-6d61-63-87e5-3432badee226d",
    region: "Cascais",
    sports: ["surf", "windsurf", "kite", "wing"],
    streamSource: "quanteec",
  },
  {
    town: "Guincho",
    spot: "Praia do Guincho (N)",
    streamId: "8d2e5d1c-5771-49c8-3834-3530-6d61-63-a417-988a6df6a2f2d",
    region: "Cascais",
    sports: ["surf", "windsurf", "kite", "wing"],
    streamSource: "quanteec",
  },
  {
    town: "Caparica",
    spot: "Praia do Sao Joao",
    streamId: "f829148a-5ae5-4a90-3735-3530-6d61-63-b215-b6a95fb68802d",
    region: "Almada",
    sports: ["surf"],
    streamSource: "quanteec",
  },
  {
    town: "Caparica",
    spot: "Praia do CDS",
    streamId: "b969e298-ceb4-4132-3635-3530-6d61-63-82b6-c59507e55b39d",
    region: "Almada",
    sports: ["surf"],
    streamSource: "quanteec",
  },
  {
    town: "Caparica",
    spot: "Praia do Riviera",
    streamId: "033c1cda-143d-4a55-3835-3530-6d61-63-a933-f44c0821ad62d",
    region: "Almada",
    sports: ["surf"],
    streamSource: "quanteec",
  },
  {
    town: "Fonte da Telha",
    spot: "Praia da Fonte Telha",
    streamId: "a31a9026-5ced-4668-3935-3530-6d61-63-aa32-b07694268059d",
    region: "Almada",
    sports: ["windsurf", "kite", "wing", "surf"],
    streamSource: "quanteec",
  },
  {
    town: "Colares",
    spot: "Praia Grande - Sul",
    streamId: "f05e1d93-57cf-4e07-3734-3530-6d61-63-8b8c-a57a96c1fc1ed",
    region: "Sintra",
    sports: ["surf"],
    streamSource: "quanteec",
  },
  {
    town: "Sesimbra",
    spot: "Lagoa de Albufeira",
    streamId:
      "https://video-auth1.iol.pt/beachcam/bclagoaalbufeira/playlist.m3u8",
    region: "Sesimbra",
    sports: ["kite", "windsurf", "wing"],
    streamSource: "iol",
  },
  {
    town: "Cascais",
    spot: "Baia de Cascais",
    streamId:
      "https://video-auth1.iol.pt/beachcam/praiadospescadores/playlist.m3u8",
    region: "Cascais",
    sports: ["windsurf", "wing"],
    streamSource: "iol",
  },
];

/**
 * Load and initialize HLS stream for a video element
 * @param {string} streamId - The ID of the stream to load
 * @param {HTMLVideoElement} playerEl - The video element to attach the stream to
 * @param {string} streamSource - The source of the stream (quanteec, iol, etc)
 */
let loadStream = (streamId, playerEl, streamSource) => {
  console.log("Loading stream for:", streamId);
  let isOffline = false;
  const wrapper = $(playerEl).closest(".playerWrapper")[0];
  if (!wrapper) return;

  let mediaContainer = wrapper.querySelector(".mediaContainer");

  if (!mediaContainer) {
    mediaContainer = document.createElement("div");
    mediaContainer.className = "mediaContainer";
    playerEl.parentNode.insertBefore(mediaContainer, playerEl);
    mediaContainer.appendChild(playerEl);
  } else {
    if (!mediaContainer.contains(playerEl)) {
      mediaContainer.appendChild(playerEl);
    }
  }

  $(mediaContainer)
    .find(".status-indicator, .placeholder, .close-button, .play-button")
    .remove();

  const errorHandler = function () {
    if (!isOffline) {
      isOffline = true;
      console.log("Stream appears offline:", streamId);
      const spotTitle =
        $(wrapper).find(".spot-header h3").text() || "Unknown Spot";
      createPlaceholder(playerEl, spotTitle);
      playerEl.removeEventListener("error", errorHandler);
    }
  };
  playerEl.addEventListener("error", errorHandler);

  const loadingTimeout = setTimeout(function () {
    if (!isOffline && (!playerEl.readyState || playerEl.readyState < 2)) {
      console.log("Stream loading timeout:", streamId);
      errorHandler();
    }
  }, 8000);

  const loadedDataHandler = function () {
    clearTimeout(loadingTimeout);
    if (!isOffline) {
      console.log("Stream loaded successfully:", streamId);
      addLiveIndicator(playerEl);
    }
    playerEl.removeEventListener("loadeddata", loadedDataHandler);
  };
  playerEl.addEventListener("loadeddata", loadedDataHandler);

  // Get stream URL based on source
  let streamUrl;
  switch (streamSource) {
    case "quanteec":
      streamUrl =
        "https://deliverys5.quanteec.com/contents/encodings/live/" +
        streamId +
        "/media_0.m3u8";
      break;
    case "iol":
      streamUrl = streamId; // For IOL, the streamId is already the full URL
      break;
    default:
      console.error("Unknown stream source:", streamSource);
      return;
  }

  playerEl.playsInline = true;
  playerEl.muted = true;
  playerEl.autoplay = true;

  // Function to start video playback
  const startPlayback = function () {
    console.log("Starting playback for:", streamId);
    if (Hls.isSupported()) {
      // Clean up any existing HLS instance
      if (playerEl.hlsInstance) {
        try {
          playerEl.hlsInstance.destroy();
        } catch (e) {
          console.error("Error destroying HLS instance:", e);
        }
      }

      console.log("Creating new HLS instance");
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(playerEl);

      // Store HLS instance on the video element for later access
      playerEl.hlsInstance = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        console.log("HLS manifest parsed, playing video");
        playerEl.play().catch((error) => {
          console.log("Playback failed:", error);
          errorHandler();
        });
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        console.error("HLS error:", event, data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover network error
              console.log("Fatal network error encountered, trying to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Fatal media error encountered, trying to recover");
              hls.recoverMediaError();
              break;
            default:
              // Cannot recover
              console.log("Fatal error, cannot recover");
              hls.destroy();
              errorHandler();
              break;
          }
        }
      });
    } else if (playerEl.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Native HLS support detected");
      playerEl.src = streamUrl;
      playerEl.addEventListener("loadedmetadata", function () {
        console.log("Metadata loaded, playing video");
        playerEl.play().catch((error) => {
          console.log("Playback failed:", error);
          errorHandler();
        });
      });
    }
  };

  // Start playback immediately
  startPlayback();

  const closeButton = document.createElement("button");
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  closeButton.className = "close-button hidden";
  closeButton.style.display = "none";
  wrapper.appendChild(closeButton);

  closeButton.addEventListener("click", function (e) {
    console.log("Close button clicked");
    e.stopPropagation();
    const focusedPlayer = $(playerEl.closest(".playerWrapper"));
    if (focusedPlayer.hasClass("focused")) {
      console.log("Closing fullscreen");
      focusedPlayer.removeClass("focused");
      $("body").removeClass("modal-open");
      const header = document.getElementById("mainHeader");
      if (header) header.classList.remove("header-hidden");

      // Show spot headers again when exiting fullscreen
      focusedPlayer.find(".spot-header").show();

      // Handle the case where we might have a replacement video in fullscreen mode
      if (mediaContainer) {
        // Find any video elements in this container
        const existingVideoEl = mediaContainer.querySelector("video.player");

        // If we have a video element, restart its stream
        if (existingVideoEl && streamId) {
          console.log("Restarting stream after fullscreen");

          // Clean up the existing HLS instance
          if (existingVideoEl.hlsInstance) {
            try {
              existingVideoEl.hlsInstance.destroy();
              existingVideoEl.hlsInstance = null;
            } catch (e) {
              console.error("Error destroying HLS instance:", e);
            }
          }

          // Reset video element properties
          existingVideoEl.pause();
          existingVideoEl.removeAttribute("src");
          existingVideoEl.load();

          // Load the stream for the existing video element
          setTimeout(() => {
            loadStream(streamId, existingVideoEl, streamSource);
          }, 100);
        }
      }

      // Resume all other videos
      console.log("Resuming all grid videos");
      $("video.player").each(function () {
        if (this.paused) {
          this.muted = true; // Ensure muted for autoplay
          console.log("Resuming video:", this.id);
          this.play().catch((e) =>
            console.log("Error resuming after close:", e)
          );
        }
      });
    }
  });

  // Make sure we don't interfere with our custom click handler
  $(wrapper).off("click.original");
};

/**
 * Create placeholder for offline streams
 * @param {HTMLVideoElement} playerEl - The video element to replace with placeholder
 * @param {string} spotName - Name of the spot to display in placeholder
 */
function createPlaceholder(playerEl, spotName) {
  const mediaContainer = playerEl.closest(".mediaContainer");
  if (!mediaContainer) return;

  $(mediaContainer).find(".placeholder, .status-indicator").remove();

  // Get the spot name from the data attribute
  const spotTitle =
    mediaContainer.getAttribute("data-spot-name") || spotName || "Unknown Spot";

  const placeholderEl = document.createElement("div");
  placeholderEl.className =
    "placeholder w-full h-full bg-[#1e1e1e] flex items-center justify-center flex-col text-white/50 absolute inset-0";
  placeholderEl.innerHTML = `
    <i class="fas fa-video-slash text-4xl mb-2 opacity-70"></i>
    <div class="text-sm font-medium">${spotTitle}</div>
  `;

  playerEl.style.display = "none";
  mediaContainer.appendChild(placeholderEl);

  const statusIndicator = document.createElement("div");
  statusIndicator.className =
    "absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)] z-10";
  mediaContainer.appendChild(statusIndicator);
}

/**
 * Add live indicator to a stream
 * @param {HTMLVideoElement} playerEl - The video element to add indicator to
 */
function addLiveIndicator(playerEl) {
  const mediaContainer = playerEl.closest(".mediaContainer");
  if (!mediaContainer) return;

  $(mediaContainer).find(".placeholder, .status-indicator").remove();
  playerEl.style.display = "block";

  const statusIndicator = document.createElement("div");
  statusIndicator.className =
    "absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] z-10";
  mediaContainer.appendChild(statusIndicator);
}

/**
 * Render spots into the players container
 * @param {string} mode - The mode to filter spots by (surf/kite)
 */
let renderSpots = (mode) => {
  const container = $("#playersContainer");
  container.empty();

  const filteredSpots = spots.filter((spot) => {
    if (mode === "all") return true;
    return spot.sports.includes(mode);
  });

  // Create all wrappers first
  const wrappers = filteredSpots.map((spot) => {
    const wrapper = $(
      '<div class="playerWrapper transition-all duration-300"></div>'
    );
    const mediaContainer = $('<div class="mediaContainer"></div>');
    mediaContainer.attr("data-spot-name", `${spot.spot}, ${spot.town}`);

    // Create sports icons container
    const sportsContainer = $('<div class="sports-icons"></div>');
    spot.sports.forEach((sport) => {
      const icon = $('<div class="sport-icon"></div>');
      icon.attr("data-sport", sport);
      sportsContainer.append(icon);
    });
    mediaContainer.append(sportsContainer);

    const player = $('<video class="player"></video>');
    player.attr("data-stream-source", spot.streamSource);
    wrapper.append(mediaContainer);
    mediaContainer.append(player);
    return {
      wrapper,
      player: player[0],
      streamId: spot.streamId,
      streamSource: spot.streamSource,
    };
  });

  // Add all wrappers to container
  wrappers.forEach(({ wrapper }) => container.append(wrapper));

  // Load streams
  wrappers.forEach(({ player, streamId, streamSource }) => {
    loadStream(streamId, player, streamSource);
  });

  // Prevent the click handler from being added multiple times
  $(".playerWrapper").off("click");

  // Ensure our click handlers are set up correctly
  setupClickHandlers();

  // Make sure header bar styling is consistently applied
  $(".spot-header").each(function () {
    $(this).addClass("bg-black/60 backdrop-blur-sm");
    $(this).find("h3").addClass("text-white text-shadow font-medium");
  });
};

/**
 * Set up click handlers for player wrappers
 */
function setupClickHandlers() {
  // Remove any existing click handlers and set up the new one
  $(document)
    .off("click", ".playerWrapper")
    .on("click", ".playerWrapper", function (e) {
      // Ignore clicks on the close button or play button (handled separately)
      if ($(e.target).closest(".close-button, .play-button").length) {
        return;
      }

      // Check if the camera is offline
      const mediaContainer = $(this).find(".mediaContainer")[0];
      if (mediaContainer && mediaContainer.querySelector(".placeholder")) {
        console.log("Camera is offline, preventing fullscreen");
        return;
      }

      const videoPlayer = $(this).find("video.player")[0];
      const allVideos = $("video.player");

      console.log(
        "Player wrapper clicked, has focused class:",
        $(this).hasClass("focused")
      );

      if ($(this).hasClass("focused")) {
        // Exiting fullscreen
        console.log("Exiting fullscreen mode");
        $(this).removeClass("focused");
        $("body").removeClass("modal-open");
        const header = document.getElementById("mainHeader");
        if (header) header.classList.remove("header-hidden");

        // Show the spot header when exiting fullscreen
        $(this).find(".spot-header").show();

        // Hide the close button when exiting fullscreen
        const closeButton = $(this).find(".close-button");
        if (closeButton.length) {
          closeButton.removeClass("flex").addClass("hidden");
          closeButton[0].style.display = "none"; // Set display none explicitly
        }

        // Resume all videos when exiting fullscreen
        console.log("Attempting to resume all videos:", allVideos.length);
        allVideos.each(function () {
          console.log("Resuming video:", this.id);
          try {
            if (this.paused) {
              this.muted = true;
              const playPromise = this.play();
              if (playPromise) {
                playPromise.catch((e) =>
                  console.log("Error playing video:", e)
                );
              }
            }
          } catch (err) {
            console.error("Error resuming video:", err);
          }
        });
      } else {
        // Entering fullscreen
        console.log("Entering fullscreen mode");

        // First hide any existing focused players
        $(".playerWrapper.focused").removeClass("focused");

        // Pause all other videos
        allVideos.not(videoPlayer).each(function () {
          console.log("Pausing video:", this.id);
          try {
            if (!this.paused) {
              this.pause();
            }
          } catch (err) {
            console.error("Error pausing video:", err);
          }
        });

        // Set this player as focused
        $(this).addClass("focused");
        $("body").addClass("modal-open");
        const header = document.getElementById("mainHeader");
        if (header) header.classList.add("header-hidden");

        // Hide the spot header when in fullscreen mode
        $(this).find(".spot-header").hide();

        // Show the close button when in fullscreen mode
        const closeButton = $(this).find(".close-button");
        if (closeButton.length) {
          closeButton.removeClass("hidden").addClass("flex");
          closeButton[0].style.display = "flex"; // Set display flex explicitly
        }

        // Ensure the video is playing in fullscreen
        if (videoPlayer.paused) {
          videoPlayer
            .play()
            .catch((e) => console.log("Error playing video in fullscreen:", e));
        }
      }
    });
}

/**
 * Update the grid columns based on user selection
 * @param {number} columns - Number of columns to use in the grid
 */
function updateColumns(columns) {
  const playersContainer = document.getElementById("playersContainer");
  if (!playersContainer) return;

  console.log(`Updating columns to: ${columns}`);

  const possibleColClasses = [
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "grid-cols-5",
    "grid-cols-6",
  ];

  possibleColClasses.forEach((cls) => {
    playersContainer.classList.remove(cls);
  });

  playersContainer.classList.add(`grid-cols-${columns}`);
  localStorage.setItem("columns", columns);

  // Flash effect for feedback
  playersContainer.classList.add("bg-white/5");
  setTimeout(() => {
    playersContainer.classList.remove("bg-white/5");
  }, 150);
}

/**
 * Update the display mode (surf/kite)
 * @param {string} newMode - The new mode to update to
 */
let updateMode = (newMode) => {
  console.log(`Switching mode to: ${newMode}`);
  localStorage.setItem("mode", newMode);
  renderSpots(newMode);
};

/**
 * Initialize the application when DOM is ready
 */
$(document).ready(function () {
  // Custom overrides and extensions
  const originalUpdateMode = updateMode;
  updateMode = function (newMode) {
    console.log(`Switching mode to: ${newMode}`);
    originalUpdateMode(newMode);
  };

  const originalRenderSpots = renderSpots;
  renderSpots = function (mode) {
    console.log(`Rendering spots for mode: ${mode}`);
    originalRenderSpots(mode);

    // Prevent the click handler from main.js and use our own
    $(".playerWrapper").off("click");

    // Ensure our click handlers are set up correctly
    setupClickHandlers();
  };

  const modeSelect = document.getElementById("modeSelect");
  const currentMode = localStorage.getItem("mode") || "all";
  modeSelect.value = currentMode;

  modeSelect.addEventListener("change", function () {
    const newMode = this.value;
    localStorage.setItem("mode", newMode);
    updateMode(newMode);
  });

  const columnsSelect = document.getElementById("columnsSelect");
  const savedColumns = localStorage.getItem("columns");

  // Set default columns based on screen size if no saved preference
  if (!savedColumns) {
    const defaultColumns = window.innerWidth < 768 ? "1" : "3";
    columnsSelect.value = defaultColumns;
    updateColumns(defaultColumns);
  } else {
    columnsSelect.value = savedColumns;
    updateColumns(savedColumns);
  }

  columnsSelect.addEventListener("change", function () {
    const newColumns = this.value;
    updateColumns(newColumns);
  });

  // Set up click handlers
  setupClickHandlers();

  // Initialize app with current settings
  renderSpots(currentMode);

  $(document).on("keydown", function (e) {
    if (e.key === "Escape" || e.keyCode === 27) {
      const focusedPlayer = $(".playerWrapper.focused");
      if (focusedPlayer.length) {
        console.log("ESC pressed, closing fullscreen");
        focusedPlayer.removeClass("focused");
        $("body").removeClass("modal-open");
        const header = document.getElementById("mainHeader");
        if (header) header.classList.remove("header-hidden");

        // Show spot headers again when exiting fullscreen via ESC key
        focusedPlayer.find(".spot-header").show();

        // Hide the close button when exiting fullscreen
        const closeButton = focusedPlayer.find(".close-button");
        if (closeButton.length) {
          closeButton.removeClass("flex").addClass("hidden");
          closeButton[0].style.display = "none";
        }

        const streamId = focusedPlayer.find("video.player").attr("id");
        const mediaContainer = focusedPlayer.find(".mediaContainer")[0];
        if (mediaContainer) {
          // Find any video elements in this container
          const existingVideoEl = mediaContainer.querySelector("video.player");

          // If we have a video element, restart its stream
          if (existingVideoEl && streamId) {
            console.log("Restarting stream after ESC");

            // Clean up the existing HLS instance
            if (existingVideoEl.hlsInstance) {
              try {
                existingVideoEl.hlsInstance.destroy();
                existingVideoEl.hlsInstance = null;
              } catch (e) {
                console.error("Error destroying HLS instance:", e);
              }
            }

            // Reset video element properties
            existingVideoEl.pause();
            existingVideoEl.removeAttribute("src");
            existingVideoEl.load();

            // Load the stream for the existing video element
            setTimeout(() => {
              const streamSource =
                existingVideoEl.getAttribute("data-stream-source");
              loadStream(streamId, existingVideoEl, streamSource);
            }, 100);
          }
        }

        // Resume all grid videos
        console.log("Resuming all videos after ESC pressed");
        $("video.player").each(function () {
          if (this.paused) {
            this.muted = true; // Ensure muted for autoplay
            console.log("Resuming video:", this.id);
            this.play().catch((e) =>
              console.log("Error resuming after ESC:", e)
            );
          }
        });
      }
    }
  });

  window.addEventListener("orientationchange", function () {
    if ($(".playerWrapper.focused").length) {
      setTimeout(function () {
        window.scrollTo(0, 0);
      }, 200);
    }
  });
});

// Stream sources:
//
// Go surf - Sao Pedro: https://deliverys5.quanteec.com/contents/encodings/live/5fcf6d21-f52c-422a-3035-3530-6d61-63-98fa-626cced74f41d/media_0.m3u8
// Go surf - Carcavelos: https://deliverys6.quanteec.com/contents/encodings/live/7dbfbd58-2c72-4c87-3135-3530-6d61-63-a1b9-8dc2ff272a5cd/media_0.m3u8
