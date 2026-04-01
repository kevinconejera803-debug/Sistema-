# Guía del repositorio — trabajo con ambas apps

Esta guía en la **raíz** del repo sirve para lo **común**: Git, convivencia de las dos apps y enlaces a la documentación **dentro de cada carpeta**.

- **Estructura y scripts de limpieza:** [ESTRUCTURA.md](ESTRUCTURA.md)
- **Solo Historia (venv, pip, puerto 5001, `historia.db`):** [gestor_historia/GUIA.md](gestor_historia/GUIA.md)  
- **Solo Tu espacio (venv, pip, puerto 5000, Trading Lab, `tu_espacio.db`):** [gestor_tu_espacio/GUIA.md](gestor_tu_espacio/GUIA.md)

---

## 1. Por qué dos carpetas

| Carpeta | Contenido |
|---------|-----------|
| `gestor_tu_espacio/` | Productividad, calendario, **Trading Lab**, tareas… |
| `gestor_historia/` | Simulador narrativo (Nexo, misiones, tienda del juego, etc.) |

Cada una tiene su **`requirements.txt`** y su **`.db`**. No uses un solo venv para las dos.

---

## 2. Git (desde la raíz `Ejercicios practicos`)

### PowerShell — estado y commit

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
git status
git add .
git commit -m "Describe el cambio"
```

### PowerShell — identidad (solo este repositorio)

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
git config user.name "Tu nombre"
git config user.email "tu@email.com"
```

### PowerShell — identidad global en tu PC

```powershell
git config --global user.name "Tu nombre"
git config --global user.email "tu@email.com"
```

Lo que **no** debe subirse suele estar en `.gitignore` (`.venv/`, `venv/`, `*.db`, `uploads/`, `.env` con secretos).

---

## 3. Arrancar las dos apps (recordatorio)

Abre **dos terminales**. En cada una entra **solo** al venv de **su** carpeta (los comandos exactos están en cada `GUIA.md`):

1. **Tu espacio** → [gestor_tu_espacio/GUIA.md](gestor_tu_espacio/GUIA.md) — suele ser **5000**.  
2. **Historia** → [gestor_historia/GUIA.md](gestor_historia/GUIA.md) — suele ser **5001**.

---

## 4. Eliminar restos del monolito `gestor_tareas`

Si aún existe la carpeta y quieres borrarla (cierra Python que use ese `venv`):

### PowerShell

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
.\eliminar_gestor_tareas_restante.ps1
```

---

## 5. Índice de documentación por carpeta

| Ubicación | Archivo |
|-----------|---------|
| Raíz | [README.md](README.md) |
| Raíz | Este archivo (`GUIA_DESARROLLO.md`) |
| `gestor_historia/` | [gestor_historia/README.md](gestor_historia/README.md) |
| `gestor_historia/` | [gestor_historia/GUIA.md](gestor_historia/GUIA.md) |
| `gestor_tu_espacio/` | [gestor_tu_espacio/README.md](gestor_tu_espacio/README.md) |
| `gestor_tu_espacio/` | [gestor_tu_espacio/GUIA.md](gestor_tu_espacio/GUIA.md) |
