// House Type Valuation Tool — front end
// Vanilla JS, no build step, consistent with the rest of the site.
(function () {
  'use strict';

  var form = document.getElementById('valuation-form');
  var rowsContainer = document.getElementById('house-type-rows');
  var addRowBtn = document.getElementById('add-house-type');
  var rowTemplate = document.getElementById('house-type-row-template');
  var formError = document.getElementById('form-error');
  var loading = document.getElementById('loading');
  var submitBtn = document.getElementById('submit-btn');

  var resultsSection = document.getElementById('results-section');
  var resultsLocation = document.getElementById('results-location');
  var resultsMeta = document.getElementById('results-meta');
  var marketOverviewText = document.getElementById('market-overview-text');
  var resultsGrid = document.getElementById('results-grid');
  var cardTemplate = document.getElementById('result-card-template');
  var printBtn = document.getElementById('print-btn');

  var rowCounter = 0;

  function addHouseTypeRow() {
    rowCounter += 1;
    var fragment = rowTemplate.content.cloneNode(true);
    var row = fragment.querySelector('[data-row]');
    row.dataset.rowId = 'row-' + rowCounter;
    row.querySelector('[data-remove]').addEventListener('click', function () {
      // Keep at least one row so the form is never submitted empty.
      if (rowsContainer.children.length > 1) {
        row.remove();
      } else {
        row.querySelectorAll('input').forEach(function (input) { input.value = ''; });
      }
    });
    rowsContainer.appendChild(fragment);
  }

  addRowBtn.addEventListener('click', addHouseTypeRow);

  // Start with one row pre-added.
  addHouseTypeRow();

  function collectHouseTypes() {
    var rows = rowsContainer.querySelectorAll('[data-row]');
    var houseTypes = [];
    rows.forEach(function (row, index) {
      houseTypes.push({
        id: row.dataset.rowId || ('row-' + (index + 1)),
        name: row.querySelector('[data-field="name"]').value.trim(),
        sqft: Number(row.querySelector('[data-field="sqft"]').value),
        bedrooms: Number(row.querySelector('[data-field="bedrooms"]').value),
        parking: row.querySelector('[data-field="parking"]').value,
        typology: row.querySelector('[data-field="typology"]').value,
      });
    });
    return houseTypes;
  }

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  function clearError() {
    formError.hidden = true;
    formError.textContent = '';
  }

  function formatGBP(value) {
    if (typeof value !== 'number' || !isFinite(value)) return '—';
    return '£' + Math.round(value).toLocaleString('en-GB');
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch (e) {
      return iso || '';
    }
  }

  function renderResults(data) {
    resultsLocation.textContent = 'Valuation results for ' + (data.location || '');
    resultsMeta.textContent = 'Generated ' + formatDate(data.generatedAt);
    marketOverviewText.textContent = data.marketOverview || 'No overview was returned.';

    resultsGrid.innerHTML = '';

    (data.results || []).forEach(function (result) {
      var fragment = cardTemplate.content.cloneNode(true);

      fragment.querySelector('[data-name]').textContent = result.name || 'House type';

      var confidenceEl = fragment.querySelector('[data-confidence]');
      var confidence = result.confidence || 'medium';
      confidenceEl.textContent = confidence.charAt(0).toUpperCase() + confidence.slice(1) + ' confidence';
      confidenceEl.classList.add('confidence-badge--' + confidence);

      fragment.querySelector('[data-price]').textContent = formatGBP(result.predictedPrice);

      var range = result.priceRange || {};
      fragment.querySelector('[data-range]').textContent =
        (typeof range.low === 'number' && typeof range.high === 'number')
          ? 'Range: ' + formatGBP(range.low) + ' – ' + formatGBP(range.high)
          : 'Range not available';

      fragment.querySelector('[data-sqft]').textContent =
        typeof result.pricePerSqft === 'number' ? '£' + Math.round(result.pricePerSqft).toLocaleString('en-GB') + ' / sqft' : '';

      fragment.querySelector('[data-summary]').textContent = result.summary || '';

      var comparablesList = fragment.querySelector('[data-comparables]');
      var comparables = Array.isArray(result.comparables) ? result.comparables : [];
      if (comparables.length === 0) {
        var li = document.createElement('li');
        li.textContent = 'No comparables were returned.';
        comparablesList.appendChild(li);
      } else {
        comparables.forEach(function (c) {
          var li = document.createElement('li');
          var priceText = typeof c.price === 'number' ? formatGBP(c.price) : '';
          li.textContent = [c.description, priceText].filter(Boolean).join(' — ');
          if (c.source) {
            var sourceSpan = document.createElement('span');
            sourceSpan.className = 'comparable-source';
            sourceSpan.textContent = ' (' + c.source + ')';
            li.appendChild(sourceSpan);
          }
          comparablesList.appendChild(li);
        });
      }

      resultsGrid.appendChild(fragment);
    });

    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setLoading(isLoading) {
    loading.hidden = !isLoading;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Researching…' : 'Generate valuations';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearError();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var location = document.getElementById('location').value.trim();
    var houseTypes = collectHouseTypes();

    if (!location) {
      showError('Please provide a development location.');
      return;
    }

    if (houseTypes.length === 0) {
      showError('Please add at least one house type.');
      return;
    }

    for (var i = 0; i < houseTypes.length; i++) {
      var ht = houseTypes[i];
      if (!ht.name || !ht.sqft || ht.sqft <= 0 || !ht.bedrooms || ht.bedrooms <= 0) {
        showError('Please complete every field for house type ' + (i + 1) + '.');
        return;
      }
    }

    resultsSection.hidden = true;
    setLoading(true);

    fetch('/api/valuation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: location, houseTypes: houseTypes }),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data && data.error ? data.error : 'Something went wrong. Please try again.');
          }
          return data;
        });
      })
      .then(function (data) {
        renderResults(data);
      })
      .catch(function (err) {
        showError(err.message || 'Something went wrong. Please try again.');
      })
      .finally(function () {
        setLoading(false);
      });
  });

  printBtn.addEventListener('click', function () {
    window.print();
  });
})();
