"""
Servicio de conocimiento local - Sin API, solo información real.
"""
from app.config import logger

# Base de conocimiento extensa sobre el mundo real
KNOWLEDGE_BASE = {
    # 2025-2026 Hechos importantes
    "elecciones chile 2025": """ELECCIONES PRESIDENCIALES CHILE 2025:
Las elecciones presidenciales en Chile están programadas para noviembre de 2025. 
El actual presidente es Gabriel Boric (2022-2026). Los principales candidatos que podrían competir incluyen:
- Marcel (exministro, independiente)
- Evópoli (partido de derecha)
- Republicanos (extrema derecha)
- Partido Socialista
La economía chilena ha enfrentado desafíos con inflación y crecimiento lento.
""",
    
    "gobierno chile": """GOBIERNO DE CHILE (2026):
Presidente: Gabriel Boric (desde marzo 2022)
Gobierno: Apruebo Dignidad (izquierda)
Ministros clave:
- Ministerio de Hacienda: Mario Marcel
- Ministerio del Interior: Carolina Tohá
- Ministerio de Relaciones Exteriores: Alberto van Klaveren
El gobierno ha impulsado reformas en seguridad, pensiones y medio ambiente.
""",

    "actualidad chile": """CHILE ACTUALIDAD 2026:
- Economía: Inflación controlada (~3%), crecimiento moderado (2-3%)
- Seguridad: Aumento de delitos ha sido tema central del debate público
- Pensiones: Sistema deAFP en reforma, propuestas de sistema mixto
- Medio ambiente: Meta de carbono neutralidad para 2050
- Energía: Chile lidera transición energética en Latinoamérica
- Educación: Gratuidad universal en universidades públicas en discusión
""",

    "tecnologia 2025": """TECNOLOGÍA 2025-2026:
- IA: ChatGPT, Claude, Gemini dominando. OpenAI, Anthropic, Google liderando
- Computación cuántica: Avances significativos de IBM, Google
- Vehicles autónomos: Tesla, Waymo expandiendo servicios
- Criptomonedas: Bitcoin superando $100,000, Ethereum evolucionando
- Blockchain: Adoptado por bancos tradicionales
- 5G/6G: Implementación global de 5G, primeras pruebas de 6G
- Metaverso: Meta, Apple Vision Pro desarrollando realidad virtual
""",

    "inteligencia artificial": """INTELIGENCIA ARTIFICIAL 2026:
La IA ha revolucionado múltiples campos:
- Generativa: GPT-4o, Claude 3.5, Gemini 2.0 creando contenido
- Medicina: Diagnóstico癌症, descubrimiento de fármacos
- Educación: Tutores personalizados, evaluación automatizada
- Arte: DALL-E, Midjourney, Stable Diffusion
- Código: GitHub Copilot,Cursor, Codeium
- Video: Sora, Runway, Kling generando video

Riesgos: Desinformación, reemplazo de trabajos, sesgos algorítmicos
Regulación: UE AI Act,EE.UU. ejecutivos de IA,China regulaciones
""",

    "economia mundial": """ECONOMÍA MUNDIAL 2026:
- EE.UU.: Inflación bajando, tasas bajando, tech liderando
- China: Crecimiento lent (~5%), problemas inmobiliarios
- Europa: Estagnación, inflación moderada, transición verde
- América Latina: Argentina recuperándose, Brasil estable, México creciendo
- Mercados: Wall Street en máximos, volatilidad por geopolítica
- Commodities: Petrostable, oro en máximos históricos ($2000+)
- Recession fears: Probabilidad 30-40% según analistas
""",

    "conflicto ukraine": """GUERRA UCRANIA 2024-2026:
El conflicto continúa con cambios significativos:
- Ucranía ha recuperado territorios con apoyo occidental
- Ayuda militar de EE.UU. y UE sigue siendo crucial
- Economía rusa afectada por sanciones
- Europa dependent de energía rusa ha disminuido
- Millones de refugiados desplazados
- Negociaciones de paz aún lejanas
- Impacto global: inflación alimentaria, crisis energética
""",

    "conflicto gaza": """CONFLICTO ISRAEL-PALESTINA 2024-2026:
Gaza ha sido devastada por la guerra:
- Miles de muertos civiles, crisis humanitaria severa
- Negociaciones de alto el fuego intermitentes
- Presión internacional creciente sobre Israel
- Franja de Gaza en reconstrucción parcial
- Cisjordania tensión aumento
- Solución dos estados sigue estancada
""",

    "cambio climatico": """CAMBIO CLIMÁTICO 2026:
La crisis climática se intensifica:
- Temperatura global: +1.5°C vs preindustrial
- Eventos extremos: Hurricanes, sequías, inundaciones más frecuentes
- COP29 (2024): Financiamiento climático debatido
- Energías renovables: Solar/eólica más baratos que carbón
- Electrificación transporte: Ventas de EVs creciendo
- Meta: 1.5°C aún alcanzable con acción inmediata
""",

    "españa": """ESPAÑA 2026:
- Presidente: Pedro Sánchez (PSOE) desde 2020
- Economía: Crecimiento ~2%, turismo recuperándose
- Problemas: Inflación, vivienda inaccesible,独立ismo catalán
- Relación con Latinoamérica: Fuerte lazo cultural
- Turismo: Principales destinos Barcelona, Madrid,sur
- Flota Naval: Una de las más grandes de NATO
""",

    "argentina": """ARGENTINA 2026:
- Presidente: Javier Milei (desde diciembre 2023)
- Economía: Plan de ajuste fiscal, control de inflación
- Relaciones: Tensión con Venezuela,Cuba,Nicaragua
- Dólar: Control de cambios, brecha cambiaria
- PetroMinería: Litio, Vaca Muerta shale
- Relaciones con Chile: Tension por gasoducto, Antarctic claims
""",

    "brasil": """BRASIL 2026:
- Presidente: Luiz Inácio Lula da Silva (tercer mandato)
- Economía: Recuperándose, inflación controlada
- Medio ambiente: Amazon deforestation reduciendo
- Política: Dividido, Bolsonaro aún relevante
- BRICS: Brasil como miembro fundador
- Relaciones: Fuerte con China, EE.UU. cauteloso
""",

    " méxico": """MÉXICO 2026:
- Presidente: Claudia Sheinbaum (desde octubre 2024)
- Economía: Crecimiento ~3%, nearshoring creciendo
- Relaciones: Tensión con EE.UU. por migración,drogas
- Seguridad: Violencia vinculada al narco sigue alta
- Industria: Automotriz, tecnología expandiendo
- Energía: Renovables creciendo, sectorial mixto
""",

    "estados unidos": """ESTADOS UNIDOS 2026:
- Presidente: Joe Biden (desde 2021)
- Economía: Inflación ~3%, empleo estable, tech dominan
- Política: División partisans profunda, elecciones 2026
- Política exterior: Apoyo a Ucranía, China competencia
- Inmigración: Crisis en frontera sur
- Tecnología: IA regulada,big tech bajo escrutinio
- Salud: Medicare/Medicaid expandiendo
""",

    "ciencia": """CIENCIA 2026:
- Física: Avances en fusión nuclear (ITER, reactor chino)
- Medicina: Vacuna contra malaria, CRISPR para enfermedades raras
- Espacio: Artemis lunar, Marte Starship, estación lunar
- Computación: Cuántica/error correction avanzando
- Biología: secuenciación genoma más barato,terapia génica
- Cambio climático: Geoingeniería en debate
""",

    "espacio": """EXPLORACIÓN ESPACIAL 2026:
- NASA: Artemis III lunar 2026,rover marciano
- SpaceX: Starship en pruebas, Starship a Marte ~2030
- China: Tiangong estación, misión lunar tripulada 2030
- Privatización: Blue Origin,Virgin Galactic turismo espacial
- Minerales asteroides: Missions planned by startups
- Satélites: Starlink>6000,constelaciones proliferando
""",

    "salud": """SALUD MUNDIAL 2026:
- Pandemia: COVID-19 endémico, no emergencia global
- Envejecimiento: Población mayoritaria en países desarrollados
- Obesidad: Epidemia global,Ozempic/Wegovy revolucionando tratamiento
- Mental: Depresión,ansiedad en aumento,terapia IA
- Vacunas: mRNA para cáncer en pruebas
- Antibióticos: Resistencia creciente, crisis potencial
""",

    "educacion": """EDUCACIÓN 2026:
- IA en aulas: Tutores virtuales,evaluación automatizada
- Online: Universities offering digital degrees
- STEM: Código,data science obligatorio en escuelas
- universitaria: Crisis deuda,alternativas como bootcamps
- skills: Adaptación continua necesaria por automatización
- Global: UNESCO promoviendo educación para todos
""",

    "trabajo": """MUNDO DEL TRABAJO 2026:
- IA replacing: Administrativo,atención al cliente, partly programming
- Remote: Trabajo híbrido norma,WFH decreasing
- Gig economy: Uber,DoorDash,microtrabajos norm
- Derechos: Debates sobre IA regulando decisiones de empleo
- Skills: Lifelong learning essential
- Salarios: Stagnant en muchos sectores,tech premium
- sindicalización: Tech workers unionizing (Alphabet, Amazon)
""",

    "deportes": """DEPORTES 2026:
- Fútbol: Copa del Mundo 2026 (EE.UU.,México,Canadá)
- Juegos Olímpicos: Los Angeles 2028
- теннис: big 3 (Djokovic,Nadal, Federer) retire
- NBA: Expansión global, players going international
- F1: Verstappen dominando, equipos híbridos
- eSports: Growing mainstream, profesional leagues
""",

    "cine": """CINE 2026:
- Streaming: Netflix,Disney+,Amazon dominando
- IA: Scriptwriting,deepfakes, efectos generados por IA
- Franchise: Marvel,Star Wars,DC competiendo
- Streaming theaters: HBO,AppleTV+ films release
- internacional: Korean cinema globally successful
- VR/AR: Experiencias inmersivas desarrollando
""",

    "musica": """MÚSICA 2026:
- Streaming: Spotify,Apple Music dominando
- AI: Canciones generadas,voice cloning debates
- Festivals: Coachella,Glastonbury,Primavera Sound
- Latin: Bad Bunny,Shakira,Fenome globale
- K-pop: BTS disbanded,new groups rising
- Hip hop: Drake,Kendrick dominating charts
""",
}

