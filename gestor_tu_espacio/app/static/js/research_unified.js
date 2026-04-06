(function () {
  var searchInput = document.getElementById('unified-search');
  var searchBtn = document.getElementById('unified-search-btn');
  var aiBtn = document.getElementById('ai-ask-btn');
  var resultsContainer = document.getElementById('unified-results');
  var resultsContent = document.getElementById('results-content');
  var resultsType = document.getElementById('results-type');
  var closeResults = document.getElementById('close-results');
  var categoryCards = document.querySelectorAll('.category-card');
  var categoryContent = document.getElementById('category-content');
  var categoryResults = document.getElementById('category-results');
  var categoryTitle = document.getElementById('category-title');
  var backBtn = document.getElementById('back-categories');
  var suggestionTags = document.querySelectorAll('.suggestion-tag');

  var corpus = {
    fundamentos: [
      { title: "Machine Learning Definición", url: "#", summary: "El ML es una rama de la IA que permite a las máquinas aprender de datos sin programación explícita. Incluye aprendizaje supervisado, no supervisado y por refuerzo.", tags: ["fundamentos", "básico"] },
      { title: "Tipos de Aprendizaje", url: "#", summary: "1) Supervisado: con etiquetas. 2) No supervisado: sin etiquetas (clustering). 3) Refuerzo: con recompensas.", tags: ["tipos", "aprendizaje"] },
      { title: "Regresión Lineal", url: "#", summary: "Modelo que encuentra la relación lineal entre variables. Usado para predicciones continuas. Ejemplo: predecir precios.", tags: ["regresión", "básico"] },
      { title: "Clasificación K-NN", url: "#", summary: "K-Nearest Neighbors clasifica basándose en los K puntos más cercanos. Simple pero efectivo para datasets pequeños.", tags: ["clasificación", "básico"] },
      { title: "Métricas de Evaluación", url: "#", summary: "Accuracy, Precision, Recall, F1-Score, AUC-ROC. Cada una mide diferentes aspectos del modelo.", tags: ["métricas", "evaluación"] },
      { title: "Sobreajuste (Overfitting)", url: "#", summary: "Cuando el modelo memoriza los datos de entrenamiento en lugar de aprender patrones generales. Se evita con regularización.", tags: ["problemas", "básico"] },
    ],
    modelos: [
      { title: "Redes Neuronales Feedforward", url: "#", summary: "Arquitectura básica donde la información fluye en una dirección. Capas: entrada, ocultas, salida.", tags: ["redes", "profundo"] },
      { title: "CNN - Redes Convolucionales", url: "#", summary: "Especializadas en procesamiento de imágenes. Usan filtros convolucionales para detectar características visuales.", tags: ["vision", "imágenes"] },
      { title: "RNN - Redes Recurrentes", url: "#", summary: "Ideales para secuencias y datos temporales. Tienen memoria de estados anteriores. LSTM y GRU mejoran el gradient vanishing.", tags: ["secuencias", "texto"] },
      { title: "Transformers", url: "#", summary: "Arquitectura basada en mecanismo de atención. Base de BERT, GPT, T5. Revolucionó NLP en 2017.", tags: ["NLP", "estado del arte"] },
      { title: "XGBoost y Gradient Boosting", url: "#", summary: "Método ensemble que combina múltiples árboles débiles. Ganador de muchas competencias de Kaggle.", tags: ["ensemble", "árboles"] },
      { title: "Autoencoders", url: "#", summary: "Redes para compresión y detección de anomalías. Aprenden a codificar datos en representación latente.", tags: ["representación", "no supervisado"] },
    ],
    seguridad: [
      { title: "Contraseñas Seguras", url: "#", summary: "Mínimo 12 caracteres, mix mayúsculas/minúsculas/números/símbolos. Usar gestor de contraseñas. Nunca reutilizar.", tags: ["básico", "contraseñas"] },
      { title: "Autenticación de Dos Factores (2FA)", url: "#", summary: "Añadir segunda capa de seguridad. Preferir autenticadores (Google, Authy) sobre SMS. Hardware keys más seguras.", tags: ["básico", "autenticación"] },
      { title: "Phishing y Ingeniería Social", url: "#", summary: "Correos falsos que robaban credenciales. Verificar remitente, no hacer clic en enlaces sospechosos, Reportar.", tags: ["amenazas", "prevención"] },
      { title: "Cifrado de Datos", url: "#", summary: "En reposo (AES-256) y en tránsito (TLS). BitLocker para disco, HTTPS para web.Protege confidencialidad.", tags: ["cifrado", "protección"] },
      { title: "Firewall y Redes", url: "#", summary: "Filtrar tráfico no deseado. Usar VPN en redes públicas. Mantener software actualizado.", tags: ["redes", "defensa"] },
      { title: "Responder a Incidentes", url: "#", summary: "1) Identificar. 2) Contener. 3) Erradicar. 4) Recuperar. 5) Documentar. Contactar a CERT si es grave.", tags: ["respuesta", "procedimientos"] },
    ],
    python: [
      { title: "NumPy - Computación Científica", url: "#", summary: "Biblioteca fundamental para cálculos numéricos. Arrays multidimensionales, operaciones vectorizadas.", tags: ["librería", "básico"] },
      { title: "Pandas - Análisis de Datos", url: "#", summary: "DataFrames para manipulación de datos tabulares. filtering, grouping, merging.", tags: ["librería", "básico"] },
      { title: "Scikit-learn - ML Clásico", url: "#", summary: "Algoritmos de ML listos para usar. Regresión, clasificación, clustering, validación cruzada.", tags: ["librería", "machine learning"] },
      { title: "TensorFlow y Keras", url: "#", summary: "Framework de Google para deep learning. Keras como API de alto nivel. Graphs, eager execution.", tags: ["librería", "deep learning"] },
      { title: "PyTorch - Deep Learning", url: "#", summary: "Framework de Meta. Dynamic graphs, debug-friendly. Favorito en investigación.", tags: ["librería", "deep learning"] },
      { title: "Matplotlib y Seaborn - Visualización", url: "#", summary: "Crear gráficos estáticos, animados, interactivos. Seaborn para estadísticas.", tags: ["librería", "visualización"] },
    ],
    data: [
      { title: "Limpieza de Datos", url: "#", summary: "Manejar valores nulos, duplicados, outliers. Transformar tipos. Feature engineering.", tags: ["preprocesamiento", "esencial"] },
      { title: "EDA - Análisis Exploratorio", url: "#", summary: "Análisis visual y estadístico antes de modelar. Histogramas, correlaciones, resúmenes.", tags: ["análisis", "exploración"] },
      { title: "Feature Engineering", url: "#", summary: "Crear nuevas features desde datos crudos. Encoding categórico, scaling, selección de features.", tags: ["preprocesamiento", "avanzado"] },
      { title: "Validación Cruzada", url: "#", summary: "K-Fold Cross Validation para evaluar modelos. Evita overfitting. Mide generalización.", tags: ["evaluación", "metodología"] },
      { title: "Imbalance de Clases", url: "#", summary: "Cuando una clase tiene muchos más ejemplos. Técnicas: SMOTE, class weights, undersampling.", tags: ["problemas", "avanzado"] },
      { title: "Pipelines de ML", url: "#", summary: "Automatizar flujo: preprocesamiento → entrenamiento → evaluación. Sklearn pipelines.", tags: ["buenas prácticas", "producción"] },
    ],
    proyectos: [
      { title: "Clasificación de Imágenes (CNN)", url: "#", summary: "Dataset MNIST/CIFAR. Arquitectura simple: Conv2D → MaxPool → Dense.", tags: ["computer vision", "principiante"] },
      { title: "Chatbot con Transformers", url: "#", summary: "Fine-tune de modelo pre-entrenado para conversaciones. Hugging Face Transformers.", tags: ["NLP", "intermedio"] },
      { title: "Recomendador de Películas", url: "#", summary: "Collaborative filtering con Matrix Factorization. Dataset MovieLens.", tags: ["recomendación", "intermedio"] },
      { title: "Predicción de Ventas", url: "#", summary: "Series temporales con LSTM o Prophet. Datos de tienda/e-commerce.", tags: ["series temporales", "intermedio"] },
      { title: "Detección de Fraudes", url: "#", summary: "Clasificación binaria con datos desbalanceados. Métricas: Precision/Recall.", tags: [" finanzas", "avanzado"] },
      { title: "Segmentación de Clientes", url: "#", summary: "K-Means o DBSCAN para clustering de clientes según comportamiento.", tags: ["marketing", "negocios"] },
    ]
  };

  function isAIQuery(query) {
    var aiIndicators = ['qué es', 'cómo', 'por qué', 'explica', 'dime', 'quiero saber', 'resumen', 'diferencia entre', 'ventajas', 'desventajas', 'ejemplo', '-tutorial', 'guía'];
    var lower = query.toLowerCase();
    return aiIndicators.some(function(ind) { return lower.includes(ind); });
  }

  function searchCorpus(query) {
    var results = [];
    var terms = query.toLowerCase().split(' ');
    
    for (var cat in corpus) {
      corpus[cat].forEach(function(item) {
        var score = 0;
        var titleLower = item.title.toLowerCase();
        var summaryLower = item.summary.toLowerCase();
        var tagsLower = item.tags.join(' ');
        
        terms.forEach(function(term) {
          if (term.length < 3) return;
          if (titleLower.includes(term)) score += 5;
          if (summaryLower.includes(term)) score += 2;
          if (tagsLower.includes(term)) score += 3;
        });
        
        if (score > 0) {
          results.push({ item: item, category: cat, score: score });
        }
      });
    }
    
    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, 10);
  }

  function renderResults(results, type, isAI) {
    if (results.length === 0) {
      resultsContent.innerHTML = '<div class="no-results">No se encontraron resultados. Intenta con otros términos o haz una pregunta directa al AI.</div>';
      return;
    }
    
    var html = '';
    if (isAI) {
      html += '<div class="ai-intro">🤖 <strong>Respuesta inteligente:</strong></div>';
    }
    
    results.forEach(function(r) {
      var item = r.item;
      html += '<div class="result-card">';
      html += '<h3 class="result-title">' + item.title + '</h3>';
      html += '<p class="result-summary">' + item.summary + '</p>';
      html += '<div class="result-tags">';
      item.tags.forEach(function(tag) {
        html += '<span class="result-tag">' + tag + '</span>';
      });
      html += '</div></div>';
    });
    
    resultsContent.innerHTML = html;
    resultsContainer.style.display = 'block';
  }

  function performSearch(query, forceAI) {
    if (!query || !query.trim()) return;
    
    var useAI = forceAI || isAIQuery(query);
    
    if (useAI) {
      resultsType.textContent = '🤖 Respuesta AI';
      resultsContent.innerHTML = '<div class="loading">🤔 Pensando...</div>';
      resultsContainer.style.display = 'block';
      
      fetch('/api/ai/ask?q=' + encodeURIComponent(query))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.error) {
            var corpusResults = searchCorpus(query);
            if (corpusResults.length > 0) {
              renderResults(corpusResults, 'Resultados locales', false);
            } else {
              resultsContent.innerHTML = '<div class="error-results">❌ ' + data.error + '</div>';
            }
          } else {
            var aiHtml = '<div class="ai-answer">' + data.answer.replace(/\n/g, '<br>') + '</div>';
            var corpusResults = searchCorpus(query);
            if (corpusResults.length > 0) {
              aiHtml += '<div class="related-label">📚 Recursos relacionados:</div>';
              corpusResults.slice(0, 3).forEach(function(r) {
                aiHtml += '<div class="result-card compact"><h4>' + r.item.title + '</h4><p>' + r.item.summary.substring(0, 100) + '...</p></div>';
              });
            }
            resultsContent.innerHTML = aiHtml;
          }
        })
        .catch(function() {
          var corpusResults = searchCorpus(query);
          renderResults(corpusResults, 'Resultados locales', false);
        });
    } else {
      resultsType.textContent = '📚 Resultados';
      var corpusResults = searchCorpus(query);
      renderResults(corpusResults, 'Resultados', false);
    }
  }

  function showCategory(cat) {
    var data = corpus[cat];
    if (!data) return;
    
    var titles = {
      fundamentos: '📖 Fundamentos de Machine Learning',
      modelos: '🧠 Modelos Avanzados de ML',
      seguridad: '🛡️ Ciberseguridad',
      python: '🐍 Python para ML',
      data: '📊 Data Science',
      proyectos: '🚀 Proyectos Prácticos'
    };
    
    categoryTitle.textContent = titles[cat] || cat;
    
    var html = '';
    data.forEach(function(item) {
      html += '<div class="category-result-card">';
      html += '<h3>' + item.title + '</h3>';
      html += '<p>' + item.summary + '</p>';
      html += '<div class="result-tags">';
      item.tags.forEach(function(tag) {
        html += '<span class="result-tag">' + tag + '</span>';
      });
      html += '</div></div>';
    });
    
    categoryResults.innerHTML = html;
    categoryContent.style.display = 'block';
  }

  // Event Listeners
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      performSearch(searchInput.value, false);
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch(searchInput.value, false);
      }
    });
  }
  
  if (aiBtn) {
    aiBtn.addEventListener('click', function() {
      var q = searchInput.value.trim();
      if (q) {
        performSearch(q, true);
      } else {
        searchInput.placeholder = 'Escribe tu pregunta para el AI...';
        searchInput.focus();
      }
    });
  }
  
  if (closeResults) {
    closeResults.addEventListener('click', function() {
      resultsContainer.style.display = 'none';
    });
  }
  
  categoryCards.forEach(function(card) {
    card.addEventListener('click', function() {
      var cat = card.getAttribute('data-category');
      showCategory(cat);
    });
  });
  
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      categoryContent.style.display = 'none';
    });
  }
  
  suggestionTags.forEach(function(tag) {
    tag.addEventListener('click', function() {
      var q = tag.getAttribute('data-q');
      searchInput.value = q;
      performSearch(q, false);
    });
  });
})();