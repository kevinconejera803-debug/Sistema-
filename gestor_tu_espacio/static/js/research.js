(function () {
  var searchForm = document.getElementById('research-search-form');
  var searchInput = document.getElementById('research-search-input');
  var searchStatus = document.getElementById('research-search-status');
  var resultsList = document.getElementById('research-results-list');
  var resultsSection = document.getElementById('research-results-section');
  var hintButtons = document.querySelectorAll('.mod-research-search__hint-btn');

  function formatResults(data) {
    if (!resultsList || !data.results || !data.results.length) {
      resultsList.innerHTML = '<p style="padding:1rem; color: rgba(255,255,255,0.72);">No se encontraron resultados. Intenta con otros términos.</p>';
      return;
    }

    resultsList.innerHTML = '';
    data.results.forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'mod-research-result';
      card.innerHTML =
        '<h3 class="mod-research-result__title"><a href="' + item.url + '" target="_blank" rel="noopener">' + item.title + '</a></h3>' +
        '<div class="mod-research-result__meta">' +
          '<div class="mod-research-result__meta-item"><span>✍</span> <span>' + item.authors + '</span></div>' +
          '<div class="mod-research-result__meta-item"><span>📅</span> <span>' + item.year + '</span></div>' +
          '<div class="mod-research-result__meta-item"><span>🏛</span> <span>' + item.source + '</span></div>' +
        '</div>' +
        '<p class="mod-research-result__summary">' + item.summary + '</p>';
      resultsList.appendChild(card);
    });
  }

  function performSearch(query) {
    if (!query || !query.trim()) {
      searchStatus.textContent = 'Ingresa un término de búsqueda válido.';
      resultsSection.style.display = 'none';
      return;
    }

    searchStatus.textContent = 'Buscando fuentes confiables…';
    resultsSection.style.display = 'grid';

    fetch('/api/research?q=' + encodeURIComponent(query))
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.error) {
          searchStatus.textContent = 'Error: ' + data.error;
          resultsList.innerHTML = '';
          return;
        }
        searchStatus.textContent = 'Se encontraron resultados académicos verificados.';
        formatResults(data);
      })
      .catch(function () {
        searchStatus.textContent = 'No fue posible conectar. Verifica tu conexión a internet.';
        resultsList.innerHTML = '';
      });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var query = searchInput.value.trim();
      performSearch(query);
    });
  }

  hintButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var query = btn.getAttribute('data-query');
      searchInput.value = query;
      performSearch(query);
    });
  });
})();
