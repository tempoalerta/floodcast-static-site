/* globals Chart:false */
/* global bootstrap: false */

(() => {
  'use strict'

  
  /////////////////////////////////////////////////////////////
  // Handle collapse button arrow toggle from top menu items //
  /////////////////////////////////////////////////////////////

  document.addEventListener("DOMContentLoaded", function () {
    const collapseButtons = document.querySelectorAll('[data-bs-toggle="collapse"]');
  
    collapseButtons.forEach(button => {
      const targetId = button.getAttribute('data-bs-target');
      const targetElement = document.querySelector(targetId);
      const arrowIcon = button.querySelector('.arrow-icon');
      
      // Get icon URLs from data attributes
      const expandedIcon = button.getAttribute('data-expanded-icon');
      const collapsedIcon = button.getAttribute('data-collapsed-icon');
  
      // Event listener for expanding the collapse
      targetElement.addEventListener('shown.bs.collapse', function () {
        arrowIcon.setAttribute('src', expandedIcon);
      });
  
      // Event listener for collapsing the collapse
      targetElement.addEventListener('hidden.bs.collapse', function () {
        arrowIcon.setAttribute('src', collapsedIcon);
      });
    });
  });


  /////////////////////////////////////////
  // Handle station search functionality //
  /////////////////////////////////////////

  function filterStations() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('station-search');
    filter = input.value.toUpperCase();
    ul = document.getElementById('station-search-engine');
    li = ul.getElementsByClassName('station-item');
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("a")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
  document.getElementById('station-search').addEventListener('keyup', filterStations);


  /////////////////////////////
  // Handle dark mode toggle //
  /////////////////////////////

  document.addEventListener("DOMContentLoaded", function () {
    const themeSwitcher = document.getElementById("theme-switcher");
    const themeIcon = document.getElementById("theme-icon");
  
    if (themeSwitcher && themeIcon) {
      const darkModeIcon = themeSwitcher.getAttribute("data-dark-icon");
      const lightModeIcon = themeSwitcher.getAttribute("data-light-icon");
  
      // Check initial theme and update icon accordingly
      function updateThemeIcon() {
        const currentTheme = document.documentElement.getAttribute("data-bs-theme");
        if (currentTheme === "dark") {
          themeIcon.setAttribute("src", darkModeIcon);
        } else {
          themeIcon.setAttribute("src", lightModeIcon);
        }
      }
  
      updateThemeIcon();
  
      // Add event listener for the click event
      themeSwitcher.addEventListener("click", function (e) {
        e.preventDefault();
        let currentTheme = document.documentElement.getAttribute("data-bs-theme");
  
        if (currentTheme === "dark") {
          document.documentElement.setAttribute("data-bs-theme", "light");
          localStorage.setItem("theme", "light");
          themeIcon.setAttribute("src", lightModeIcon);
        } else {
          document.documentElement.setAttribute("data-bs-theme", "dark");
          localStorage.setItem("theme", "dark");
          themeIcon.setAttribute("src", darkModeIcon);
        }
      });
  
      // Sync with stored theme preference
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        document.documentElement.setAttribute("data-bs-theme", savedTheme);
        updateThemeIcon();
      }
    }
  });

})()