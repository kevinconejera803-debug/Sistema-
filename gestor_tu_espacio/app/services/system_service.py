"""
Servicio de comandos locales del sistema.
"""
import subprocess
import platform
import os
from app.config import logger, CYBER_LOCAL_COMMANDS

def _is_enabled() -> bool:
    """Verificar si los comandos locales están habilitados."""
    if os.environ.get("CYBER_LOCAL_COMMANDS", "0") != "1":
        return False
    return platform.system() == "Windows"

def run_command(command: str) -> dict:
    """Ejecutar comando local y retornar resultado."""
    if not _is_enabled():
        return {"error": "Comandos locales deshabilitados", "success": False}

    allowed_commands = {
        "firewall": ["netsh", "advfirewall", "show", "allprofiles", "state"],
        "firewall_status": ["netsh", "advfirewall", "show", "allprofiles"],
        "windows_update": ["powershell", "-Command", "Get-Service", "-Name", "wuauserv"],
        "bitlocker": ["manage-bde", "-status"],
        "antivirus": ["powershell", "-Command", "Get-MpComputerStatus"],
        "disk_space": ["wmic", "logicaldisk", "get", "size,freespace,name"],
        "systeminfo": ["systeminfo"],
        "ipconfig": ["ipconfig"],
        "whoami": ["whoami", "/all"],
    }

    cmd_key = command.split()[0] if command else ""
    if cmd_key not in allowed_commands:
        return {"error": f"Comando no permitido: {cmd_key}", "success": False}

    try:
        if command.startswith("firewall_status"):
            result = subprocess.run(
                ["netsh", "advfirewall", "show", "allprofiles"],
                capture_output=True, text=True, timeout=10
            )
            return {"output": result.stdout or result.stderr, "success": True}
        
        elif command.startswith("firewall"):
            result = subprocess.run(
                ["netsh", "advfirewall", "show", "allprofiles", "state"],
                capture_output=True, text=True, timeout=10
            )
            return {"output": result.stdout or result.stderr, "success": True}
        
        elif command.startswith("windows_update"):
            result = subprocess.run(
                ["powershell", "-Command", "Get-Service -Name wuauserv | Select Status"],
                capture_output=True, text=True, timeout=10
            )
            return {"output": result.stdout or result.stderr, "success": True}
        
        elif command.startswith("bitlocker"):
            result = subprocess.run(
                ["manage-bde", "-status"],
                capture_output=True, text=True, timeout=15
            )
            return {"output": result.stdout or result.stderr, "success": True}
        
        elif command.startswith("antivirus"):
            result = subprocess.run(
                ["powershell", "-Command", "Get-MpComputerStatus | Select RealTimeProtectionEnabled, AntivirusEnabled"],
                capture_output=True, text=True, timeout=10
            )
            return {"output": result.stdout or result.stderr, "success": True}
        
        elif command.startswith("disk_space"):
            result = subprocess.run(
                ["wmic", "logicaldisk", "get", "size,freespace,name"],
                capture_output=True, text=True, timeout=10
            )
            return {"output": result.stdout or result.stderr, "success": True}
        
        elif command.startswith("systeminfo"):
            result = subprocess.run(
                ["systeminfo"],
                capture_output=True, text=True, timeout=30
            )
            return {"output": result.stdout or result.stderr, "success": True}
        
        elif command.startswith("ipconfig"):
            result = subprocess.run(
                ["ipconfig", "/all"],
                capture_output=True, text=True, timeout=10
            )
            return {"output": result.stdout or result.stderr, "success": True}
        
        elif command.startswith("whoami"):
            result = subprocess.run(
                ["whoami", "/all"],
                capture_output=True, text=True, timeout=10
            )
            return {"output": result.stdout or result.stderr, "success": True}
        
        return {"error": "Comando no implementado", "success": False}
        
    except subprocess.TimeoutExpired:
        return {"error": "Tiempo de espera agotado", "success": False}
    except Exception as e:
        logger.error(f"Error ejecutando comando: {e}")
        return {"error": str(e), "success": False}

def get_security_status() -> dict:
    """Obtener estado general de seguridad del sistema."""
    if not _is_enabled():
        return {"error": "Comandos locales deshabilitados", "success": False}
    
    status = {"success": True, "checks": {}}
    
    try:
        result = subprocess.run(
            ["netsh", "advfirewall", "show", "allprofiles", "state"],
            capture_output=True, text=True, timeout=10
        )
        status["checks"]["firewall"] = "ON" if "ON" in result.stdout.upper() else "OFF"
    except:
        status["checks"]["firewall"] = "UNKNOWN"
    
    try:
        result = subprocess.run(
            ["powershell", "-Command", "(Get-MpComputerStatus).RealTimeProtectionEnabled"],
            capture_output=True, text=True, timeout=10
        )
        status["checks"]["defender"] = "ON" if "True" in result.stdout else "OFF"
    except:
        status["checks"]["defender"] = "UNKNOWN"
    
    try:
        result = subprocess.run(
            ["manage-bde", "-status"],
            capture_output=True, text=True, timeout=15
        )
        status["checks"]["bitlocker"] = "ON" if "ON" in result.stdout.upper() else "OFF"
    except:
        status["checks"]["bitlocker"] = "UNKNOWN"
    
    return status