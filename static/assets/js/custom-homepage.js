/* globals Chart:false */
/* global bootstrap: false */

(() => {
  'use strict'

  //////////////////////////////////////////////
  // Handle the navbar items active selection //
  //////////////////////////////////////////////

  document.addEventListener("DOMContentLoaded", function () {
    let navLinks = document.querySelectorAll(".nav-link");

    function updateActiveLink() {
      let currentHash = window.location.hash;
      navLinks.forEach(link => {
        if (link.getAttribute("href") === currentHash) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }

    // Run when the page loads
    updateActiveLink();

    // Run when the hash changes (e.g., user clicks a link)
    window.addEventListener("hashchange", updateActiveLink);
  });
  
})()