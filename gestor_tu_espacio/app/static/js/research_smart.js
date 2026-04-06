(function () {
  var searchInput = document.getElementById('smart-search');
  var searchBtn = document.getElementById('smart-search-btn');
  var resultsContainer = document.getElementById('smart-results');
  var resultsContent = document.getElementById('smart-results-content');
  var resultsTitle = document.getElementById('results-title');
  var resultsIcon = document.getElementById('results-icon');
  var closeBtn = document.getElementById('close-smart-results');
  var quickTags = document.querySelectorAll('.quick-tag');

  // IA lista para usar

  var knowledgeBase = [
    { q: "machine learning", a: "Machine Learning (ML) es una rama de la Inteligencia Artificial que permite a las computadoras aprender de datos sin ser programadas explícitamente. Hay 3 tipos principales:\n\n• **Aprendizaje Supervisado**: con etiquetas (clasificación, regresión)\n• **Aprendizaje No Supervisado**: sin etiquetas (clustering, reducción dimensional)\n• **Aprendizaje por Refuerzo**: con recompensas y castigos", tags: ["fundamentos", "básico"] },
    { q: "qué es machine learning", a: "Machine Learning (ML) es una rama de la Inteligencia Artificial que permite a las computadoras aprender de datos sin ser programadas explícitamente. Hay 3 tipos principales:\n\n• **Aprendizaje Supervisado**: con etiquetas (clasificación, regresión)\n• **Aprendizaje No Supervisado**: sin etiquetas (clustering, reducción dimensional)\n• **Aprendizaje por Refuerzo**: con recompensas y castigos", tags: ["fundamentos", "básico"] },
    { q: "deep learning", a: "Deep Learning (Aprendizaje Profundo) es una subrama del ML que usa redes neuronales con muchas capas (deep neural networks). \n\n**Aplicaciones**:\n- Visión por computadora (imágenes, video)\n- NLP (procesamiento de lenguaje)\n- Reconocimiento de voz\n- Generación de texto e imágenes\n\n**Frameworks**: TensorFlow, PyTorch, Keras", tags: ["profundo", "redes"] },
    { q: "qué es deep learning", a: "Deep Learning (Aprendizaje Profundo) es una subrama del ML que usa redes neuronales con muchas capas (deep neural networks). \n\n**Aplicaciones**:\n- Visión por computadora (imágenes, video)\n- NLP (procesamiento de lenguaje)\n- Reconocimiento de voz\n- Generación de texto e imágenes\n\n**Frameworks**: TensorFlow, PyTorch, Keras", tags: ["profundo", "redes"] },
    { q: "redes neuronales", a: "Las Redes Neuronales son algoritmos inspirados en el cerebro biológico. \n\n**Estructura básica**:\n• Capa de entrada (inputs)\n• Capas ocultas (procesamiento)\n• Capa de salida (predicción)\n\n**Tipos**:\n• **Feedforward**: información fluye hacia adelante\n• **CNN**: para imágenes (convolución)\n• **RNN**: para secuencias (recurrencia)\n• **Transformer**: estado del arte en NLP (atención)", tags: ["redes", "profundo"] },
    { q: "ciberseguridad", a: "La Ciberseguridad protege sistemas, redes y datos de ataques digitales.\n\n**Pilares fundamentales**:\n1. **Confidencialidad**: solo autorizados acceden\n2. **Integridad**: datos no alterados\n3. **Disponidad**: acceso cuando necesario\n\n**Medidas básicas**:\n• Contraseñas seguras + 2FA\n• Actualizar software\n• Usar VPN en redes públicas\n• Cifrar datos sensibles\n• Hacer backups", tags: ["seguridad", "básico"] },
    { q: "cómo proteger mi pc", a: "Para proteger tu PC:\n\n1. **Contraseñas**: Mínimo 12 caracteres, únicas, gestor de contraseñas\n2. **2FA**: Activar en cuentas importantes (correo, GitHub, banco)\n3. **Actualizaciones**: Mantener Windows/software al día\n4. **Antivirus**: Windows Defender es bueno, activar\n5. **Firewall**: Verificar que esté activo\n6. **Cifrado**: BitLocker para disco completo\n7. **VPN**: Usar en WiFi públicos\n8. **Backups**: Copias regulares en disco externo", tags: ["seguridad", "protección"] },
    { q: "python", a: "Python es el lenguaje más popular para ML y Data Science.\n\n**Librerías esenciales**:\n• **NumPy**: Computación numérica, arrays\n• **Pandas**: Análisis de datos, DataFrames\n• **Scikit-learn**: ML clásico (regresión, clasificación)\n• **TensorFlow/PyTorch**: Deep learning\n• **Matplotlib/Seaborn**: Visualización\n\n**Comenzar**: `pip install numpy pandas scikit-learn`", tags: ["python", "librerías"] },
    { q: "pythonData Science", a: "Python es el lenguaje más popular para ML y Data Science.\n\n**Librerías esenciales**:\n• **NumPy**: Computación numérica, arrays\n• **Pandas**: Análisis de datos, DataFrames\n• **Scikit-learn**: ML clásico (regresión, clasificación)\n• **TensorFlow/PyTorch**: Deep learning\n• **Matplotlib/Seaborn**: Visualización\n\n**Comenzar**: `pip install numpy pandas scikit-learn`", tags: ["python", "librerías"] },
    { q: "transformación digital", a: "La Transformación Digital es la integración de tecnología en todas las áreas de un negocio, cambiando fundamentalmente operaciones.\n\n**Componentes clave**:\n• Datos y analítica\n• Experiencia del cliente\n• Procesos automatizados\n• Cultura organizacional\n\n**Beneficios**:\n• Mayor eficiencia\n• Nuevos modelos de negocio\n• Mejor experiencia cliente\n• Decisiones basadas en datos", tags: ["negocios", "estrategia"] },
    { q: "tensorflow", a: "TensorFlow es un framework de Google para Deep Learning.\n\n**Características**:\n• Graphs computacionales\n• Keras como API de alto nivel\n• TensorBoard para visualización\n• TF Lite para móviles\n\n**Ejemplo básico**:\n```python\nimport tensorflow as tf\nfrom tensorflow import keras\n\nmodel = keras.Sequential([\n  keras.layers.Dense(64, activation='relu'),\n  keras.layers.Dense(10, activation='softmax')\n])\nmodel.compile(optimizer='adam', loss='sparse_categorical_crossentropy')\n```", tags: ["framework", "deep learning"] },
    { q: "pytorch", a: "PyTorch es un framework de Meta (Facebook) para Deep Learning.\n\n**Características**:\n• Eager execution (debugging fácil)\n• Dynamic computational graphs\n• TorchScript para producción\n• Dominio en investigación\n\n**Ejemplo básico**:\n```python\nimport torch\nimport torch.nn as nn\n\nclass RedSimple(nn.Module):\n  def __init__(self):\n    super().__init__()\n    self.fc1 = nn.Linear(784, 256)\n    self.fc2 = nn.Linear(256, 10)\n  \n  def forward(self, x):\n    x = torch.relu(self.fc1(x))\n    return self.fc2(x)\n```", tags: ["framework", "deep learning"] },
    { q: "regresión lineal", a: "La Regresión Lineal es el modelo más básico de ML.\n\n**Propósito**: Predecir valores continuos\n\n**Fórmula**: y = mx + b\n\n• m = pendiente (cuánto cambia Y)\n• b = intercepto (valor inicial)\n\n**Ejemplo**: Predecir precio de casa según metros cuadrados\n\n**Evaluación**: MSE (Mean Squared Error)\n\n```python\nfrom sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npredicciones = model.predict(X_test)\n```", tags: ["básico", "supervisado"] },
    { q: "clasificación", a: "Los modelos de Clasificación predicen categorías discretas.\n\n**Tipos**:\n• **Binaria**: Si/No, 0/1\n• **Multiclase**: Múltiples categorías\n\n**Algoritmos comunes**:\n• K-NN (vecinos más cercanos)\n• Regresión Logística\n• Árboles de decisión\n• SVM (Support Vector Machine)\n• Random Forest\n\n**Métricas**:\n• Accuracy (precisión general)\n• Precision (positivos correctos)\n• Recall (verdaderos positivos)\n• F1-Score (balance)", tags: ["supervisado", "algoritmos"] },
    { q: "k-means", a: "K-Means es un algoritmo de Clustering (aprendizaje no supervisado).\n\n**Objetivo**: Agrupar datos en K clusters\n\n**Cómo funciona**:\n1. Inicializar K centroides aleatorios\n2. Asignar cada punto al centroide más cercano\n3. Recalcular centroides como promedio\n4. Repetir hasta convergencia\n\n```python\nfrom sklearn.cluster import KMeans\nkmeans = KMeans(n_clusters=3)\nkmeans.fit(X)\nlabels = kmeans.labels_\n```\n\n**Usos**: Segmentación de clientes, compresión de imágenes", tags: ["no supervisado", "clustering"] },
    { q: "transformer", a: "Los Transformers son la arquitectura dominante en NLP desde 2017.\n\n** paper**: 'Attention Is All You Need' (Vaswani et al.)\n\n**Componente clave**: Mecanismo de Atención\n\n**Modelos basados en Transformer**:\n• **BERT**: Pre-entrenado para comprensión\n• **GPT**: Generativo\n• **T5**: Seq2Seq\n\n**Aplicaciones**:\n• Traducción automática\n• Resumen de texto\n• Chatbots\n• Generación de código", tags: ["NLP", "avanzado"] },
    { q: "xgboost", a: "XGBoost es un algoritmo de Gradient Boosting extrémadamente efectivo.\n\n**Características**:\n• Regularización L1/L2\n• Manejo de valores faltantes\n• Paralelización\n• Ganador de muchas competencias de Kaggle\n\n```python\nimport xgboost as xgb\nmodel = xgb.XGBClassifier(\n  n_estimators=100,\n  learning_rate=0.1,\n  max_depth=6\n)\nmodel.fit(X_train, y_train)\n```\n\n**Alternativas**: LightGBM, CatBoost", tags: ["ensemble", "árboles"] },
    { q: "phishing", a: "Phishing es un ataque de ingeniería social para robar información.\n\n**Tipos**:\n• Email fraudulentos\n• Sitios web falsos\n• Mensajes SMS (smishing)\n• Llamadas (vishing)\n\n**Cómo identificarlo**:\n• Remitente sospechoso\n• Urgencia/fear\n• Enlaces extraños\n• Solicitudes de información\n\n**Protección**:\n• Verificar remitente\n• No hacer clic en enlaces\n• Usar 2FA\n• Reportar correos sospechosos", tags: ["seguridad", "amenazas"] },
    { q: "2fa", a: "2FA (Autenticación de Dos Factores) añade una segunda capa de seguridad.\n\n**Factores**:\n1. Algo que sabes (contraseña)\n2. Algo que tienes (teléfono, token)\n3. Algo que eres (huella, cara)\n\n**Métodos recomendados**:\n• **Authenticator apps**: Google Auth, Authy, 1Password\n• **Hardware keys**: YubiKey, Titan\n\n**Evitar**:\n• SMS (vulnerable a SIM swapping)\n• Email (menos seguro)\n\nActivar 2FA reduce 99% de hacks.", tags: ["seguridad", "autenticación"] },
    { q: "data science", a: "Data Science combina estadísticas, programación y conocimiento de negocio.\n\n**Flujo de trabajo**:\n1. **Definir problema**: qué queremos resolver\n2. **Recolectar datos**: APIs, BDs, web scraping\n3. **Limpiar datos**: valores nulos, outliers, formato\n4. **Explorar (EDA)**: visualizaciones, correlaciones\n5. **Modelar**: ML, estadística\n6. **Comunicar**: gráficos, reportes\n\n**Skills必备**:\n• Python/R\n• SQL\n• Pandas, NumPy\n• Visualización\n• Estadísticas", tags: ["data", "profesión"] },
    { q: "pandas", a: "Pandas es la librería principal para análisis de datos en Python.\n\n**Estructuras**:\n• **Series**: Array 1D con índice\n• **DataFrame**: Tabla 2D (como Excel)\n\n**Operaciones comunes**:\n```python\nimport pandas as pd\n\n# Leer datos\ndf = pd.read_csv('datos.csv')\n\n# Filtrar\ndf[df['edad'] > 30]\n\n# Agrupar\ndf.groupby('ciudad').sum()\n\n# Missing values\ndf.fillna(0)\n\n# Guardar\ndf.to_csv('resultado.csv')\n```", tags: ["python", "data"] },
    { q: "numpy", a: "NumPy es la base de la computación científica en Python.\n\n**Core**: Arrays multidimensionales eficientes\n\n```python\nimport numpy as np\n\n# Crear array\narr = np.array([1, 2, 3])\n\n# Matrix 2D\nmat = np.array([[1,2],[3,4]])\n\n# Operaciones vectorizadas\narr * 2  # [2, 4, 6]\n\n# Algebra lineal\nnp.dot(mat, mat.T)\n\n# Estadísticas\nnp.mean(arr), np.std(arr)\n```\n\nMás rápido que listas de Python puro.", tags: ["python", "computación"] },
    { q: "proyectos machine learning", a: "Proyectos para practicar ML:\n\n**Nivel Principiante**:\n• Predicción de precios de casas\n• Clasificación de iris\n• Predicción de糖尿病 (diabetes)\n\n**Nivel Intermedio**:\n• Clasificación de imágenes (MNIST, CIFAR)\n• Análisis de sentimiento de texto\n• Recomendador de películas\n\n**Nivel Avanzado**:\n• Detección de fraude\n• Chatbot con Transformer\n• Segmentación de clientes\n• Pronóstico de ventas\n\n**Consejos**:\n• Empezar simple\n• Iterar y mejorar\n• Documentar decisiones\n• Compartir en portfolio", tags: ["proyectos", "práctica"] },
    { q: "ocr", a: "OCR (Optical Character Recognition) convierte imágenes de texto a texto editable.\n\n**Librerías**:\n• **Tesseract**: Open source, multilingüe\n• **EasyOCR**: PyTorch-based, más preciso\n• **Google Vision API**: Cloud, muy preciso\n\n**Pipeline típico**:\n1. Preprocesar imagen (blanco/negro, deskew)\n2. Detectar regiones de texto\n3. OCR en cada región\n4. Post-procesar (corrección)\n\n**Aplicaciones**: Digitalización documentos, extración facturas", tags: ["visión", "aplicación"] },
    { q: "nlp", a: "NLP (Natural Language Processing) es el procesamiento de lenguaje natural por computers.\n\n**Tareas comunes**:\n• Clasificación de texto\n• Extracción de entidades (NER)\n• Análisis de sentimiento\n• Traducción automática\n• Chatbots\n• Resumen automático\n\n** Técnicas**:\n• Bag of Words, TF-IDF\n• Word Embeddings (Word2Vec, GloVe)\n• Transformers (BERT, GPT)\n\n**Librerías**: NLTK, spaCy, Hugging Face", tags: ["NLP", "lenguaje"] },
    { q: "chatgpt", a: "ChatGPT es un modelo de lenguaje de OpenAI basado en Transformer (GPT-3.5/GPT-4).\n\n**Características**:\n• Conversacional\n• Seguimiento de instrucciones\n• Coding assistance\n• Multiidioma\n\n**Cómo funciona**:\n• Pre-entrenamiento en gran corpus\n• Fine-tuning con RLHF\n• Attention mechanisms\n\n**Alternativas**:\n• Claude (Anthropic)\n• Bard/ Gemini (Google)\n• LLaMA (Meta)\n• open source: Alpaca, Vicuna", tags: ["AI", "generativo"] },
    { q: "algoritmos", a: "Algoritmos de ML más usados:\n\n**Supervisado**:\n• Regresión Lineal/Logística\n• K-NN\n• Árboles de decisión\n• Random Forest\n• SVM\n• XGBoost, LightGBM\n\n**No Supervisado**:\n• K-Means\n• DBSCAN\n• PCA\n• Análisis de componentes independientes\n\n**Deep Learning**:\n• CNN (imágenes)\n• RNN/LSTM (secuencias)\n• Transformers (texto)", tags: ["algoritmos", "referencia"] },
    { q: "pip", a: "pip es el gestor de paquetes de Python.\n\n**Comandos esenciales**:\n```bash\n# Instalar paquete\npip install numpy\n\n# Instalar desde requirements\npip install -r requirements.txt\n\n# Listar instalados\npip list\n\n# Desinstalar\npip uninstall numpy\n\n# Crear requirements\npip freeze > requirements.txt\n```\n\n**Entornos virtuales (recomendado)**:\n```bash\npython -m venv nombre_entorno\nsource nombre_entorno/bin/activate  # Linux/Mac\nnombre_entorno\\Scripts\\activate   # Windows\n```", tags: ["python", "herramientas"] },
    { q: "jupyter", a: "Jupyter Notebook es un entorno interactivo para Data Science.\n\n**Características**:\n• Código + resultados + texto en celdas\n• Ideal para exploración\n• Visualizaciones inline\n• Compartir análisis\n\n**Alternativas**:\n• **JupyterLab**: Nueva interfaz (más potente)\n• **Google Colab**: Cloud, gratis, GPU\n• **VS Code**: Con extensión Jupyter\n• **Deepnote**: Colaborativo\n\n**Atajos**:\n• Shift+Enter: ejecutar celda\n• Ctrl+Enter: ejecutar sin avanzar\n• A/B: insertar celda arriba/abajo", tags: ["herramientas", "entornos"] }
  ];

  function findBestMatch(query) {
    var lowerQuery = query.toLowerCase();
    var matches = [];
    
    knowledgeBase.forEach(function(item) {
      var qLower = item.q.toLowerCase();
      var score = 0;
      
      if (lowerQuery === qLower) {
        score = 100;
      } else if (lowerQuery.includes(qLower) || qLower.includes(lowerQuery)) {
        score = 50;
      } else {
        var queryWords = lowerQuery.split(' ');
        var matchWords = queryWords.filter(function(w) { 
          return w.length > 2 && qLower.includes(w); 
        });
        score = matchWords.length * 10;
      }
      
      if (score > 0) {
        matches.push({ item: item, score: score });
      }
    });
    
    matches.sort(function(a, b) { return b.score - a.score; });
    return matches[0];
  }

  function renderAnswer(match, isAI) {
    var html = '';
    
    if (isAI && match) {
      html += '<div class="ai-badge">🤖 Respuesta inteligente</div>';
    }
    
    if (match) {
      html += '<div class="answer-text">' + match.item.a.replace(/\n/g, '<br>') + '</div>';
      
      if (match.item.tags && match.item.tags.length > 0) {
        html += '<div class="answer-tags">';
        match.item.tags.forEach(function(tag) {
          html += '<span class="tag">' + tag + '</span>';
        });
        html += '</div>';
      }
      
      html += '<div class="source-info">📚 Fuente: Base de conocimiento "Tu Espacio"</div>';
    }
    
    return html;
  }

  function performSmartSearch(query, forceAI) {
    if (!query || !query.trim()) return;
    
    resultsContent.innerHTML = '<div class="loading">📚 Buscando en la base de conocimiento...</div>';
    resultsContainer.style.display = 'block';
    resultsIcon.textContent = '📖';
    resultsTitle.textContent = 'Respuesta';
    
    fetch('/api/ai/ask?q=' + encodeURIComponent(query))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) {
          resultsContent.innerHTML = '<div class="no-answer">❌ ' + data.error + '</div>';
        } else {
          var html = '<div class="ai-response-full">' + data.answer.replace(/\n/g, '<br>') + '</div>';
          
          // Mostrar fuentes si existen
          if (data.sources && data.sources.length > 0) {
            html += '<div class="sources-section"><h4>📎 Fuentes consultadas:</h4><ul class="sources-list">';
            data.sources.forEach(function(s) {
              html += '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + s.title + '</a>';
              if (s.snippet) {
                html += '<p class="source-snippet">' + s.snippet + '</p>';
              }
              html += '</li>';
            });
            html += '</ul></div>';
          }
          
          resultsContent.innerHTML = html;
        }
      })
      .catch(function(err) {
        console.error('Search error:', err);
        resultsContent.innerHTML = '<div class="no-answer">Error de conexión. Intenta de nuevo.</div>';
      });
  }

  // Event Listeners
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      performSmartSearch(searchInput.value, false);
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSmartSearch(searchInput.value, false);
      }
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      resultsContainer.style.display = 'none';
    });
  }
  
  quickTags.forEach(function(tag) {
    tag.addEventListener('click', function() {
      var q = tag.getAttribute('data-q');
      searchInput.value = q;
      performSmartSearch(q, false);
    });
  });
})();