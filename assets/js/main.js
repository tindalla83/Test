/* Meridian Viability — small progressive enhancements. */
(function () {
  'use strict';

  // Mobile navigation ------------------------------------------------------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });

    // Close the menu after following an in-page link.
    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Footer year ------------------------------------------------------------
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Enquiry form -----------------------------------------------------------
  // No backend is wired up yet: validate, then hand off to the mail client so
  // the form is never silently swallowed. Replace this block with a POST to
  // your form service (Formspree, Netlify Forms, your own endpoint) when ready.
  var form = document.getElementById('enquiry-form');
  var status = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var subject = 'Viability enquiry — ' + (data.get('enquiry') || 'General');
      var body = [
        'Name: ' + (data.get('name') || ''),
        'Email: ' + (data.get('email') || ''),
        'Organisation: ' + (data.get('organisation') || ''),
        'Enquiry type: ' + (data.get('enquiry') || ''),
        '',
        data.get('message') || ''
      ].join('\n');

      window.location.href =
        'mailto:hello@example.com?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      if (status) {
        status.textContent = 'Opening your email client to send this enquiry…';
      }
    });
  }
})();
