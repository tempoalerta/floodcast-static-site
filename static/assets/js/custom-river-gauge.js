(() => {
    'use strict';

    ///////////////////////////////////////////////////
    // Handle the dropdown update for the timeframe ///
    ///////////////////////////////////////////////////

    document.getElementById('timeframe').addEventListener('change', function () {
        const spinner = document.getElementById("loadingSpinner");
        const selectedValue = this.value;
    
        // Show the spinner only for slow-loading options
        if (selectedValue === "365d" || selectedValue === "all") {
            spinner.classList.remove("d-none"); 
        }
    
        // Redirect after a short delay to ensure spinner is shown
        setTimeout(() => {
            window.location.href = `?timeframe=${selectedValue}`;
        }, 200);
    });


    /////////////////////////////////
    /// Handle the legend tooltip ///
    /////////////////////////////////

    document.addEventListener("DOMContentLoaded", function () {
        const popoverTrigger = document.getElementById("legendPopover");
        const popoverContent = document.getElementById("popover-content").innerHTML;
    
        // Create a popover instance
        const popover = new bootstrap.Popover(popoverTrigger, {
            content: popoverContent,
            html: true,
            sanitize: false,
            placement: "right",
            trigger: "manual" // Disable default trigger behavior
        });
    
        // Show popover on hover
        popoverTrigger.addEventListener("mouseenter", function () {
            popover.show();
        });
    
        // Hide popover when the mouse leaves both the icon and the popover itself
        popoverTrigger.addEventListener("mouseleave", function () {
            setTimeout(function () {
                if (!popoverTrigger.matches(":hover") && !document.querySelector(".popover:hover")) {
                    popover.hide();
                }
            }, 100); // Small delay to allow moving to the popover
        });
    
        // Also hide popover when the mouse leaves the popover itself
        document.addEventListener("mouseover", function (event) {
            if (document.querySelector(".popover") && !popoverTrigger.matches(":hover") && !document.querySelector(".popover:hover")) {
                popover.hide();
            }
        });
    });        


    ////////////////////////
    /// Handle the chart ///
    ////////////////////////

    document.addEventListener("DOMContentLoaded", function () {
        const canvas = document.getElementById("riverGaugeChart");
        const ctx = canvas.getContext("2d");

        // Improve rendering resolution
        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        }

        resizeCanvas();

        // Get data from the window object
        const rawData = window.riverGaugeData;
        const labels = rawData.labels_iso.map(date => new Date(date));
        const localizedLabelMap = {};
        rawData.labels_iso.forEach((iso, i) => {
            localizedLabelMap[new Date(iso).toISOString()] = rawData.labels_localized_short[i];
        });

        // Combine past and future data
        const combinedStageData = [
            ...rawData.past.stage.map((y, i) => ({ x: labels[i], y })),
            ...rawData.future.stage.map((y, i) => ({ x: labels[rawData.past.stage.length + i], y }))
        ];

        // Theme-related color settings
        const getThemeColors = () => {
            const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
            return {
                tickColor: isDarkMode ? 'rgb(238, 238, 238)' : 'rgb(50, 50, 50)',
                gridColor: isDarkMode ? 'rgb(60, 60, 60)' : 'rgb(220, 220, 220)',
                annotationLineColor: isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)',
                annotationTextColor: isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(255, 255, 255)',
                riverLabelColor: isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(80, 80, 80)',                
                boundBorderColor: isDarkMode ? "rgba(0, 123, 255, 0.5)" : "rgba(0, 123, 255, 0.3)",
                boundFillColor: isDarkMode ? "rgba(0, 123, 255, 0.2)" : "rgba(0, 123, 255, 0.1)"
            };
        };

        // Initial theme colors
        let themeColors = getThemeColors();

        // Prepare datasets
        const datasets = [
            {
                label: "Stage",
                data: combinedStageData,
                borderColor: "#0080FF",
                borderWidth: 4,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                hitRadius: 15,
                segment: {
                    borderDash: ctx => ctx.p0DataIndex >= rawData.past.stage.length ? [5, 5] : undefined
                }
            },
            {
                label: "Forecast + Margin of Error",
                data: rawData.future.upper_bound.map((y, i) => ({ x: labels[rawData.past.stage.length + i], y })),
                borderColor: themeColors.boundBorderColor,
                backgroundColor: themeColors.boundFillColor,
                fill: origin,
                pointRadius: 0,
                hitRadius: 10
            },
            {
                label: "Forecast - Margin of Error",
                data: rawData.future.lower_bound.map((y, i) => ({ x: labels[rawData.past.stage.length + i], y })),
                borderColor: themeColors.boundBorderColor,
                backgroundColor: themeColors.boundFillColor,
                fill: "-1",
                pointRadius: 0,
                hitRadius: 10
            },
        ];

        // Flood stage levels
        const floodStages = rawData.flood_stages;
        const stageLevels = [
            { label: "Watch", color: "#FFC107", level: floodStages.watch },
            { label: "Warning", color: "#FF9800", level: floodStages.warning },
            { label: "Severe Warning", color: "#FF3D00", level: floodStages.severe_warning },
            { label: "Emergency", color: "#D50000", level: floodStages.emergency }
        ];

        stageLevels.forEach(stage => {
            datasets.push({
                label: stage.labels_iso,
                data: labels.map(x => ({ x, y: stage.level })),
                borderColor: stage.color,
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                hitRadius: 10
            });
        });

        // Chart Configuration
        const config = {
            type: "line",
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        text: "River Stage Forecast",
                        display: false
                    },
                    legend: { display: false },
                    annotation: {
                        annotations: {
                            verticalLine: {
                                type: 'line',
                                xMin: new Date(new Date().getTime()).setMinutes(0, 0, 0),
                                xMax: new Date(new Date().getTime()).setMinutes(0, 0, 0),
                                borderColor: themeColors.annotationLineColor,
                                borderWidth: 1,
                                label: {
                                    content: translations.now,
                                    enabled: true,
                                    position: 'top',
                                    color: themeColors.annotationTextColor
                                }
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                const index = tooltipItems[0].dataIndex;
                                return rawData.labels_localized[index] || tooltipItems[0].label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: "day",
                            tooltipFormat: "MMM d"
                        },
                        ticks: {
                            color: themeColors.tickColor,
                            callback: function(value) {
                                const iso = new Date(value).toISOString();
                                return localizedLabelMap[iso] || '';
                            }
                        },
                        grid: {
                            color: themeColors.gridColor
                        }
                    },
                    y: {
                        title: { 
                            display: false, 
                            text: "River level (cm)", 
                            color: themeColors.riverLabelColor 
                        },
                        beginAtZero: false,
                        ticks: { color: themeColors.tickColor },
                        grid: { color: themeColors.gridColor }
                    }
                }
            }
        };

        // Create and render chart
        const chart = new Chart(ctx, config);

        // Ensure it scales correctly
        chart.resize();

        // Observer to update chart on theme change
        const observer = new MutationObserver(() => {
            themeColors = getThemeColors();
            chart.options.scales.x.ticks.color = themeColors.tickColor;
            chart.options.scales.x.grid.color = themeColors.gridColor;
            chart.options.scales.y.ticks.color = themeColors.tickColor;
            chart.options.scales.y.grid.color = themeColors.gridColor;
            chart.options.scales.y.title.color = themeColors.riverLabelColor;
            chart.options.plugins.annotation.annotations.verticalLine.borderColor = themeColors.annotationLineColor;
            chart.options.plugins.annotation.annotations.verticalLine.label.color = themeColors.annotationTextColor;
            chart.data.datasets[1].borderColor = themeColors.boundBorderColor;
            chart.data.datasets[1].backgroundColor = themeColors.boundFillColor;
            chart.data.datasets[2].borderColor = themeColors.boundBorderColor;
            chart.data.datasets[2].backgroundColor = themeColors.boundFillColor;

            chart.update();
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });

        // Update the chart on window resize
        window.addEventListener("resize", () => {
            resizeCanvas();
            chart.update();
        });
    });

    ////////////////////////
    /// Handle the table ///
    ////////////////////////

    document.addEventListener("DOMContentLoaded", function () {
        const tableData = window.stagePrecipitationData;
        let currentPage = 1;
        const rowsPerPage = 18;
        const tableBody = document.querySelector("#dataTable tbody");
        const totalPagesSpan = document.querySelector("#totalPages");
        const currentPageInput = document.querySelector("#currentPage");
        const rowCountSpan = document.querySelector("#rowCount");

        function renderTable(page) {
            tableBody.innerHTML = "";
            let start = (page - 1) * rowsPerPage;
            let end = start + rowsPerPage;
            let paginatedData = tableData.slice(start, end);
        
            paginatedData.forEach(row => {
                let tr = document.createElement("tr");
        
                // Create table cells
                let dateTd = document.createElement("td");
                dateTd.textContent = row.date_localized || "N/A";
        
                let valueMmTd = document.createElement("td");
                valueMmTd.textContent = row.value_mm || "0";
        
                let valueCmTd = document.createElement("td");
                valueCmTd.textContent = row.value_cm || "N/A";

                let lowerBoundCmTd = document.createElement("td");
                lowerBoundCmTd.textContent = row.lower_bound_cm || "N/A";

                let upperBoundCmTd = document.createElement("td");
                upperBoundCmTd.textContent = row.upper_bound_cm || "N/A";
        
                let risingSpeedTd = document.createElement("td");
                risingSpeedTd.textContent = row.rate_cm_per_h || "0";
        
                let floodWarningTd = document.createElement("td");

                if (row.alert_category === "no_alerts") {
                    floodWarningTd.textContent = translations.noAlerts;
                } else if (row.alert_category === "watch") {
                    floodWarningTd.textContent = translations.watch;
                } else if (row.alert_category === "warning") {
                    floodWarningTd.textContent = translations.warning;
                } else if (row.alert_category === "severe_warning") {
                    floodWarningTd.textContent = translations.severeWarning;
                } else if (row.alert_category === "emergency") {
                    floodWarningTd.textContent = translations.emergency;
                } else {
                    floodWarningTd.textContent = "-";
                }
        
                // Apply colors based on the warning level
                const warningColors = {
                    "-": { bg: "transparent"},
                    "no_alerts": { bg: "#80C1FF", color: "#1E1E1E" },
                    "watch": { bg: "#FFC107", color: "#1E1E1E" },
                    "warning": { bg: "#FF9800", color: "#1E1E1E" },
                    "severe_warning": { bg: "#FF3D00", color: "white" },
                    "emergency": { bg: "#D50000", color: "white" }
                };
        
                let style = warningColors[row.alert_category] || warningColors["-"];
                floodWarningTd.style.backgroundColor = style.bg;
                floodWarningTd.style.color = style.color;
        
                // Append cells to row
                tr.appendChild(dateTd);
                tr.appendChild(valueMmTd);
                tr.appendChild(valueCmTd);
                tr.appendChild(lowerBoundCmTd);
                tr.appendChild(upperBoundCmTd);
                tr.appendChild(risingSpeedTd);
                tr.appendChild(floodWarningTd);
        
                // Append row to table body
                tableBody.appendChild(tr);
            });
        
            currentPageInput.value = page;
            totalPagesSpan.textContent = Math.ceil(tableData.length / rowsPerPage);
            rowCountSpan.textContent = `${translations.showing} ${start + 1} ${translations.to} ${Math.min(end, tableData.length)} ${translations.of} ${tableData.length} ${translations.entries}`;
        }        

        document.querySelector("#prevPage").addEventListener("click", function () {
            if (currentPage > 1) {
                currentPage--;
                renderTable(currentPage);
            }
        });

        document.querySelector("#nextPage").addEventListener("click", function () {
            if (currentPage < Math.ceil(tableData.length / rowsPerPage)) {
                currentPage++;
                renderTable(currentPage);
            }
        });

        currentPageInput.addEventListener("change", function () {
            let newPage = parseInt(this.value);
            if (newPage >= 1 && newPage <= Math.ceil(tableData.length / rowsPerPage)) {
                currentPage = newPage;
                renderTable(currentPage);
            } else {
                this.value = currentPage;
            }
        });

        document.querySelector("#exportBtn").addEventListener("click", function () {
            const stageId = document.getElementById("stageId").value;
            let csvContent = "data:text/csv;charset=utf-8,date,time,river_level_cm,lower_error_margin,upper_error_margin,flood_alert_category,rate_cm_per_h,precipitation_mm\n";
            tableData.forEach(row => {
                csvContent += `${row.date_localized || "N/A"},${row.value_cm || "N/A"},${row.lower_bound_cm || "N/A"},${row.upper_bound_cm || "N/A"},${row.alert_category || "-"},${row.rate_cm_per_h || "0"},${row.value_mm || "0"}\n`;
            });

            let encodedUri = encodeURI(csvContent);
            let link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${stageId}_data.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        // Calculate the initial page based on the current time
        const currentTime = new Date().getTime();
        const currentIndex = tableData.findIndex(row => new Date(row.date_iso).getTime() >= currentTime);
        currentPage = Math.ceil((currentIndex + 1) / rowsPerPage);

        renderTable(currentPage);
    });

})();
