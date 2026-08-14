---
tipo: indice
carrera: Ingeniería Comercial
tags:
  - ingenieria-comercial
  - carrera
---

# Carrera — Registro y Seguimiento

Registro personal del proceso académico: horario, asignaturas, apuntes de clase y avance del semestre.

Este índice es el punto de entrada. Cada asignatura tiene su ficha propia y los apuntes de clase se guardan por fecha.

## Datos del estudiante

| Campo | Valor | Fuente |
|---|---|---|
| Nombre | Kevin Alonso Conejera Morales | Horario oficial |
| Jornada | Diurno | Horario oficial |
| Nodo | 2 | Horario oficial |
| Universidad | Universidad Bernardo O'Higgins (UBO) | Inferido — **por confirmar** |
| Carrera | **Ingeniería Comercial** | Confirmado |
| Periodo / semestre | Por confirmar | — |

> **Sobre la universidad:** no aparece escrita en el horario. Se infiere desde el archivo que se
> intentó subir el 2026-08-14, que resultó ser la página de acceso de `aulavirtual.ubo.cl`.
> Confírmalo y se corrige aquí.

## Asignaturas del semestre

| Asignatura | Código | Día | Horario | Sala | Ficha |
|---|---|---|---|---|---|
| Control de Gestión | 01CGE001081-D001 | Martes | 08:30 – 10:40 | R210 | [ver](asignaturas/control-de-gestion.md) |
| Gestión de Proyectos | 01GEP001081-D001 | Miércoles | 08:30 – 10:40 | F-10 | [ver](asignaturas/gestion-de-proyectos.md) |
| Econometría (Lab) | 02ECO001061-D001 | Miércoles | 12:10 – 15:20 | LAB.COMP.RDZ1 | [ver](asignaturas/econometria.md) |
| Derecho Tributario | 01DRT001081-D001 | Jueves | 14:40 – 16:50 | D-14 | [ver](asignaturas/derecho-tributario.md) |
| Negociación y Desarrollo del Liderazgo | 01NDC001061-D001 | Viernes | 10:40 – 12:50 | S. Gaete | [ver](asignaturas/negociacion-y-liderazgo.md) |
| Macroeconomía II | 01MAC001052-D001 | Viernes | 15:20 – 17:30 | F-12 | [ver](asignaturas/macroeconomia-ii.md) |

Horario completo en formato semanal: [horario.md](horario.md)

## Apuntes de clase

| Fecha | Asignatura | Tema | Estado |
|---|---|---|---|
| 2026-08-14 | Negociación y Liderazgo | [Cultura, Comportamiento y Clima Organizacional](apuntes/2026-08-14-negociacion-estructura-organizacional.md) | Completo |
| 2026-08-13 | Derecho Tributario | [Conceptos y temas por investigar](apuntes/2026-08-13-derecho-tributario-conceptos.md) | Completo |

## Pendientes

- [ ] Confirmar el periodo académico (semestre y año).
- [ ] Registrar fechas de las 3 evaluaciones de Negociación y Liderazgo.
- [ ] Registrar evaluaciones de las otras 5 asignaturas.
- [ ] Registrar nombres de los profesores restantes (el horario los muestra como marcador de posición).

## Cómo se usa esto

- **Ficha de asignatura** (`asignaturas/`): datos fijos del ramo, evaluaciones, material y el listado de apuntes.
- **Apunte de clase** (`apuntes/`): un archivo por sesión, nombrado `AAAA-MM-DD-asignatura-tema.md`.
- Al agregar un apunte, enlázalo desde la ficha de la asignatura y desde la tabla de arriba.

## Método de apuntes

En clase se anotan los **títulos y conceptos**, no definiciones completas. Las definiciones se
buscan después y se van completando bajo cada concepto en el apunte correspondiente.

Por eso los apuntes de conceptos llevan una tabla de estado arriba: sirve para ver de un vistazo
qué falta por investigar y qué ya está cerrado.

**Regla permanente:** todo concepto que aparezca sin definición se investiga y se explica en el
apunte, con sus fuentes al final. No se deja pendiente a la espera de que lo pidan.

## Destino: segundo cerebro en Obsidian

Todo esto se va a migrar a una bóveda de Obsidian, donde vivirá el material de Ingeniería
Comercial. Los archivos ya se escriben pensando en eso:

- **Frontmatter YAML en cada archivo** — `tipo`, `carrera`, `asignatura`, `codigo`, `fecha`,
  `profesor`, `tags`. Obsidian lo lee como propiedades, así que al copiar la carpeta las notas
  quedan filtrables y consultables con Dataview sin retocar nada.
- **Un archivo por clase y por asignatura**, nunca un documento gigante. Es la unidad que Obsidian
  enlaza y respalda el trabajo por notas atómicas.
- **Enlaces markdown relativos** (`../asignaturas/x.md`) en vez de `[[wikilinks]]`. Obsidian los
  resuelve bien y además se ven en GitHub, que es donde vive esto hoy. Si más adelante prefieres
  wikilinks, la conversión es mecánica.
- **Nombres de archivo estables**, con fecha al inicio en los apuntes. Renombrar rompe enlaces en
  Obsidian, así que conviene no tocarlos una vez creados.

Al migrar, la carpeta `docs/carrera/` se copia tal cual dentro de la bóveda.

## Convenciones

- Fechas en formato `AAAA-MM-DD`.
- Lo que no está confirmado se marca explícitamente como **por confirmar**, nunca se rellena a ojo.
- Un concepto sin definición se deja como *pendiente*; no se inventa una definición para rellenar.
