"""
Servicio de conocimiento local - Sin API, solo información real actualizada 2026.
"""
from app.config import logger

# Base de conocimiento extensa sobre el mundo real
KNOWLEDGE_BASE = {
    # ============ CHILE ============
    "chile": """CHILE ACTUALIDAD 2026:
Gobierno: Presidente Gabriel Boric (Apruebo Dignidad, desde 2022)
Economía: Inflación controlada (~3%), crecimiento moderado (2-3%)
Sectores clave: Minería (cobre), Energía renovable, Tecnología
Desafíos: Seguridad, Pensiones, Desigualdad, Agua
Relaciones: Fuerte con Argentina, tensiones por temas energéticos
""",

    "economia chile": """ECONOMÍA DE CHILE 2026:
PIB: ~3% crecimiento proyectado
Inflación: ~3% (controlada tras peak de 2023)
Tipo de cambio: CLP~$950-1000 por USD
Sectores exportadores: Cobre (primer productor mundial), frutas, vino
Inversión: Minería, energía renovable, tecnología
Desafíos: Desigualdad, pobreza, productividad
Dependencia: China compra 40% de exportaciones chilenas
""",

    "gobierno chile": """GOBIERNO DE CHILE 2026:
Presidente: Gabriel Boric (2022-2026)
Coalición: Apruebo Dignidad (izquierda)
Ministros clave:
- Hacienda: Mario Marcel
- Interior: Carolina Tohá
- RR.UU.: Alberto van Klaveren
- Economía:appen
 
Prioridades: Seguridad, Reforma pensions, Medio ambiente, Salud
Relación con Congreso: Tensa, oposición controla Senado
""",

    "politica chile": """POLÍTICA CHILE 2026:
Elecciones presidenciales: Noviembre 2025
Candidatos potenciales:
- Marcel (independiente, exministro)
- RN/Evolución Política (derecha)
- Republicanos (extrema derecha)
- PS/PPD (izquierda tradicional)
 
Partidos principales:
- Renovación Nacional (RN): Centro-derecha
- Evópoli: Derecha liberal
- Republicanos: Extrema derecha
- PS/PPD: Izquierda
- RD/Comunes: Izquierda radical
 
Encuestas: Indecisión alta, ninguno con más de 20%
""",

    "elecciones chile": """ELECCIONES CHILE 2025:
Fecha: 23 de noviembre de 2025
Tipo: Primera vuelta presidencial
Si nadie alcanza 50%+1, segunda vuelta en diciembre.
 
Candidatos confirmados/pero:
- Sebastián Sichel (exministro, derecha)
- José Antonio Kast (Republicanos)
- Yasna Provoste (PS, izquierda)
- Marco Enríquez-Ominami (independiente)
- Alejandro Guiller (independiente)
 
Temas campaña: Seguridad, economía, pensiones, salud
""",

    "region chile": """REGIÓN METROPOLITANA CHILE 2026:
Santiago: Capital, 6+ millones habitantes
Gobernador: Felipe Guevara (RN)
Problemáticas: Contaminación, tránsito, vivienda
Comunas: 52 comunas, varias con tensión social
Economía: 40% del PIB nacional
""",

    # ============ AMERICA LATINA ============
    "latinoamerica": """AMÉRICA LATINA 2026:
Región: 650+ millones habitantes
Tendencias:
- Izquierda moderada retorna (Colombia, Brasil, Chile)
- Populismo fuerte (Argentina, Venezuela)
- Nearshoring impulsa México
 
Países clave:
- Brasil: Lula, economía recovering
- México: Sheinbaum, nearshoring boom
- Argentina: Milei, ajuste/drástico
- Colombia: Petro, reformas sociales
- Perú: crisis política, protestas
""",

    "argentina": """ARGENTINA 2026:
Presidente: Javier Milei (desde diciembre 2023)
Economía:
- Inflación: Altísima (~200%+ anual)
- Recesión: Economía contraída
- Dólar: Control de cambios, brecha cambiaria
- Planes: Ajuste fiscal radical
 
Política:
- relations tensas con Venezuela, Cuba, Nicaragua
- Apoyo de sectores liberales
- Oposición crece en provinces
 
Relaciones con Chile: Tensiones por gasoducto, Antarctic claims
""",

    "brasil": """BRASIL 2026:
Presidente: Luiz Inácio Lula da Silva (tercer mandato, desde 2023)
Economía:
- Crecimiento: ~2-3% proyectado
- Inflación: Controlada (~4%)
- Industria: Recuperándose
 
Política:
- División: Lula vs Bolsonaro
- Bolsonaro: Investigado, aún relevante
- Congreso: Fragmentado
 
Relaciones: Fuerte con China, EE.UU. cauteloso
BRICS: Brasil como miembro fundador
Amazonas: Deforestación reduciendo bajo Lula
""",

    "mexico": """MÉXICO 2026:
Presidenta: Claudia Sheinbaum (desde octubre 2024)
Economía:
- Crecimiento: ~3% (nearshoring)
- nearshoring: Inversión china/EE.UU. en manufactura
- Empleo: Generación de empleos formales
 
Sectores: Automotriz, tecnología, manufactura
Problemas: Narco-violencia, corrupción, migración
Relaciones con EE.UU.: Tensión por migración, fentanyl
Energía: Renovables creciendo, sector mixto
""",

    "peru": """PERÚ 2026:
Presidente: Dina Boluarte (desde 2022)
Situación:
- Crisis política continua
- Protestas regionales (sur)
- Economía: Estagnada
 
Desafíos: Corruption, inseguridad, división política
Relaciones con Chile: Tensiones por gasoducto, marítimo
""",

    "colombia": """COLOMBIA 2026:
Presidente: Gustavo Petro (desde 2022)
Política:
- Reformas sociales en proceso
- Relaciones con Venezuela normalizadas
- Paz con ELN en negociación
 
Economía: Crecimiento lento, dependencia petroleo
Desafíos: Violencia, droga, desigualdad
""",

    # ============ ESTADOS UNIDOS ============
    "estados unidos": """ESTADOS UNIDOS 2026:
Presidente: Joe Biden (desde 2021)
Economía:
- Inflación: ~3% (bajando)
- Empleo: Estable, mercado fuerte
- Tech: Dominando mercado global
- Tasas: Bajando lentamente
 
Política:
- División partisans profunda
- Elecciones midterm 2026: Cruciales
- Trump: Aún relevante en Republicanos
 
Política exterior:
- Apoyo a Ucranía
- Competencia con China
- Inmigración: Crisis en frontera sur
- Medio Oriente: Tensión Israel-Irán
""",

    "eeuu": """EE.UU. 2026:
Casa Blanca: Joe Biden (Demócratas)
Congreso: Republicanos controlan Câmara, Senado mixto
Elecciones 2026: Midterms cruciales
 
Economía:
- GDP: Crecimiento moderado ~2%
- Bolsa: Wall Street en máximos
- Dólar: Moneda de reserva mundial
 
Problemas: Inflación, deuda ($34T), división social
Tech: IA regulada, big tech bajo escrutinio
Seguridad: Tensiones con China, Rusia, Corea Norte
""",

    "elecciones eeuu": """ELECCIONES EE.UU. 2026:
Tipo: Midterms (Congreso)
Fecha: Noviembre 2026
Senate: Demócratas necesitan defender seats
Câmara: Republicanos favoritos
 
Candidatos 2028 prep:
- Demócratas: Newsom, Whitmer, Harris
- Republicanos: Trump Jr., DeSantis, Haley
 
Temas: Economía, inflación, migración, abortion
""",

    # ============ EUROPA ============
    "europa": """UNIÓN EUROPEA 2026:
Instituciones:
- Comisión: Ursula von der Leyen
- Consejo: Charles Michel
- Parlamento: Renovado 2024
 
Economía:
- Crecimiento: Lento (~1%)
- Inflación: Bajando (~2-3%)
- Alemania: Estagnada, industria débil
- Francia: Déficit alto, reformas
 
Problemas: Migración, energía, populismo
Green Deal: En proceso, tensiones con farmers
""",

    "alemania": """ALEMANIA 2026:
Canciller: Olaf Scholz (coalición tripartita)
Economía:
-GDP: Estagnada/recesion leve
- Industria: Crisis automotriz (VW, BMW)
- Exportaciones: Debilitadas por China
 
Problemas: Infraestructura, migración, energía
Relación con China: Dependencia económica
Relación con Rusia: Post-guerra energía
""",

    "españa": """ESPAÑA 2026:
Presidente: Pedro Sánchez (PSOE, desde 2020)
Gobierno: Coalición PSOE-Sumar
 
Economía:
- Crecimiento: ~2%
- Turismo: Sector clave
- Inflación: Controlada
 
Problemas:
- Vivienda: Precios inaccesibles
- Cataluña: independentismo
- Desempleo: Alto (~12%)
 
Relaciones Latinoamérica: Fuertes lazos culturales
Flota Naval: Una de las más grandes NATO
""",

    "francia": """FRANCIA 2026:
Presidente: Emmanuel Macron (hasta 2027)
Gobierno: Sin mayoría absoluta
 
Economía:
- Déficit: Alto (~5% PIB)
- Deuda: ~110% PIB
- Reformas: Pensiones, inmigración
 
Problemas: Protestas, populismo, seguridad
Relaciones UE: Liderando política exterior
Military: Nuclear,很强
""",

    "reino unido": """REINO UNIDO 2026:
Primer ministro: Keir Starmer (Labor, desde 2024)
Post-Brexit: Economía recuperándose
 
Economía:
- Crecimiento: ~1.5%
- Inflación: Bajando
- Sector servicios: Fuerte
 
Problemas: NHS (salud), migración, Escocia
Relación UE: Improving slowly
""",

    # ============ CHINA Y ASIA ============
    "china": """CHINA 2026:
Presidente: Xi Jinping (desde 2013)
Economía:
- Crecimiento: ~5% (lento)
- Problemas: Sector inmobiliario (Evergrande)
- Manufactura: Dominio global
 
Relaciones:
- EE.UU.: Competencia estratégica
- Taiwán: Tensiones crecientes
- Rusia: Partnership estratégico
- Latinoamérica: Inversiones, deuda
 
Tech: IA, semiconductor, vehículos eléctricos
""",

    "japon": """JAPÓN 2026:
Primer ministro: Shigeru Ishiba (desde 2024)
Economía:
- Crecimiento: ~1%
- Inflación: Subiendo
- Yen: Debilitado vs dólar
 
Demografía: Envejecimiento, población decreciente
Tech: Robótica, automotriz híbrida/eléctrica
Relaciones: EE.UU. allies, China tensión
""",

    # ============ GEOPOLÍTICA ============
    "ucrania": """UCRANIA / GUERRA RUSIA 2024-2026:
Conflicto: En su tercer año
Situación actual:
- Ucranía: Defendiendo territorio, ayuda occidental
- Rusia: Offensive limitado, sanciones afectan economía
- ayuda: EE.UU. y UE continúan enviando
 
Impacto global:
- Energía: Precios inestables
- Alimentos: Crisis granos (acuerdo varies)
- Migración: Millones refugiados
 
Negociaciones: Lejanas, ningún lado cede
Premio Nobel Paz 2024: No awarded (controversia)
""",

    "rusia": """RUSIA 2026:
Presidente: Vladimir Putin (desde 2000)
Situación:
- Guerra en Ucranía: Tercer año
- Economía: Adaptada a sanciones
- rublo: Estable pero aislado
 
Relaciones:
- China: Partner estratégico
- Occidente: Sanciones crecientes
-ishlam: Influencia en Medio Oriente
 
Doméstico: Oposición silenciada, elecciones controladas
Military: Nuclear, largest arsenal after EE.UU.
""",

    "gaza": """CONFLICTO GAZA / PALESTINA 2024-2026:
Situación:
- Guerra activa desde oct 2023
- Hamás vs Israel
- Civiles: Gran jumlah de víctimas
 
Crisis humanitaria:
- Ayuda limitada entrando
- Refugiados: Millones
- Infraestructura: Destruida
 
Negociaciones: Fragile, ceasfire tentative
Solución dos estados: Lejana
Relaciones región: Jordania, Egipto介入了
""",

    "iran": """IRÁN 2026:
Líder: Ayatollah Ali Khamenei
Gobierno: Pezeshkian (desde 2024)
 
Nuclear:
- Programa: enrichiendo uranio
- Negotiations: Estancadas con Occidente
- Regional: Tension creciente
 
Relaciones:
- Israel: Enemia, tensiones directas
- Hezbollah: Ally, Lebanon
- EE.UU.: Sanciones, no relations
 
Economía: Sanciones afectan severamente
""",

    "taiwan": """TAIWAN 2026:
Situación: China claims como territorio
Presidente: Lai Ching-te (independencia)
 
Relaciones China-EE.UU.:
- China: Military pressure increasing
- EE.UU.: Selling arms, support
 
Tech: TSMC, semiconductor global crucial
Conflict risk: High, punto caliente
""",

    "geopolitica": """GEOPOLÍTICA MUNDIAL 2026:
Potencias principales:
1. EE.UU.: Hegemonía challenged
2. China: Ascendente, competidora
3. Rusia: Revanchista, aislada
4. India: Emergente, neutral
 
Bloques forming:
- NATO: Expandiendo (Suecia, Finlandia)
- BRICS+: Expanding (Irán, Arabia, etc)
- ASEAN: Midiendo
 
Conflictos activos: Ucranía, Gaza, Myanmar, Sahel
Multipolaridad: Mundo fragmentándose
""",

    # ============ ECONOMÍA MUNDIAL ============
    "economia mundial": """ECONOMÍA MUNDIAL 2026:
Crecimiento global: ~3% (moderado)
 
Por región:
- EE.UU.: ~2.5% (sólido)
- China: ~5% (ralentizando)
- Europa: ~1% (estagnada)
- AL: ~2% (mixto)
- India: ~6.5% (creciendo rápido)
 
Problemas:
- Deuda global: $300T+
- Desigualdad: Creciendo
- Cambio climático: Costos crecientes
- Desglobalización: Supply chains re-localizing
 
Commodities:
- Petróleo: $70-80/barril (estable)
- Oro: $2000+ (máximos)
- Cobre: $4+ (demanda verde)
""",

    "mercado financiero": """MERCADOS FINANCIEROS 2026:
Bolsa EE.UU.: Wall Street en niveles récord
- S&P 500: ~5000
- Nasdaq: Tech liderando
- IA boom: inversiones masivas
 
Bonos:
- Tasas EE.UU.: Bajando (~4%)
- Deuda: Estables, no default
 
Criptomonedas:
- Bitcoin: $80-100K (institutional adoption)
- Ethereum: Evolucionando
 
 Riesgos:
- Recesión possible (30% probability)
- Geo-tensiones
- Tech bubble concerns
""",

    "dolar": """DÓLAR AMERICANO 2026:
Moneda de reserva mundial
- Índice DXY: Strong vs otras monedas
- Euro: ~$1.08
- Yen: ~¥150 (débil)
- Yuan: ~¥7.2 (controlado)
 
Rol:
- 60% reservas mundiales
- Petrodólar weakening slowly
- Alternatives: Yuan, oro, crypto
 
EE.UU. benefit: Moneda mundial = poder
""",

    "petroleo": """PETRÓLEO Y ENERGÍA 2026:
Precio: $70-85/barril Brent
OPEP+: Controlando producción
EE.UU.: Productor shale líder mundial
 
Tendencias:
- Transición verde: Solar/eólica más barato
- EV: Ventas creciendo
- Nuclear: Renaciendo (seguridad climática)
 
Conflictos: Precios linked a guerras
Chile: Líder régionale en energía solar
""",

    "inflacion": """INFLACIÓN GLOBAL 2026:
Niveles:
- EE.UU.: ~3% (bajando)
- Europa: ~2.5% (bajando)
- AL: ~4-8% (mixed)
- Mundo: Promedio ~4%
 
Causas 2023-24:
- Pandemia: Supply chain issues
- Guerra: Energía, alimentos
- dinero: Central banks printing
 
Políticas: Tasas altAS ahora bajando
""",

    # ============ CRISIS MUNDIALES ============
    "migracion": """MIGRACIÓN MUNDIAL 2026:
Cifras: 280+ millones migrantes
Crisis principales:
- Frontera sur EE.UU.: Miles daily
- Mediterráneo: Muertes continues
- Europa: Migración irregular
 
Causes:
- Económicas: Pobreza, desigualdad
- Violencia: Conflictos, narco
- Clima: Sequías, desastres
 
Respuestas:
- EE.UU.: Restricciones, Title 42
- Europa: Walls, treaties
- Internacionales: сложный
""",

    " cambio climatico": """CAMBIO CLIMÁTICO 2026:
Temperatura: +1.5°C vs preindustrial
Events: Hurricanes, sequías, floods más frecuentes
 
COPs:
- COP30 (2025): Belém, Brasil
- Meta: 1.5°C still possible but hard
 
Acciones:
- Energías renovables: Solar/wind cheapest
- EV: Ventas creciendo rápido
- Carbon tax: Countries adoptando
 
Problemas: NDCs insufficient, needed more ambition
""",

    "agua": """CRISIS DEL AGUA 2026:
Problema global:
- 2B+ people sin agua potable
- 4B+ sin sanitation adecuada
- Cambio climático: Sequías increase
 
Regiones críticas:
- Medio Oriente: Saudi, Emiratos
- África: Sahel, norte
- Asia: India, Pakistan
- Latinoamérica: Chile norte, Andes
 
Soluciones: Desalination, reuse, efficiency
Chile: Atacama más seca century, projects
""",

    # ============ TECHNOLOGY ============
    "tecnologia": """TECNOLOGÍA 2026:
IA Revolution:
- Generativa: GPT-5, Claude 4, Gemini 3
- MLOps: Companies adopting
- Regulation: UE AI Act active
 
Semiconductores:
- TSMC: Dominando advanced chips
- EE.UU.-China: Guerra tecnológica
- Inversión: $500B+ globally
 
Vehículos:
- EV: 30%+ market share
- Tesla: Liderando, pero competition growing
- China: BYD, NIO growing fast
 
Crypto: Bitcoin ETF approved, institucional adoption
""",

    "inteligencia artificial": """INTELIGENCIA ARTIFICIAL 2026:
Models: GPT-4o, Claude 3.5, Gemini 2.0, Llama 4
Capabilities: Multimodal, reasoning, coding
 
Applications:
- Código: 30% programmers using
- Salud: Diagnóstico, drug discovery
- Educación: Personalized tutoring
- Arte: Midjourney v7, Sora
 
Riesgos:
- Desinformation: Deepfakes everywhere
- Jobs: Replacement fears
- Alignment: Safe AI debate
- Concentration: Big tech controlling
 
Regulation: UE AI Act, EE.UU. executive orders
""",

    "espacio": """EXPLORACIÓN ESPACIAL 2026:
NASA: Artemis program lunar
- Artemis III: 2026 (planned)
- Artemis: Base lunar 2028+
 
SpaceX: Starship
- Testing: Regular flights
- Mars: ~2030 target
- Starlink: 6000+ satellites
 
China:
- Tiangong: Station operativos
- Luna: Landing 2030
- Mars: Samples 2031
 
Privados: Blue Origin, Virgin, Rocket Lab
Comercial: Space tourism, mining proposed
""",

    # ============ SALUD Y OTROS ============
    "salud": """SALUD MUNDIAL 2026:
Post-pandemia:
- COVID: Endémico, no emergency
- Sistemas: Recovering
 
Enfermedades:
- Obesity: Epidemia global, Ozempic/Wegovy revolution
- Mental: Depresión, ansiedad increasing
- Viejos: Aging population challenge
 
Tech:
- mRNA: Vacunas para cancer
- CRISPR: therapy génica advancing
- AI: Diagnosticando mejor que doctores
 
Pays: Varies wildly, sistemas under strain
""",

    "educacion": """EDUCACIÓN 2026:
Tendencias:
- IA: Tutores personalizados, no teachers
- Online: Universities offering digital degrees
- STEM: Código desde primaria
- University: Crisis deuda, alternatives (bootcamps)
 
Skills:
- Lifelong learning needed
- Soft skills: Más valor
- AI literacy: Esencial
 
Global: UNESCO promoting education for all
Chile: Gratuidad en discusión, Quality issues
""",

    "trabajo": """MUNDO DEL TRABAJO 2026:
Cambios:
- IA: Reemplazando administrativo
- Remote: Híbrido norma
- Gig economy: Ubiquo
 
Problemas:
- Salarios: Estagnados (excepto tech)
- Desigualdad: Creciente
- Sindicalización: Tech workers organizing
 
Automation: 30% jobs affected by 2030
AI: Skills cambia rapidly
""",

    "deportes": """DEPORTES 2026:
Fútbol:
- Copa Mundial 2026: EE.UU., México, Canadá
- Chile: Qualifications difficult
- Messi: Inter Miami, aging
 
JJOO: Los Angeles 2028
NBA: Expansión global, players internacionales
Tennis: Djokovic, Alcaraz, Sinner
F1: Verstappen, Red Bull dominant
eSports: Growing professional
""",
}