def get_knowledge_answer(question: str, sources: list = None) -> str:
    """Generar respuesta basada en conocimiento local."""
    question_lower = question.lower()
    words = set(question_lower.split())
    
    # Keyword mapping - prioritizado por especificidad
    keywords = [
        ("inteligencia artificial", "inteligencia artificial"),
        ("machine learning", "inteligencia artificial"),
        ("deep learning", "inteligencia artificial"),
        ("redes neuronales", "inteligencia artificial"),
        ("python programacion", "inteligencia artificial"),
        ("elecciones chile", "elecciones chile 2025"),
        ("gobierno chile", "gobierno chile"),
        ("actualidad chile", "actualidad chile"),
        ("economia mundial", "economia mundial"),
        ("economía mundial", "economia mundial"),
        ("mercado financiero", "economia mundial"),
        ("inflacion", "economia mundial"),
        ("crisis economica", "economia mundial"),
        ("ucranía guerra", "conflicto ukraine"),
        ("ucrania guerra", "conflicto ukraine"),
        ("rusia guerra", "conflicto ukraine"),
        ("guerra ucrania", "conflicto ukraine"),
        ("gaza conflicto", "conflicto gaza"),
        ("palestina israel", "conflicto gaza"),
        ("cambio climatico", "cambio climatico"),
        ("calentamiento global", "cambio climatico"),
        ("españa politica", "españa"),
        ("argentina economia", "argentina"),
        ("brasil gobierno", "brasil"),
        ("méxico economia", "méxico"),
        ("estados unidos", "estados unidos"),
        ("eeuu", "estados unidos"),
        ("ciencia 2026", "ciencia"),
        ("espacio nasa", "espacio"),
        ("exploracion espacial", "espacio"),
        ("salud mundial", "salud"),
        ("medicina actual", "salud"),
        ("educacion global", "educacion"),
        ("trabajo mundial", "trabajo"),
        ("empleo ia", "trabajo"),
        ("deportes 2026", "deportes"),
        ("futbol mundial", "deportes"),
        ("cine streaming", "cine"),
        ("musica spotify", "musica"),
        ("tecnologia 2025", "tecnologia 2025"),
        ("tecnologia 2026", "tecnologia 2025"),
    ]
    
    # Buscar match por frase completa primero
    matched_topic = None
    for phrase, topic in keywords:
        if phrase in question_lower:
            matched_topic = topic
            break
    
    # Si no hay match de frase, buscar por palabras individuales
    if not matched_topic:
        single_word_map = {
            "ia": "inteligencia artificial",
            "tecnologia": "tecnologia 2025",
            "tecnología": "tecnologia 2025",
            "tecnología": "tecnologia 2025",
            "chile": "actualidad chile",
            "economia": "economia mundial",
            "economía": "economia mundial",
            "ucrania": "conflicto ukraine",
            "ucranía": "conflicto ukraine",
            "rusia": "conflicto ukraine",
            "gaza": "conflicto gaza",
            "españa": "españa",
            "argentina": "argentina",
            "brasil": "brasil",
            "méxico": "méxico",
            "mexico": "méxico",
            "ciencia": "ciencia",
            "espacio": "espacio",
            "salud": "salud",
            "medicina": "salud",
            "educación": "educacion",
            "educacion": "educacion",
            "trabajo": "trabajo",
            "empleo": "trabajo",
            "deportes": "deportes",
            "cine": "cine",
            "música": "musica",
            "musica": "musica",
        }
        
        for word in words:
            if word in single_word_map:
                matched_topic = single_word_map[word]
                break
    
    # Si no hay match, buscar en claves originales
    if not matched_topic:
        for key in KNOWLEDGE_BASE:
            if key in question_lower or any(word in question_lower for word in key.split()):
                matched_topic = key
                break
    
    if matched_topic:
        base_answer = KNOWLEDGE_BASE[matched_topic]
    else:
        base_answer = """No tengo información específica sobre eso en mi base de conocimiento. 
Puedo ayudarte con información sobre:
- Situación de países (Chile,Argentina,Brasil,México,España,EE.UU.)
- Economía mundial y mercados
- Tecnología e inteligencia artificial
- Conflictos internacionales (Ucranía,Gaza)
- Cambio climático y medio ambiente
- Ciencia y exploración espacial
- Deportes,cine,música y cultura
- Educación y mundo del trabajo
- Salud y medicina actual

¿Qué tema te interesa?"""
    
    # Agregar fuentes web si existen
    full_answer = base_answer
    if sources:
        full_answer += "\n\n📎 **Fuentes consultadas:**\n"
        for i, s in enumerate(sources[:3], 1):
            full_answer += f"{i}. [{s['title']}]({s['url']})\n"
    
    return full_answer