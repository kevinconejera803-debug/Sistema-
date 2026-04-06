(function () {
  var searchForm = document.getElementById('research-search-form');
  var searchInput = document.getElementById('research-search-input');
  var searchStatus = document.getElementById('research-search-status');
  var resultsList = document.getElementById('research-results-list');
  var resultsSection = document.getElementById('research-results-section');
  var hintButtons = document.querySelectorAll('.mod-research-search__hint-btn');

  var mlCategories = document.querySelectorAll('.mod-ml-category');
  var mlResults = document.getElementById('ml-results');
  var tabButtons = document.querySelectorAll('.mod-research-tab');

  var mlData = {
    fundamentos: [
      { title: "Neural Networks and Deep Learning", authors: "Stanford CS231n", year: "2024", source: "Stanford", url: "https://cs231n.github.io/", summary: "Curso completo de redes neuronales y aprendizaje profundo con ejercicios prácticos.", tags: ["redes neuronales", "deep learning", "CNN", "fundamentos"] },
      { title: "Machine Learning Specialization", authors: "Andrew Ng / DeepLearning.AI", year: "2024", source: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-introduction", summary: "Especialización completa desde fundamentos hasta modelos avanzados.", tags: ["machine learning", "supervisado", "regresión", "clasificación"] },
      { title: "Mathematics for Machine Learning", authors: "Imperial College London", year: "2023", source: "Coursera", url: "https://www.coursera.org/specializations/mathematics-machine-learning", summary: "Fundamentos matemáticos: álgebra lineal, cálculo y probabilidad para ML.", tags: ["matemáticas", "álgebra", "probabilidad", "fundamentos"] },
      { title: "Probabilistic ML", authors: "University of Cambridge", year: "2024", source: "Cambridge", url: "https://probml.github.io/", summary: "Enfoque probabilístico para machine learning con modelos gráficos y inferencia.", tags: ["probabilidad", "bayesiano", "modelos gráficos"] },
    ],
    modelos: [
      { title: "Transformers: Attention Is All You Need", authors: "Vaswani et al.", year: "2017", source: "arXiv", url: "https://arxiv.org/abs/1706.03762", summary: "Paper original que introdujo la arquitectura Transformer y el mecanismo de atención.", tags: ["transformer", "atención", "NLP", "BERT", "GPT"] },
      { title: "Convolutional Neural Networks", authors: "LeCun et al.", year: "1998", source: "IEEE", url: "https://ieeexplore.ieee.org/document/726791", summary: "Paper fundacional de CNNs para reconocimiento de dígitos handwritten.", tags: ["CNN", "convolución", "computer vision"] },
      { title: "Generative Adversarial Networks", authors: "Goodfellow et al.", year: "2014", source: "arXiv", url: "https://arxiv.org/abs/1406.2661", summary: "Paper original de GANs: dos redes enfrentadas para generación de datos sintéticos.", tags: ["GAN", "generativo", "imágenes"] },
      { title: "ResNet: Deep Residual Learning", authors: "He et al.", year: "2016", source: "arXiv", url: "https://arxiv.org/abs/1512.03385", summary: "Arquitectura ResNet con conexiones residuales que permitieron redes más profundas.", tags: ["ResNet", "residuales", "computer vision"] },
      { title: "Reinforcement Learning: An Introduction", authors: "Sutton & Barto", year: "2018", source: "MIT Press", url: "http://incompleteideas.net/book/the-book-2nd.html", summary: "Libro de referencia definitivo sobre aprendizaje por refuerzo.", tags: ["RL", "Q-learning", "políticas"] },
      { title: "XGBoost: A Scalable Tree Boosting System", authors: "Chen & Guestrin", year: "2016", source: "KDD", url: "https://arxiv.org/abs/1603.02754", summary: "Paper de XGBoost, el algoritmo más exitoso en competencias de Kaggle.", tags: ["XGBoost", "ensemble", "gradient boosting"] },
    ],
    recursos: [
      { title: "Papers With Code", authors: "Machine Learning Community", year: "2024", source: "paperswithcode.com", url: "https://paperswithcode.com/", summary: "Papers de ML con código implementado y benchmarks actualizados.", tags: ["papers", "código", "benchmarks", "SOTA"] },
      { title: "Kaggle Competitions", authors: "Kaggle", year: "2024", source: "kaggle.com", url: "https://www.kaggle.com/competitions", summary: "Competencias de ML con datasets reales y comunidad activa.", tags: ["competiciones", "datasets", "competencias"] },
      { title: "Hugging Face Hub", authors: "Hugging Face", year: "2024", source: "huggingface.co", url: "https://huggingface.co/models", summary: "Repositorio de modelos pre-entrenados, datasets y demos de NLP y CV.", tags: ["transformers", "NLP", "modelos", "BERT"] },
      { title: "PyTorch Documentation", authors: "Meta AI", year: "2024", source: "pytorch.org", url: "https://pytorch.org/docs/", summary: "Documentación oficial de PyTorch con tutoriales y ejemplos.", tags: ["PyTorch", "tutoriales", "deep learning"] },
      { title: "TensorFlow Hub", authors: "Google", year: "2024", source: "tensorflow.org", url: "https://www.tensorflow.org/hub", summary: "Biblioteca de modelos pre-entrenados de Google.", tags: ["TensorFlow", "modelos", "TF Lite"] },
    ],
    proyectos: [
      { title: "Loan Default Prediction", authors: "Kaggle Dataset", year: "2024", source: "Kaggle", url: "https://www.kaggle.com/datasets/gauravduttakiit/loan-default-prediction", summary: "Predecir morosidad en préstamos usando modelos de clasificación.", tags: ["clasificación", "finanzas", "XGBoost"] },
      { title: "Customer Churn Analysis", authors: "Telco Dataset", year: "2024", source: "Kaggle", url: "https://www.kaggle.com/competitions/home-credit-default-risk", summary: "Predecir cancelación de clientes con modelos de supervivencia.", tags: ["churn", "clasificación", "boosting"] },
      { title: "Stock Price Forecasting", authors: "Time Series Project", year: "2024", source: "GitHub", url: "https://github.com/jaidevd/stock_prediction", summary: "Pronóstico de precios usando LSTM y modelos de series temporales.", tags: ["LSTM", "series temporales", "finanzas"] },
      { title: "Sentiment Analysis on Reviews", authors: "NLP Project", year: "2024", source: "Hugging Face", url: "https://huggingface.co/datasets/sentiment140", summary: "Análisis de sentimiento con BERT y modelos transformers.", tags: ["NLP", "BERT", "sentimiento"] },
      { title: "Object Detection with YOLO", authors: "Computer Vision Project", year: "2024", source: "Ultralytics", url: "https://docs.ultralytics.com/", summary: "Detector de objetos en tiempo real usando YOLOv8.", tags: ["YOLO", "computer vision", "detección"] },
      { title: "Recommendation System", authors: "MovieLens Project", year: "2024", source: "GitHub", url: "https://github.com/Netflix/recommender", summary: "Sistema de recomendación collaborative filtering y content-based.", tags: ["recomendación", "collaborative", "Netflix"] },
    ]
  };

  function formatResults(data) {
    if (!resultsList || !data.results || !data.results.length) {
      resultsList.innerHTML = '<p style="padding:1rem; color: rgba(255,255,255,0.72);">No se encontraron resultados. Intenta con otros términos.</p>';
      return;
    }

    resultsList.innerHTML = '';
    data.results.forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'mod-research-result';
      var categoryBadge = item.category 
        ? '<span class="mod-research-result__category">' + item.category + '</span>' 
        : '';
      card.innerHTML =
        categoryBadge +
        '<h3 class="mod-research-result__title"><a href="' + item.url + '" target="_blank" rel="noopener">' + item.title + '</a></h3>' +
        '<div class="mod-research-result__meta">' +
          '<div class="mod-research-result__meta-item"><span>✍</span> <span>' + item.authors + '</span></div>' +
          '<div class="mod-research-result__meta-item"><span>📅</span> <span>' + item.year + '</span></div>' +
          '<div class="mod-research-result__meta-item"><span>🏛</span> <span>' + item.source + '</span></div>' +
        '</div>' +
        '<p class="mod-research-result__summary">' + item.summary + '</p>' +
        '<a href="' + item.url + '" target="_blank" rel="noopener" class="mod-research-result__link">Leer más →</a>';
      resultsList.appendChild(card);
    });
  }

  function renderMLCategory(category) {
    if (!mlResults) return;
    var items = mlData[category] || [];
    if (items.length === 0) {
      mlResults.innerHTML = '<p style="padding:1rem; color:rgba(255,255,255,0.5)">Sin resultados en esta categoría.</p>';
      return;
    }
    mlResults.innerHTML = '';
    items.forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'mod-ml-card';
      var tagsHtml = item.tags.map(function (tag) {
        return '<span class="mod-ml-tag">' + tag + '</span>';
      }).join('');
      card.innerHTML =
        '<h3 class="mod-ml-card__title"><a href="' + item.url + '" target="_blank" rel="noopener">' + item.title + '</a></h3>' +
        '<div class="mod-ml-card__meta">' +
          '<span>✍ ' + item.authors + '</span>' +
          '<span>📅 ' + item.year + '</span>' +
          '<span>🏛 ' + item.source + '</span>' +
        '</div>' +
        '<p class="mod-ml-card__summary">' + item.summary + '</p>' +
        '<div class="mod-ml-card__tags">' + tagsHtml + '</div>' +
        '<a href="' + item.url + '" target="_blank" rel="noopener" class="mod-ml-card__link">Acceder →</a>';
      mlResults.appendChild(card);
    });
  }

  function performSearch(query) {
    if (!searchStatus || !resultsSection || !resultsList) {
      return;
    }

    if (!query || !query.trim()) {
      searchStatus.textContent = 'Ingresa un término de búsqueda válido.';
      resultsSection.style.display = 'none';
      return;
    }

    searchStatus.textContent = 'Buscando fuentes profesionales…';
    resultsList.innerHTML = '<p style="padding:1rem; color: rgba(255,255,255,0.72);">Cargando resultados...</p>';
    resultsSection.style.display = 'grid';

    fetch('/api/research?q=' + encodeURIComponent(query))
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Respuesta de servidor no válida');
        }
        return response.json();
      })
      .then(function (data) {
        if (data.error) {
          searchStatus.textContent = 'Error: ' + data.error;
          resultsList.innerHTML = '';
          return;
        }

        if (!data.results || !data.results.length) {
          searchStatus.textContent = 'No se encontraron resultados para "' + query + '". Prueba con una variante más amplia.';
          resultsList.innerHTML = '';
          return;
        }

        searchStatus.textContent = data.results.length + ' resultados encontrados en fuentes académicas verificadas.';
        formatResults(data);
      })
      .catch(function () {
        searchStatus.textContent = 'No fue posible conectar. Verifica tu conexión a internet o intenta de nuevo.';
        resultsList.innerHTML = '';
      });
  }

  // Tab switching
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tabName = btn.getAttribute('data-tab');
      tabButtons.forEach(function (b) {
        b.classList.remove('mod-research-tab--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('mod-research-tab--active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById('tab-search').style.display = tabName === 'search' ? 'block' : 'none';
      document.getElementById('tab-ml').style.display = tabName === 'ml' ? 'block' : 'none';
    });
  });

  // ML category switching
  mlCategories.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var category = btn.getAttribute('data-category');
      mlCategories.forEach(function (b) {
        b.classList.remove('mod-ml-category--active');
      });
      btn.classList.add('mod-ml-category--active');
      renderMLCategory(category);
    });
  });

  // Initial ML render
  if (mlResults) {
    renderMLCategory('fundamentos');
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