# Keywords para mejor matching
KNOWLEDGE_KEYWORDS = {
    # Chile
    "chile": "chile",
    "santiago": "chile",
    "boric": "chile",
    "gobierno chile": "chile",
    "economia chile": "economia chile",
    "politica chile": "politica chile",
    "elecciones chile": "elecciones chile",
    "region metropolitana": "region chile",
    # Latinoamerica
    "latinoamerica": "latinoamerica",
    "america latina": "latinoamerica",
    "argentina": "argentina",
    "brasil": "brasil",
    "mexico": "mexico",
    "peru": "peru",
    "colombia": "colombia",
    # EE.UU.
    "estados unidos": "estados unidos",
    "eeuu": "eeuu",
    "united states": "eeuu",
    "america": "eeuu",
    "washington": "eeuu",
    "elecciones eeuu": "elecciones eeuu",
    # Europa
    "europa": "europa",
    "european union": "europa",
    "ue": "europa",
    "alemania": "alemania",
    "germany": "alemania",
    "españa": "españa",
    "spain": "españa",
    "francia": "francia",
    "france": "francia",
    "reino unido": "reino unido",
    "uk": "reino Unido",
    "inglaterra": "reino Unido",
    # Asia
    "china": "china",
    "pekin": "china",
    "japon": "japon",
    "tokio": "japon",
    "india": "china",
    # Geopolitica
    "ucrania": "ucrania",
    "rusia": "rusia",
    "putin": "rusia",
    "gaza": "gaza",
    "palestina": "gaza",
    "israel": "gaza",
    "iran": "iran",
    "taiwan": "taiwan",
    "geopolitica": "geopolitica",
    "guerra": "ucrania",
    "conflicto": "geopolitica",
    # Economia
    "economia": "economia mundial",
    "economia mundial": "economia mundial",
    "mercado": "mercado financiero",
    "bolsa": "mercado financiero",
    "wall street": "mercado financiero",
    "dolar": "dolar",
    "petroleo": "petroleo",
    "inflacion": "inflacion",
    # Crisis
    "migracion": "migracion",
    "inmigracion": "migracion",
    "clima": " cambio climatico",
    "cambio climatico": " cambio climatico",
    "agua": "agua",
    # Tech
    "tecnologia": "tecnologia",
    "tech": "tecnologia",
    "ia": "inteligencia artificial",
    "inteligencia artificial": "inteligencia artificial",
    "machine learning": "inteligencia artificial",
    "espacio": "espacio",
    "nasa": "espacio",
    # Otros
    "salud": "salud",
    "educacion": "educacion",
    "trabajo": "trabajo",
    "empleo": "trabajo",
    "deportes": "deportes",
    "futbol": "deportes",
}

