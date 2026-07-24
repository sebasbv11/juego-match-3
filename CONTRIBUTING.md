# Guía de contribución de GemQuest

Esta guía establece el flujo mínimo para desarrollar, revisar e integrar cambios en GemQuest.

## Requisitos

- Git.
- Node.js 24 o superior.
- npm.
- Un archivo `.env` local creado desde `.env.example`.

Las llaves incluidas en `.env` deben ser públicas de cliente. Nunca se deben almacenar llaves secretas, contraseñas de base de datos ni tokens administrativos en el repositorio.

## Preparación

```bash
git clone https://github.com/sebasbv11/juego-match-3.git
cd juego-match-3
npm ci
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Estrategia de ramas

GemQuest utiliza GitHub Flow. `master` representa la versión integrada y desplegable.

1. Actualizar `master`.
2. Crear una rama corta para una sola finalidad.
3. Realizar commits pequeños y verificables.
4. Abrir un pull request hacia `master`.
5. Corregir los problemas detectados por GitHub Actions o SonarCloud.
6. Integrar únicamente cuando las verificaciones estén aprobadas.

Prefijos recomendados:

- `feature/`: nueva funcionalidad.
- `fix/`: corrección de comportamiento.
- `docs/`: documentación.
- `refactor/`: mejora interna sin cambiar el comportamiento.
- `test/`: pruebas.
- `chore/`: mantenimiento técnico.

## Validación local

Antes de abrir un pull request:

```bash
npm run build
npm test
npm run test:coverage
```

La cobertura de líneas debe mantenerse en 60 % o más. También se debe comprobar manualmente el flujo afectado en escritorio y móvil.

## Commits

Se recomienda el formato:

```text
tipo: descripción breve en infinitivo
```

Ejemplos:

```text
feat: agregar ranking diario por nivel
fix: evitar parpadeo al cargar el ranking
docs: documentar estrategia de rollback
```

No se deben combinar cambios funcionales, refactorizaciones y documentación no relacionada en un mismo commit.

## Pull requests

El pull request debe indicar:

- Problema o historia de usuario atendida.
- Solución implementada.
- Pruebas ejecutadas.
- Capturas cuando exista un cambio visual.
- Riesgos, variables o pasos de despliegue.

GitHub Actions ejecuta instalación determinista, build y pruebas con cobertura. Render despliega automáticamente los cambios integrados en `master`.

## Cambios de arquitectura

Las decisiones que afecten módulos, persistencia, seguridad, servicios externos o despliegue deben documentarse como un ADR dentro de `docs/adr/`.

## Revisión

La revisión debe comprobar:

- Correspondencia con la historia de usuario.
- Separación entre lógica y presentación.
- Ausencia de secretos.
- Pruebas para las reglas modificadas.
- Accesibilidad y adaptación responsive.
- Actualización de `README.md`, `docs/modelado.md` o ADRs cuando corresponda.
