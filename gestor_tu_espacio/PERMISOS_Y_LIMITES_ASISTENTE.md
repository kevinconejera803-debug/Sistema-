# Qué el asistente puede y no puede hacer (permisos)

Úsalo para saber qué debes hacer tú o qué permisos hay que dar en Cursor / el sistema.

## Puedo hacer en tu workspace (cuando el proyecto está abierto aquí)

- Editar archivos del repo, ejecutar comandos en **tu terminal local** (PowerShell), probar `python`, `git` si existen en el PATH.
- Proponer scripts (`setup_git_cloud`, `verificar_entorno.ps1`, etc.) que **tú** ejecutas.

## No puedo hacer (necesito que tú o el sistema lo resuelvan)

| Límite | Qué necesitas hacer |
|--------|----------------------|
| **Instalar Node, Python, Git** en tu máquina | Instaladores oficiales + opción “Add to PATH”. Luego cerrar y abrir la terminal. |
| **Credenciales de GitHub** (PAT, contraseña, SSH) | Crear token en GitHub y usar `push_con_token` / Credential Manager / `gh auth login`. No debo pegar tokens en el chat ni en archivos del repo. |
| **Push / pull desde `/workspace` o agente en la nube** | Ese entorno no tiene tus mismas credenciales. Ejecuta `git pull` / `git push` en **tu PC** o configura token/SSH **en ese entorno** (documentado en el README raíz, sección Git 403). |
| **Políticas de red, proxy corporativo, firewall** | IT o `NO_PROXY` / proxy correcto; el repo solo puede sugerir `setup_git_cloud`. |
| **Permisos de administrador en Windows** | Ejecutar instaladores o cambiar `ExecutionPolicy` como administrador si tu organización lo exige. |
| **Garantizar que `pip install` termine en X segundos** | Red lenta o mirrors; repetir o usar `pip install -r requirements.txt` en venv. |
| **Acceder a cuentas o repos privados** sin que inicies sesión | Tú debes autorizar en el navegador o con token. |

## Script útil

Desde la raíz del repo (donde está `gestor_tu_espacio`):

```powershell
.\gestor_tu_espacio\scripts\repo\verificar_entorno.ps1
```

Comprueba Python, dependencias de Tu espacio, Git y avisa si falta Node (opcional).
