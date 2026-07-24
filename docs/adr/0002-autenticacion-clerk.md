# ADR-002: Autenticación administrada con Clerk

- Estado: Aceptada
- Fecha: 2026-07-10

## Contexto

El juego requiere identificar al jugador para separar su progreso y mostrar una experiencia de acceso coherente, sin construir un sistema propio de contraseñas.

## Decisión

Utilizar Clerk para registro, inicio y cierre de sesión. La aplicación usa la llave publicable de Clerk y almacena el progreso local bajo una clave asociada con el identificador del usuario.

## Consecuencias

- El equipo no almacena contraseñas.
- Clerk administra los flujos de identidad.
- El juego depende de la disponibilidad y configuración de Clerk.
- La llave publicable puede llegar al navegador; una llave secreta nunca debe incorporarse al frontend.
- El progreso continúa siendo local al navegador y no se sincroniza entre dispositivos.