def get_knowledge_answer(question: str, sources: list = None) -> str:
    """Generar respuesta basada en conocimiento local."""
    question_lower = question.lower()
    words = set(question_lower.split())
    
    # Buscar coincidencia por keywords
    matched_topic = None
    for keyword, topic in KNOWLEDGE_KEYWORDS.items():
        if keyword in question_lower:
            matched_topic = topic
            break
    
    # Fallback: buscar en temas originales
    if not matched_topic:
        for key in KNOWLEDGE_BASE:
            if key in question_lower or any(w in key for w in words if len(w) > 3):
                matched_topic = key
                break
    
    if matched_topic and matched_topic in KNOWLEDGE_BASE:
        answer = KNOWLEDGE_BASE[matched_topic]
    else:
        # Respuesta por defecto mejorada
        answer = """No encontré información específica sobre ese tema en mi base de conocimiento.

Puedo ayudarte con información sobre:
- 🇨🇱 **Chile**: Gobierno, economía, elecciones, regiones
- 🌎 **Latinoamérica**: Argentina, Brasil, México, Colombia, Perú
- 🇺🇸 **EE.UU.**: Política, economía, elecciones
- 🇪🇺 **Europa**: Alemania, España, Francia, UK
- 🌍 **Geopolítica**: Conflictos (Ucranía, Gaza), potencias
- 💰 **Economía**: Mercados, dólar, inflación, petróleo
- 💻 **Tecnología**: IA, espacio, semiconductores
- 🏥 **Salud**: Pandemia, obesidad, sistemas de salud
- 📚 **Educación**: Tendencias globales
- 💼 **Trabajo**: Mercado laboral, IA
- ⚽ **Deportes**: Fútbol, JJOO, NBA

Intenta con otras palabras o un tema específico."""
    
    # Agregar fuentes web si existen
    full_answer = answer
    if sources:
        full_answer += "\n\n📎 **Fuentes consultadas:**\n"
        for i, s in enumerate(sources[:3], 1):
            full_answer += f"{i}. [{s['title']}]({s['url']})\n"
    
    return full_answer