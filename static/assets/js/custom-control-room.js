(() => {
    'use strict';

  //////////////////////////
  /// Handle the tooltip ///
  //////////////////////////

  document.addEventListener("DOMContentLoaded", function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  });


  //////////////////////////////
  // Handle fullscreen button //
  //////////////////////////////

  document.addEventListener("DOMContentLoaded", function () {
    const controlRoom = document.querySelector(".control-room");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const fullscreenIcon = document.getElementById("fullscreen-icon");

    const enterFullscreenIcon = fullscreenBtn.getAttribute("data-fullscreen-icon");
    const exitFullscreenIcon = fullscreenBtn.getAttribute("data-exit-fullscreen-icon");

    fullscreenBtn.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            controlRoom.requestFullscreen().then(() => {
                fullscreenIcon.src = exitFullscreenIcon;
            });
        } else {
            document.exitFullscreen().then(() => {
                fullscreenIcon.src = enterFullscreenIcon;
            });
        }
    });

    document.addEventListener("fullscreenchange", function () {
        if (!document.fullscreenElement) {
            fullscreenIcon.src = enterFullscreenIcon;
        } else {
            fullscreenIcon.src = exitFullscreenIcon;
        }
    });
  });


  /////////////////////////
  // Handle tiles matrix //
  /////////////////////////

  document.addEventListener('DOMContentLoaded', function() {
    // Get all the tiles in the control room
    const tiles = document.querySelectorAll('.tile');

    // Function to adjust font size based on the tile size
    function adjustFontSize() {
      tiles.forEach(tile => {
        const tileWidth = tile.offsetWidth;
        const tileHeight = tile.offsetHeight;
        const tileSize = Math.min(tileWidth, tileHeight); // Use the smaller dimension (to avoid distortion)

        // Calculate font size based on tile size (you can adjust these factors as necessary)
        const fontSizeH1 = tileSize * 0.2;  // h1: 20% of tile size
        const fontSizeH2 = tileSize * 0.1;  // h2: 10% of tile size
        const fontSizeH3 = tileSize * 0.08; // h3: 8% of tile size
        const fontSizeH4 = tileSize * 0.09; // h4: 8% of tile size

        // Apply the calculated font sizes to the respective headings
        const h1 = tile.querySelector('h1');
        const h2 = tile.querySelector('h2');
        const h3 = tile.querySelector('h3');
        const h4 = tile.querySelector('h4');

        if (h1) {
          h1.style.fontSize = `${fontSizeH1}px`;

          // Adjust tendency text size relative to h1
          const tendencySpan = h1.querySelector('.tendency-text');
          if (tendencySpan) {
            tendencySpan.style.fontSize = `${fontSizeH1 * 0.6}px`; // Scale it to 60% of h1
          }
        }

        if (h2) h2.style.fontSize = `${fontSizeH2}px`;
        if (h3) h3.style.fontSize = `${fontSizeH3}px`;
        if (h4) h4.style.fontSize = `${fontSizeH4}px`;
      });
    }

    // Adjust font sizes initially
    adjustFontSize();

    // Adjust font sizes on window resize
    window.addEventListener('resize', adjustFontSize);
  });

  
  ////////////////////////////////////
  // Handle page updates using AJAX //
  ////////////////////////////////////

  document.addEventListener('DOMContentLoaded', function () {
    const lastUpdatedElement = document.getElementById('last-updated');
    let lastUpdateTime = new Date();

    // Function to handle date formatting
    function formatAlertAt(alertAt) {
        const date = new Date(alertAt);

        // Use the currentLocale variable passed from the HTML
        const locale = window.currentLocale || 'en';

        const parts = new Intl.DateTimeFormat(locale, {
            weekday: 'short',
            day: '2-digit',
            hour: 'numeric',
            hour12: locale === 'en',
        }).formatToParts(date);

        const getPart = (type) => parts.find(part => part.type === type)?.value;

        let weekday = getPart('weekday');
        const day = getPart('day');
        const hour = getPart('hour');
        const dayPeriod = getPart('dayPeriod');

        // Capitalize weekday and remove "."
        if (weekday) {
            weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace(/\./g, '');
        }

        // Locale-specific formatting
        if (locale === 'en') {
            return `${weekday} ${day} at ${hour}${dayPeriod}`;
        } else if (locale === 'pt') {
            return `${weekday} ${day} às ${hour}:${getPart('minute') || '00'}`;
        } else if (locale === 'es') {
            return `${weekday} ${day} a las ${hour}:${getPart('minute') || '00'}`;
        }

        // Default fallback
        return `${weekday} ${day} at ${hour}:${getPart('minute') || '00'}`;
    }  

    // Function to construct the API URL dynamically
    function constructWarningsApiUrl() {
        const stationKeys = JSON.parse(document.getElementById('station-keys').textContent || '[]');
        const queryParams = stationKeys.map(stationId => `station_id=${stationId}`).join('&');
        return `/api/warnings?${queryParams}`;
    }

    // Function to fetch warnings data and update the page
    async function fetchAndUpdateWarnings() {
        try {
            const apiUrl = constructWarningsApiUrl();
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const warnings = data.warnings;

            // Update the tiles with new warnings data
            warnings.forEach((warning, index) => {
                const tile = document.getElementById(`tile-${index}`);
                if (tile) {
                    // Populate tile content
                    tile.querySelector('h2').textContent = warning.station_id;
                    tile.querySelector('h3').textContent = warning.station_name;
                    tile.querySelector('h1').textContent = `${warning.last_stage_measure_cm} cm`;
                    tile.querySelector('p').textContent = '';

                    const h4 = tile.querySelector('h4');
                    if (warning.alert_category === 'no_upcoming_alerts') {
                        h4.innerHTML = translations.noUpcomingAlerts;
                    } else {
                        let alertMessage = '';
                        if (warning.alert_category === 'watch') {
                            alertMessage = translations.watch;
                        } else if (warning.alert_category === 'warning') {
                            alertMessage = translations.warning;
                        } else if (warning.alert_category === 'severe_warning') {
                            alertMessage = translations.severeWarning;
                        } else if (warning.alert_category === 'emergency') {
                            alertMessage = translations.emergency;
                        }

                        h4.innerHTML = `
                            <i class="bi bi-exclamation-triangle-fill me-4"></i>
                            ${alertMessage}:
                            ${translations.chanceOf} ${warning.alert_value_cm} cm
                            <br>
                            ${translations.around} ${formatAlertAt(warning.alert_at)}
                        `;
                    }

                    // Update tile background color
                    tile.className = `tile bg-${
                        warning.alert_category === 'watch' ? 'yellow' :
                        warning.alert_category === 'warning' ? 'orange' :
                        warning.alert_category === 'severe_warning' ? 'red' :
                        warning.alert_category === 'emergency' ? 'purple' : 'none'
                    }`;

                    // Add click event listener for redirection
                    tile.addEventListener('click', () => {
                        if (warning.station_id) {
                            window.location.href = `/dashboard/river-gauge/${warning.station_id}`;
                        }
                    });
                }
            });

            // Update the last update time
            lastUpdateTime = new Date();
            updateLastUpdatedText();
        } catch (error) {
            console.error('Failed to fetch warnings:', error);
        }
    }

    // Function to update the "last-updated" text
    function updateLastUpdatedText() {
        const now = new Date();
        const minutesAgo = Math.floor((now - lastUpdateTime) / 60000);

        if (minutesAgo === 0) {
            lastUpdatedElement.textContent = translations.updatedJustNow;
        } else if (minutesAgo === 1) {
            lastUpdatedElement.textContent = translations.lastUpdateOneMinAgo;
        } else if (minutesAgo < 60) {
            lastUpdatedElement.textContent = `${translations.lastUpdate} ${minutesAgo} ${translations.minAgo}`;
        } else {
            // Fetch new data after 60 minutes
            fetchAndUpdateWarnings();
        }
    }

    // Start the periodic update
    fetchAndUpdateWarnings(); // Initial fetch
    setInterval(updateLastUpdatedText, 60000); // Update "last-updated" text every minute
    setInterval(fetchAndUpdateWarnings, 3600000); // Fetch new data every hour
  });

})();
