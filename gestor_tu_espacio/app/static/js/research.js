(function () {
  var searchForm = document.getElementById('research-search-form');
  var searchInput = document.getElementById('research-search-input');
  var searchStatus = document.getElementById('research-search-status');
  var resultsList = document.getElementById('research-results-list');
  var resultsSection = document.getElementById('research-results-section');
  var hintButtons = document.querySelectorAll('.mod-research-search__hint-btn');

  var mlCategories = document.querySelectorAll('#ml-categories .mod-ml-category');
  var mlResults = document.getElementById('ml-results');
  var tabButtons = document.querySelectorAll('.mod-research-tab');

  var playgroundCategories = document.querySelectorAll('#playground-categories .mod-ml-category');
  var playgroundCode = document.getElementById('playground-code');
  var playgroundOutput = document.getElementById('playground-output');
  var playgroundExplanation = document.getElementById('playground-explanation');
  var runCodeBtn = document.getElementById('run-code');
  var clearOutputBtn = document.getElementById('clear-output');

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

  var exercises = {
    regression: {
      code: "import numpy as np\n\n# Datos de ejemplo: años de experiencia vs salario\nX = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])\ny = np.array([30, 35, 42, 48, 52, 58, 65, 72, 78, 85])\n\n# Calcular pendiente (m) y ordenada (b)\nn = len(X)\nmedia_x = np.mean(X)\nmedia_y = np.mean(y)\n\nnumerador = np.sum((X - media_x) * (y - media_y))\ndenominador = np.sum((X - media_x) ** 2)\n\nm = numerador / denominador\nb = media_y - m * media_x\n\nprint(f\"Modelo: y = {m:.2f}x + {b:.2f}\")\nprint(f\"Pendiente: {m:.2f}\")\nprint(f\"Ordenada: {b:.2f}\")\n\n# Predicción\nx_nuevo = 12\nprediccion = m * x_nuevo + b\nprint(f\"\\nPredicción para {x_nuevo} años: ${prediccion:.2f}k\")\n\n# Error cuadrático medio\ny_pred = m * X + b\nmse = np.mean((y - y_pred) ** 2)\nprint(f\"MSE: {mse:.2f}\")",
      explanation: "<h3>Regresión Lineal</h3><p>La regresión lineal encuentra la mejor línea que ajusta tus datos. Minimiza la suma de errores al cuadrado.</p><ul><li><strong>m (pendiente):</strong> Cuánto cambia Y cuando X aumenta 1 unidad</li><li><strong>b (intercepto):</strong> Valor de Y cuando X = 0</li><li><strong>MSE:</strong> Error cuadrático medio - menor es mejor</li></ul>"
    },
    classification: {
      code: "import numpy as np\n\n# Dataset: [estudio_horas, asistencia] -> [aprobado]\ndatos = np.array([\n    [2, 50, 0],   # poco estudio, baja asistencia -> reprobado\n    [3, 60, 0],\n    [5, 70, 1],   # suficiente estudio -> aprobado\n    [6, 80, 1],\n    [8, 90, 1],\n    [1, 40, 0],\n    [7, 85, 1],\n    [4, 65, 0],\n])\n\nX = datos[:, :2]\ny = datos[:, 2]\n\n# K-Nearest Neighbors simple\ndef distancia(a, b):\n    return np.sqrt(np.sum((a - b) ** 2))\n\ndef predecir(X_train, y_train, x_test, k=3):\n    distancias = [distancia(x, x_test) for x in X_train]\n    indices = np.argsort(distancias)[:k]\n    vecinos = y_train[indices]\n    return np.round(np.mean(vecinos))\n\n# Probar con nuevo estudiante\nnuevo = np.array([5, 75])\nprediccion = predecir(X, y, nuevo, k=3)\nprint(f\"Estudiante con {nuevo[0]}h estudio, {nuevo[1]}% asistencia\")\nprint(f\"Predicción: {'APRUEBA' if prediccion == 1 else 'REPRUEBA'}\")\n\n# Precisión del modelo\ncorrectos = 0\nfor i in range(len(X)):\n    X_train = np.delete(X, i, axis=0)\n    y_train = np.delete(y, i)\n    pred = predecir(X_train, y_train, X[i], k=3)\n    if pred == y[i]:\n        correctos += 1\n\nprecision = correctos / len(X) * 100\nprint(f\"\\nPrecisión (leave-one-out): {precision:.1f}%\")",
      explanation: "<h3>Clasificación K-NN</h3><p>K-Nearest Neighbors clasifica basándose en los K puntos más cercanos.</p><ul><li><strong>k:</strong> Número de vecinos a considerar</li><li><strong>Distancia:</strong> Usamos distancia euclidiana</li><li><strong>Votación:</strong> La clase mayoritaria gana</li></ul>"
    },
    clustering: {
      code: "import numpy as np\n\n# Datos: puntos en 2D\nX = np.array([\n    [1, 2], [1, 3], [2, 1], [2, 3],\n    [8, 8], [8, 9], [9, 8], [9, 9],\n    [5, 5], [5, 6], [6, 5], [6, 6]\n])\n\ndef kmeans(X, k=3, max_iter=100):\n    # Inicializar centroides aleatoriamente\n    indices = np.random.choice(len(X), k, replace=False)\n    centroides = X[indices].copy()\n    \n    for _ in range(max_iter):\n        # Asignar puntos al centroide más cercano\n        etiquetas = []\n        for x in X:\n            distancias = [np.linalg.norm(x - c) for c in centroides]\n            etiquetas.append(np.argmin(distancias))\n        etiquetas = np.array(etiquetas)\n        \n        # Actualizar centroides\n        nuevos_centroides = []\n        for i in range(k):\n            puntos = X[etiquetas == i]\n            if len(puntos) > 0:\n                nuevos_centroides.append(puntos.mean(axis=0))\n            else:\n                nuevos_centroides.append(centroides[i])\n        nuevos_centroides = np.array(nuevos_centroides)\n        \n        # Convergencia\n        if np.allclose(centroides, nuevos_centroides):\n            break\n        centroides = nuevos_centroides\n    \n    return etiquetas, centroides\n\netiquetas, centroides = kmeans(X, k=3)\n\nprint(\"Resultados del clustering:\")\nfor i in range(len(X)):\n    print(f\"Punto {X[i]} -> Cluster {etiquetas[i]}\")\n\nprint(f\"\\nCentroides finales:\")\nfor i, c in enumerate(centroides):\n    print(f\"  Cluster {i}: {c}\")",
      explanation: "<h3>Clustering K-Means</h3><p>K-Means agrupa datos en K clusters minimizando la distancia a los centroides.</p><ul><li><strong>Inicialización:</strong> Elegir K puntos aleatorios como centros</li><li><strong>Asignación:</strong> Cada punto va al cluster del centroide más cercano</li><li><strong>Actualización:</strong> Recalcular centroides como promedio del cluster</li><li><strong>Repetir:</strong> Hasta que los centroides no cambien</li></ul>"
    },
    neural: {
      code: "import numpy as np\n\n# Funciones de activación\ndef sigmoid(x):\n    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))\n\ndef sigmoid_deriv(x):\n    return x * (1 - x)\n\n# Dataset XOR (el problema imposible para perceptrón simple)\nX = np.array([\n    [0, 0],\n    [0, 1],\n    [1, 0],\n    [1, 1]\n])\ny = np.array([\n    [0],\n    [1],\n    [1],\n    [0]\n])\n\n# Red neuronal: 2 entradas -> 4 ocultas -> 1 salida\nnp.random.seed(42)\nW1 = np.random.randn(2, 4) * 0.5\nb1 = np.zeros((1, 4))\nW2 = np.random.randn(4, 1) * 0.5\nb2 = np.zeros((1, 1))\n\n# Entrenamiento\nfor epoca in range(10000):\n    # Forward\n    z1 = X @ W1 + b1\n    a1 = sigmoid(z1)\n    z2 = a1 @ W2 + b2\n    a2 = sigmoid(z2)\n    \n    # Backpropagation\n    error = y - a2\n    delta2 = error * sigmoid_deriv(a2)\n    delta1 = (delta2 @ W2.T) * sigmoid_deriv(a1)\n    \n    # Actualizar pesos\n    W2 += a1.T @ delta2 * 0.5\n    b2 += delta2.sum(axis=0, keepdims=True) * 0.5\n    W1 += X.T @ delta1 * 0.5\n    b1 += delta1.sum(axis=0, keepdims=True) * 0.5\n\n# Resultados\nprint(\"Red neuronal entrenada para XOR\")\nprint(\"Entradas -> Predicción\")\nfor i in range(len(X)):\n    z1 = X[i:i+1] @ W1 + b1\n    a1 = sigmoid(z1)\n    z2 = a1 @ W2 + b2\n    pred = sigmoid(z2)[0, 0]\n    print(f\"  {X[i]} -> {pred:.4f} ({'1' if pred > 0.5 else '0'})\")",
      explanation: "<h3>Red Neuronal - XOR</h3><p>Una red neuronal con capa oculta puede resolver el problema XOR (imposible con una sola neurona).</p><ul><li><strong>Arquitectura:</strong> 2 entradas → 4 ocultas → 1 salida</li><li><strong>Activación:</strong> Sigmoid para outputs entre 0 y 1</li><li><strong>Backpropagation:</strong> Ajusta pesos minimizando el error</li><li><strong>Epocas:</strong> 10000 iteraciones de entrenamiento</li></ul>"
    }
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
      document.getElementById('tab-playground').style.display = tabName === 'playground' ? 'block' : 'none';
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

  // Playground category switching
  playgroundCategories.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var exercise = btn.getAttribute('data-exercise');
      playgroundCategories.forEach(function (b) {
        b.classList.remove('mod-ml-category--active');
      });
      btn.classList.add('mod-ml-category--active');
      loadExercise(exercise);
    });
  });

  // Load exercise
  function loadExercise(exerciseName) {
    var ex = exercises[exerciseName];
    if (!ex) return;
    if (playgroundCode) playgroundCode.value = ex.code;
    if (playgroundExplanation) playgroundExplanation.innerHTML = ex.explanation;
    if (playgroundOutput) playgroundOutput.textContent = '// Presiona "Ejecutar" para ver la salida';
  }

  // Run code (simulated)
  if (runCodeBtn) {
    runCodeBtn.addEventListener('click', function () {
      if (!playgroundOutput) return;
      playgroundOutput.textContent = '// ⚠️ Ejecutando en navegador (simulado)\n\n' + 
        'Para ejecutar código real, necesitas un backend Python.\n\n' +
        'Código que ejecutaría:\n\n' + 
        (playgroundCode ? playgroundCode.value : '') + 
        '\n\n--- RESULTADOS SIMULADOS ---\n\n' +
        'Los ejercicios están diseñados para:\n' +
        '• Entender los algoritmos conceptualmente\n' +
        '• Ver la lógica sin instalar librerías\n' +
        '• Prepararte para implementar en Python real';
    });
  }

  // Clear output
  if (clearOutputBtn) {
    clearOutputBtn.addEventListener('click', function () {
      if (playgroundOutput) playgroundOutput.textContent = '';
    });
  }

  // Initial ML render
  if (mlResults) {
    renderMLCategory('fundamentos');
  }

  // Initial playground load
  if (playgroundCode) {
    loadExercise('regression');
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