# GemQuest - Planificacion, gestion agil y modelado

Este archivo es el documento vivo del proyecto GemQuest. Consolida el contenido del documento Word `Planificacion_Gestion_Agil_GemQuest.docx`, el Markdown del Entregable 1 y las actualizaciones realizadas en el MVP funcional.

Cada cambio relevante del producto debe reflejarse aqui: historias, alcance, reglas, diagramas, modelo de dominio, estados, evidencias y trazabilidad con el codigo.

## Datos del documento base

| Campo | Valor |
| --- | --- |
| Facultad | Facultad de Ciencias de la Vida y Tecnologias |
| Tema | Proyecto Final - GemQuest |
| Profesor | Ing. Israel Julio Gomez Calderon |
| Materia | Modelado Agil de Software |
| Fecha del documento base | 01 de julio del 2026 |

### Integrantes

- Jose Luis Sarabia Calderon
- Sebastian Esteban Alvarez De la Rosa
- Romero Ponce Jostin Paul
- Adriel Elias Sanchez Zaldumbide
- Jordy Sebastian Bravo Veliz

## Estado actual del MVP

El MVP implementado corresponde a la opcion B: juego casual tipo Match-3. La solucion esta construida como aplicacion web estatica con HTML, CSS y JavaScript modular.

| Area | Estado actual |
| --- | --- |
| Tablero Match-3 | Implementado |
| Intercambio de fichas adyacentes | Implementado |
| Deteccion de combinaciones 3+ | Implementado |
| Eliminacion, cascadas, gravedad y recarga | Implementado |
| Puntuacion y movimientos limitados | Implementado |
| Descuento por intento adyacente | Implementado: todo intercambio adyacente consume 1 movimiento, aunque no coincida. |
| Tres niveles con objetivos distintos | Implementado |
| Persistencia de progreso | Implementado con `localStorage` |
| Mejor puntuacion por nivel | Implementado con `localStorage` y ranking diario online en Supabase |
| Estrellas de maestria por nivel | Implementado con `localStorage` |
| Ranking diario por nivel | Implementado con Supabase, Top 10 por nivel y reinicio diario por fecha |
| Pantallas de inicio, niveles y resultado | Implementadas |
| Menu visual | Implementado con imagen de fondo generada y pantalla completa |
| Tarjetas dinamicas de niveles | Implementadas con estados, gradientes y emblemas CSS |
| Retroalimentacion visual y sonido | Implementado con animaciones, combos, tonos y musica en loop |
| Arquitectura modular de frontend | Implementada con modulos de aplicacion, vistas, sonido, persistencia, maestria y logica |
| Pruebas automatizadas | Implementadas con `node --test` |
| CI/CD | Pipeline basico en GitHub Actions |
| Contenedorizacion | `Dockerfile` incluido |
| Base de datos externa | Supabase para ranking diario por nivel |

# 1. Planificacion y gestion agil

## 1.1 Metodologia agil seleccionada

Para el desarrollo de **GemQuest** se selecciono **Scrum** como metodologia agil, debido a que permite organizar el trabajo mediante iteraciones cortas, entregas incrementales y adaptacion continua ante cambios en los requisitos.

GemQuest es un juego web tipo **Match-3**, inspirado en mecanicas similares a Candy Crush, donde el jugador intercambia gemas adyacentes para formar combinaciones de tres o mas elementos iguales. El proyecto se planifica como un **Producto Minimo Viable (MVP)** dividido en dos sprints.

### Roles Scrum

| Rol | Responsable | Funciones principales |
| --- | --- | --- |
| Product Owner | Equipo del proyecto | Define la vision del producto, prioriza el Product Backlog y valida que las historias cumplan los criterios de aceptacion. |
| Scrum Master | Equipo del proyecto | Facilita las ceremonias Scrum, da seguimiento al tablero y ayuda a resolver impedimentos. |
| Equipo de desarrollo | Integrantes del equipo | Disena, implementa, prueba e integra las funcionalidades del juego. |

## 1.2 Vision del producto

**GemQuest** permitira al jugador iniciar una partida, visualizar un tablero de gemas, intercambiar piezas, formar combinaciones, acumular puntos, completar objetivos por nivel y guardar su progreso.

El MVP incluye:

- Tablero funcional de gemas.
- Intercambio de fichas adyacentes.
- Deteccion y eliminacion de combinaciones.
- Sistema de gravedad y generacion de nuevas fichas.
- Tres niveles con objetivos definidos.
- Sistema de puntuacion y movimientos limitados.
- Sistema de maestria con 1 a 3 estrellas por nivel.
- Retroalimentacion de combos/cascadas.
- Persistencia basica del progreso.
- Ranking diario por nivel como ampliacion del record del jugador.
- Interfaz clara para iniciar, jugar, ganar o perder una partida.

## 1.3 Product Backlog

El Product Backlog contiene las historias de usuario priorizadas para construir el MVP de GemQuest. Cada historia se relaciona con una epica, una prioridad MoSCoW y una estimacion de esfuerzo.

| ID | Nombre | Epica | Historia de usuario | Prioridad MoSCoW | Estimacion | Estado actual |
| --- | --- | --- | --- | --- | --- | --- |
| HU-01 | Generar tablero valido | EP-01 Gestion del tablero | Como jugador, quiero que el juego genere automaticamente un tablero valido para comenzar una partida inmediatamente. | Must | M | Implementado |
| HU-02 | Intercambiar fichas | EP-02 Mecanicas del juego | Como jugador, quiero intercambiar dos gemas adyacentes para intentar formar combinaciones. | Must | M | Implementado |
| HU-03 | Detectar combinaciones | EP-02 Mecanicas del juego | Como jugador, quiero que el juego detecte combinaciones de tres o mas gemas iguales para validar mis movimientos. | Must | L | Implementado |
| HU-04 | Eliminar combinaciones | EP-02 Mecanicas del juego | Como jugador, quiero que las combinaciones encontradas se eliminen del tablero para recibir puntos. | Must | M | Implementado |
| HU-05 | Aplicar gravedad | EP-01 Gestion del tablero | Como jugador, quiero que las gemas caigan automaticamente para ocupar los espacios vacios. | Must | L | Implementado |
| HU-06 | Generar nuevas fichas | EP-01 Gestion del tablero | Como jugador, quiero que aparezcan nuevas gemas para mantener el tablero completo. | Must | M | Implementado |
| HU-07 | Sistema de puntuacion | EP-03 Sistema de niveles | Como jugador, quiero obtener puntos por cada combinacion realizada para medir mi avance. | Must | S | Implementado |
| HU-08 | Movimientos limitados | EP-03 Sistema de niveles | Como jugador, quiero tener una cantidad limitada de movimientos para que el nivel represente un reto. | Must | S | Implementado |
| HU-09 | Objetivos por nivel | EP-03 Sistema de niveles | Como jugador, quiero objetivos diferentes por nivel para que cada partida tenga una meta clara. | Must | L | Implementado |
| HU-10 | Pantalla de inicio | EP-04 Interfaz de usuario | Como jugador, quiero una pantalla de inicio para acceder facilmente al juego. | Should | XS | Implementado |
| HU-11 | Seleccion de nivel | EP-04 Interfaz de usuario | Como jugador, quiero seleccionar el nivel que deseo jugar para continuar mi progreso. | Should | S | Implementado |
| HU-12 | Pantalla de victoria | EP-04 Interfaz de usuario | Como jugador, quiero ver una pantalla de victoria cuando cumpla el objetivo del nivel. | Should | XS | Implementado |
| HU-13 | Pantalla de derrota | EP-04 Interfaz de usuario | Como jugador, quiero ver una pantalla de derrota cuando se terminen mis movimientos sin cumplir el objetivo. | Should | XS | Implementado |
| HU-14 | Guardar progreso | EP-05 Persistencia | Como jugador, quiero guardar mi progreso para continuar desde el ultimo nivel desbloqueado. | Should | M | Implementado |
| HU-15 | Guardar record | EP-05 Persistencia | Como jugador, quiero guardar mi mejor puntuacion para intentar superar mi record. | Could | S | Implementado |
| HU-16 | Animaciones | EP-06 Experiencia de usuario | Como jugador, quiero animaciones al eliminar y caer gemas para que el juego se sienta mas dinamico. | Could | M | Implementado |
| HU-17 | Sonidos | EP-06 Experiencia de usuario | Como jugador, quiero efectos de sonido para recibir retroalimentacion durante la partida. | Could | S | Implementado |

### Estimacion y priorizacion

La estimacion se realizo mediante **T-shirt sizing**, usando las tallas **XS, S, M, L y XL**. Esta tecnica se aplico de forma manual durante la planificacion del equipo, comparando la complejidad, esfuerzo e incertidumbre de cada historia de usuario.

La priorizacion se realizo con **MoSCoW**:

- **Must Have:** indispensable para el MVP.
- **Should Have:** importante, pero no bloquea la funcionalidad principal.
- **Could Have:** deseable si queda tiempo.
- **Won't Have:** fuera del alcance de esta entrega.

## 1.4 Criterios de aceptacion

| ID | Criterios de aceptacion |
| --- | --- |
| HU-01 | El tablero se genera al iniciar una partida. No existen combinaciones iniciales automaticas. Todas las celdas del tablero contienen una gema visible. |
| HU-02 | El jugador puede seleccionar dos gemas adyacentes. El intercambio solo se permite si las gemas estan una al lado de la otra. Si el movimiento no genera combinacion, las gemas regresan a su posicion original y se descuenta 1 movimiento por el intento. |
| HU-03 | El sistema identifica combinaciones horizontales y verticales de tres o mas gemas iguales. Las combinaciones se detectan despues de cada intercambio adyacente intentado. |
| HU-04 | Las gemas combinadas desaparecen del tablero. El sistema actualiza el puntaje despues de eliminar una combinacion. No se eliminan gemas que no formen parte de una combinacion. |
| HU-05 | Las gemas superiores caen para llenar los espacios vacios. La gravedad se aplica hasta que no queden huecos intermedios. El tablero mantiene su tamano original. |
| HU-06 | Se generan nuevas gemas en los espacios vacios de la parte superior. Las nuevas gemas se integran al tablero despues de aplicar gravedad. El tablero queda completo al finalizar la jugada. |
| HU-07 | El puntaje aumenta al eliminar combinaciones. Las combinaciones mas grandes otorgan mayor puntaje. El puntaje actual se muestra durante la partida. |
| HU-08 | Cada intercambio adyacente intentado reduce en uno el contador de movimientos, aunque no genere combinacion. El contador se muestra en pantalla. Cuando llega a cero, el juego evalua si el nivel fue ganado o perdido. |
| HU-09 | Cada nivel tiene un objetivo especifico. El juego valida automaticamente si el objetivo fue cumplido. Al cumplir el objetivo, se muestra la pantalla de victoria. |
| HU-10 | La pantalla de inicio muestra el nombre del juego. Incluye un boton para comenzar. El boton lleva al flujo principal del juego. |
| HU-11 | La pantalla de seleccion muestra los niveles disponibles. Los niveles bloqueados no pueden seleccionarse. El jugador puede iniciar un nivel desbloqueado. |
| HU-12 | La pantalla de victoria aparece al cumplir el objetivo. Muestra el puntaje obtenido. Permite avanzar o volver a la seleccion de nivel. |
| HU-13 | La pantalla de derrota aparece cuando se agotan los movimientos sin cumplir el objetivo. Permite reintentar el nivel. |
| HU-14 | El progreso se guarda al completar un nivel. Al volver al juego se conserva el ultimo nivel desbloqueado. El guardado funciona aunque se cierre el navegador. |
| HU-15 | El sistema guarda la mejor puntuacion obtenida. Si el jugador supera su record, el valor anterior se actualiza. El record se muestra en la interfaz. Como mejora posterior, al ganar un nivel se publica el puntaje en un ranking diario por nivel usando Supabase y se conserva solo el mejor resultado diario del jugador. |
| HU-16 | Las gemas tienen animacion al desaparecer. La seleccion, eliminacion, tarjetas de nivel, mensajes de combo, estrellas de maestria y resultados entregan retroalimentacion visual sin impedir jugar correctamente. |
| HU-17 | El juego reproduce sonidos en acciones importantes y musica de fondo en loop. Los sonidos no se superponen de forma molesta. El jugador puede activar o desactivar sonido. |

## 1.5 Priorizacion MoSCoW

| Categoria | Historias incluidas | Justificacion |
| --- | --- | --- |
| Must Have | HU-01, HU-02, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09 | Son necesarias para que el juego sea funcional y el MVP pueda completarse. |
| Should Have | HU-10, HU-11, HU-12, HU-13, HU-14 | Mejoran el flujo de usuario y permiten una experiencia completa, aunque la mecanica principal puede existir sin ellas. |
| Could Have | HU-15, HU-16, HU-17 | Aportan valor adicional, rejugabilidad y mejor experiencia, pero no son indispensables para la entrega inicial. |
| Won't Have | Tienda, sistema de vidas | Se excluyen para mantener el alcance del MVP dentro del tiempo disponible. |

## 1.6 Planificacion de sprints

### Sprint 1: mecanica principal del juego

**Objetivo:** construir el nucleo jugable de GemQuest, permitiendo generar el tablero, mover gemas, detectar combinaciones y actualizar el tablero despues de cada jugada.

**Duracion estimada:** 1 semana.

| Historia | Actividades principales | Estado esperado | Estado actual |
| --- | --- | --- | --- |
| HU-01 | Crear estructura del tablero y generar gemas iniciales. | Terminado | Terminado |
| HU-02 | Implementar seleccion e intercambio de gemas adyacentes. | Terminado | Terminado |
| HU-03 | Programar deteccion de combinaciones horizontales y verticales. | Terminado | Terminado |
| HU-04 | Eliminar combinaciones detectadas y preparar actualizacion del tablero. | Terminado | Terminado |
| HU-05 | Implementar gravedad para llenar espacios vacios. | Terminado | Terminado |
| HU-06 | Generar nuevas gemas despues de aplicar gravedad. | Terminado | Terminado |

### Sprint 2: MVP completo e interfaz

**Objetivo:** completar las reglas del juego, niveles, pantallas principales, persistencia y mejoras de experiencia.

**Duracion estimada:** 1 semana.

| Historia | Actividades principales | Estado esperado en documento base | Estado actual |
| --- | --- | --- | --- |
| HU-07 | Implementar calculo y visualizacion de puntaje. | Terminado | Terminado |
| HU-08 | Agregar contador de movimientos limitados. | Terminado | Terminado |
| HU-09 | Definir objetivos por nivel y validacion de victoria. | Terminado | Terminado |
| HU-10 | Crear pantalla de inicio. | Terminado | Terminado |
| HU-11 | Crear seleccion de nivel. | Terminado | Terminado |
| HU-12 | Crear pantalla de victoria. | Terminado | Terminado |
| HU-13 | Crear pantalla de derrota. | Terminado | Terminado |
| HU-14 | Guardar progreso del jugador. | Terminado | Terminado |
| HU-15 | Guardar mejor puntuacion. | Pendiente o en progreso | Terminado |
| HU-16 | Agregar animaciones. | Pendiente o en progreso | Terminado |
| HU-17 | Agregar sonidos. | Pendiente o en progreso | Terminado |

## 1.7 Ceremonias Scrum documentadas

### Sprint 1

| Ceremonia | Descripcion | Resultado |
| --- | --- | --- |
| Sprint Planning | Se reviso el Product Backlog y se seleccionaron las historias indispensables para construir la mecanica base del juego. | Se definio el objetivo del sprint y se asignaron HU-01 a HU-06. |
| Daily Scrum | Se reviso el avance de las tareas, los bloqueos y las actividades pendientes del tablero. | Se identifico como principal riesgo la deteccion correcta de combinaciones y la aplicacion de gravedad. |
| Sprint Review | Se presento un tablero funcional donde el jugador podia intercambiar gemas y generar combinaciones. | Se valido que la mecanica principal funcionaba como base del MVP. |
| Sprint Retrospective | Se analizaron los avances y dificultades del sprint. | Se acordo dividir las tareas complejas en subtareas mas pequenas y probar cada mecanica por separado. |

### Sprint 2

| Ceremonia | Descripcion | Resultado |
| --- | --- | --- |
| Sprint Planning | Se priorizaron las historias relacionadas con puntuacion, movimientos, niveles, pantallas y persistencia. | Se planificaron HU-07 a HU-17, dando mayor prioridad a HU-07, HU-08, HU-09 y HU-14. |
| Daily Scrum | Se dio seguimiento al avance de interfaz, reglas de niveles y guardado de progreso. | Se detecto que los objetivos por nivel requerian mayor esfuerzo del estimado inicialmente. |
| Sprint Review | Se presento el MVP con niveles, puntaje, movimientos, pantallas de resultado y guardado basico. | Se recibio retroalimentacion sobre mejorar la claridad de los objetivos por nivel. |
| Sprint Retrospective | Se reviso el cumplimiento del MVP y el manejo del cambio de requisito. | Se concluyo que la reestimacion permitio mantener controlado el alcance del sprint. |

### Mejora posterior al MVP funcional

Despues de estabilizar el MVP, se aplicaron mejoras incrementales orientadas a experiencia y mantenibilidad:

- Menu principal con imagen generada y uso a pantalla completa.
- Audio de fondo en loop con control desde la preferencia de sonido.
- Pantalla de niveles redisenada con tarjetas dinamicas, estados y feedback visual.
- Refactor de frontend en modulos: `app.js`, `views.js`, `audio.js`, `storage.js` y `mastery.js`.
- Sistema de estrellas de maestria y feedback de combos por cascadas, documentado como mejora de HU-15, HU-16 y HU-17 sin crear nuevas historias.
- Ranking diario por nivel con Supabase como extension del record de HU-15.
- Ampliacion de pruebas automatizadas para maestria y compatibilidad de progreso guardado.

## 1.8 Tablero de gestion en Trello

Para evidenciar la gestion agil se utilizara un tablero en **Trello**, ya que permite representar visualmente el flujo de trabajo mediante listas y tarjetas.

El tablero fue configurado como evidencia del proceso Scrum aplicado al proyecto. En el se representan las historias planificadas, las tareas en progreso, las tareas en revision, las historias finalizadas, los cambios gestionados y los elementos que quedan fuera del alcance del MVP.

**Enlace al tablero Trello:** <https://trello.com/b/Bn3M92L8/gemquest-gesti%C3%B3n>

### Listas recomendadas

Crear un tablero llamado **GemQuest - Gestion Agil** con las siguientes listas:

| Lista en Trello | Uso |
| --- | --- |
| Product Backlog | Todas las historias HU-01 a HU-17 antes de ser planificadas. |
| Sprint 1 | Historias seleccionadas para el primer sprint: HU-01 a HU-06. |
| Sprint 2 | Historias seleccionadas para el segundo sprint: HU-07 a HU-17. |
| En progreso | Tarjetas que se estan desarrollando. |
| En revision | Tarjetas terminadas que deben validarse con criterios de aceptacion. |
| Terminado | Historias completadas y validadas. |
| Cambios gestionados | Requisitos modificados, reestimaciones y decisiones tomadas. |

### Tarjetas que deben crearse

- HU-01 Generar tablero valido
- HU-02 Intercambiar fichas
- HU-03 Detectar combinaciones
- HU-04 Eliminar combinaciones
- HU-05 Aplicar gravedad
- HU-06 Generar nuevas fichas
- HU-07 Sistema de puntuacion
- HU-08 Movimientos limitados
- HU-09 Objetivos por nivel
- HU-10 Pantalla de inicio
- HU-11 Seleccion de nivel
- HU-12 Pantalla de victoria
- HU-13 Pantalla de derrota
- HU-14 Guardar progreso
- HU-15 Guardar record
- HU-16 Animaciones
- HU-17 Sonidos

Si se actualiza el tablero despues del MVP, se recomienda agregar tambien tarjetas tecnicas de mejora:

- Refactor frontend modular.
- Rediseno visual de menu y seleccion de niveles.
- Audio de fondo en loop.
- Persistencia de estrellas por nivel.
- Pruebas de maestria y compatibilidad de progreso.

### Informacion dentro de cada tarjeta

- Historia de usuario.
- Epica relacionada.
- Prioridad MoSCoW.
- Estimacion T-shirt.
- Criterios de aceptacion.
- Sprint asignado.
- Estado de avance.

### Etiquetas recomendadas

| Etiqueta | Color sugerido | Uso |
| --- | --- | --- |
| Must | Rojo | Historias indispensables del MVP. |
| Should | Amarillo | Historias importantes. |
| Could | Verde | Historias deseables. |
| Sprint 1 | Azul | Historias del primer sprint. |
| Sprint 2 | Morado | Historias del segundo sprint. |
| Cambio | Naranja | Requisitos modificados o reestimados. |

### Evidencia para el documento

Para cumplir con la evidencia solicitada, se deben insertar capturas de pantalla de:

- Vista general del tablero Trello.
- Tarjetas del Sprint 1.
- Tarjetas del Sprint 2.
- Una tarjeta abierta mostrando historia, criterios de aceptacion, prioridad y estimacion.
- Tarjeta o lista de **Cambios gestionados** mostrando la modificacion de HU-09.

### Evidencia visual extraida del Word

**Figura 1. Vista general del tablero Trello**

![Figura 1. Vista general del tablero Trello](./assets/entregable-1-2/figura-1-tablero-trello.png)

Esta captura evidencia la organizacion general del flujo de trabajo, la distribucion de historias por sprint y el estado actual de cada actividad.

**Figura 2. Historias completadas del Sprint 1**

![Figura 2. Historias completadas del Sprint 1](./assets/entregable-1-2/figura-2-sprint-1-terminado.png)

Esta captura evidencia que las historias correspondientes a la mecanica principal del juego fueron completadas al cierre del Sprint 1.

**Figura 3. Seguimiento del Sprint 2**

![Figura 3. Seguimiento del Sprint 2](./assets/entregable-1-2/figura-3-seguimiento-sprint-2.png)

Esta captura evidencia que las historias del segundo sprint se encuentran distribuidas segun su estado: planificadas, en desarrollo o en revision.

**Figura 4. Detalle de historia de usuario**

![Figura 4. Detalle de historia de usuario](./assets/entregable-1-2/figura-4-detalle-historia.png)

Esta captura evidencia que las historias de usuario fueron documentadas con informacion suficiente para su desarrollo y validacion.

**Figura 5. Cambio de requisito gestionado**

![Figura 5. Cambio de requisito gestionado - vista 1](./assets/entregable-1-2/figura-5-cambio-requisito-1.png)

![Figura 5. Cambio de requisito gestionado - vista 2](./assets/entregable-1-2/figura-5-cambio-requisito-2.png)

Esta captura evidencia que el cambio de requisito fue registrado, analizado y reestimado de M a L.

**Figura 6. Futuras mejoras del producto**

![Figura 6. Futuras mejoras del producto - vista 1](./assets/entregable-1-2/figura-6-futuras-mejoras-1.png)

![Figura 6. Futuras mejoras del producto - vista 2](./assets/entregable-1-2/figura-6-futuras-mejoras-2.png)

## 1.9 Gestion de cambio de requisito

Durante la planificacion inicial, los niveles de GemQuest se definieron con un unico tipo de objetivo: alcanzar una puntuacion minima. Posteriormente se identifico que esto podia volver repetitiva la experiencia de juego, por lo que se gestiono un cambio de requisito.

| Elemento | Descripcion |
| --- | --- |
| Requisito original | Todos los niveles se completaban alcanzando una puntuacion objetivo. |
| Cambio solicitado | Incluir objetivos diferentes por nivel, por ejemplo alcanzar cierta puntuacion, eliminar una cantidad especifica de gemas o completar el nivel con movimientos limitados. |
| Historia afectada | HU-09 Objetivos por nivel. |
| Estimacion inicial | M |
| Nueva estimacion | L |
| Motivo de reestimacion | El cambio aumenta la complejidad porque requiere definir reglas por nivel, validar condiciones de victoria distintas y mostrar objetivos claros en la interfaz. |
| Impacto en el sprint | La historia se mantiene en Sprint 2, pero se prioriza sobre animaciones y sonidos. |
| Decision tomada | Aceptar el cambio por aportar mas valor al MVP y mover HU-16/HU-17 como funcionalidades opcionales si el tiempo no alcanza. |

### Registro del cambio en Trello

En Trello se debe crear una tarjeta llamada **Cambio CR-01 - Objetivos por nivel** dentro de la lista **Cambios gestionados**.

Contenido sugerido de la tarjeta:

- **Descripcion:** se cambia el objetivo unico de puntuacion por objetivos variables segun el nivel.
- **Historia afectada:** HU-09.
- **Estimacion anterior:** M.
- **Estimacion nueva:** L.
- **Prioridad:** Must.
- **Impacto:** se prioriza HU-09 en Sprint 2 y se dejan animaciones/sonidos como Could Have.
- **Evidencia:** captura de la tarjeta en Trello.

## 1.10 Conclusiones de la planificacion agil

La planificacion agil de GemQuest permite organizar el desarrollo del MVP en dos sprints, priorizando primero la mecanica principal del juego y luego las funcionalidades de niveles, interfaz y persistencia. El uso de **T-shirt sizing** facilita una estimacion rapida del esfuerzo, mientras que **MoSCoW** permite distinguir las funcionalidades indispensables de las opcionales.

El tablero en Trello sirve como evidencia visual del avance del proyecto, la asignacion de historias por sprint y la gestion del cambio de requisito. La reestimacion de HU-09 demuestra que el equipo puede adaptarse a cambios sin perder control del alcance del proyecto.

# 2. Modelado agil

## 2.1 Story Mapping de las funcionalidades principales

El Story Mapping organiza las funcionalidades siguiendo el recorrido del jugador dentro del juego.

| Actividad del jugador | Funcionalidades (Historias de Usuario) |
| --- | --- |
| Ingresar al juego | HU-10 Pantalla de inicio |
| Seleccionar partida | HU-11 Seleccion de nivel |
| Comenzar partida | HU-01 Generar tablero valido |
| Jugar | HU-02 Intercambiar fichas |
| Resolver combinaciones | HU-03 Detectar combinaciones |
| Actualizar tablero | HU-04 Eliminar combinaciones, HU-05 Aplicar gravedad, HU-06 Generar nuevas fichas |
| Progreso de la partida | HU-07 Sistema de puntuacion, HU-08 Movimientos limitados, HU-09 Objetivos por nivel |
| Finalizar partida | HU-12 Pantalla de victoria, HU-13 Pantalla de derrota |
| Guardar progreso y records | HU-14 Guardar progreso, HU-15 Guardar record |
| Mejorar experiencia | HU-16 Animaciones, HU-17 Sonidos |
| Rejugar y dominar niveles | HU-15 Guardar record, HU-16 Animaciones, HU-17 Sonidos |

## 2.2 Arquitectura del sistema con modelo C4

El documento Word incluia diagramas generales de contexto y contenedores. En este Markdown se corrigen usando la notacion C4 de Mermaid:

- **Contexto C4:** muestra el sistema GemQuest y sus relaciones externas principales.
- **Contenedores C4:** muestra los contenedores ejecutables o desplegables y su responsabilidad.
- **Componentes:** se agrega para explicar la separacion entre capa de presentacion y logica del juego.

Nota de actualizacion: el progreso personal del jugador se mantiene en `localStorage`, mientras que el ranking diario por nivel usa Supabase como base de datos externa. Clerk se mantiene como servicio de autenticacion.

### 2.2.1 Diagrama de Contexto C4

```mermaid
C4Context
title Diagrama de Contexto C4 - GemQuest

Person(jugador, "Jugador", "Persona que juega niveles Match-3, acumula puntos y desbloquea progreso.")
System(gemquest, "GemQuest", "Juego web Match-3 con tablero, niveles, puntuacion, movimientos limitados, progreso local y ranking diario.")
System_Ext(localStorage, "LocalStorage del navegador", "Almacenamiento local usado para progreso, records, estrellas de maestria y preferencia de sonido.")
System_Ext(clerk, "Clerk", "Servicio externo de autenticacion de jugadores.")
System_Ext(supabase, "Supabase", "Base de datos Postgres usada para ranking diario por nivel.")

Rel(jugador, gemquest, "Juega, selecciona niveles e intercambia gemas", "Navegador web")
Rel(gemquest, localStorage, "Guarda y consulta progreso del jugador", "API Web Storage")
Rel(gemquest, clerk, "Autentica al jugador", "Clerk JS")
Rel(gemquest, supabase, "Publica y consulta Top 10 diario", "Supabase JS / HTTPS")
```

### 2.2.2 Diagrama de Contenedores C4

```mermaid
C4Container
title Diagrama de Contenedores C4 - GemQuest

Person(jugador, "Jugador", "Usuario final del juego.")

System_Boundary(gemquest, "GemQuest") {
  Container(staticServer, "Servidor estatico", "Node.js / hosting estatico", "Entrega index.html, CSS y modulos JavaScript.")
  Container(webApp, "Aplicacion web", "HTML, CSS, JavaScript", "Renderiza pantallas, tablero, HUD, seleccion de nivel, resultados, ranking, estrellas y feedback de combos.")
  Container(gameLogic, "Modulo de logica del juego", "JavaScript ES Modules", "Genera tablero, valida intercambios, detecta combinaciones, resuelve cascadas, calcula puntaje y evalua objetivos.")
  ContainerDb(storage, "LocalStorage", "Web Storage API", "Persistencia de nivel desbloqueado, mejores puntuaciones, estrellas de maestria y preferencia de sonido.")
}

System_Ext(clerk, "Clerk", "Autenticacion de jugadores.")
System_Ext(supabase, "Supabase Postgres", "Ranking diario por nivel con RLS y funcion SQL.")

Rel(jugador, staticServer, "Abre la aplicacion", "HTTP")
Rel(staticServer, webApp, "Entrega archivos estaticos")
Rel(jugador, webApp, "Interactua con el tablero", "Click / UI")
Rel(webApp, gameLogic, "Invoca reglas del juego")
Rel(gameLogic, webApp, "Devuelve estado actualizado")
Rel(webApp, storage, "Lee y escribe progreso")
Rel(webApp, clerk, "Inicia sesion y obtiene datos publicos del jugador", "HTTPS")
Rel(webApp, supabase, "Guarda puntajes ganados y consulta ranking diario", "HTTPS")
```

### 2.2.3 Vista de Componentes

Esta vista C4 muestra la separacion interna mas importante: presentacion, reglas de juego, persistencia local, audio y ranking online.

```mermaid
C4Component
title Diagrama de Componentes C4 - Aplicacion web GemQuest

Container_Boundary(webApp, "Aplicacion web") {
  Component(app, "app.js", "Coordinador de estado", "Gestiona pantallas, eventos, partida activa, progreso, ranking y guardado.")
  Component(views, "views.js", "Renderizado UI", "Genera HTML para inicio, mapa, tablero, resultados, guia y ranking.")
  Component(logic, "gameLogic.js", "Fachada de dominio", "Expone funciones de tablero, niveles, reglas y estado de partida.")
  Component(board, "board.js", "Logica de tablero", "Crea tablero, detecta combinaciones, aplica gravedad y recarga.")
  Component(gameState, "gameState.js", "Estado de partida", "Aplica movimientos, cascadas, puntaje y victoria/derrota.")
  Component(storageModule, "storage.js", "Persistencia local", "Lee y escribe progreso del jugador.")
  Component(mastery, "mastery.js", "Maestria", "Calcula estrellas y conserva el mejor resultado.")
  Component(leaderboard, "leaderboard.js", "Ranking diario", "Carga Supabase JS, publica puntajes y consulta Top 10 por nivel.")
  Component(audio, "audio.js", "Audio", "Reproduce tonos y musica de fondo.")
}

ContainerDb(storage, "LocalStorage", "Web Storage API", "Progreso y preferencias.")
System_Ext(clerk, "Clerk", "Autenticacion.")
System_Ext(supabase, "Supabase Postgres", "Ranking diario.")

Rel(app, views, "Renderiza estado")
Rel(app, logic, "Ejecuta jugadas")
Rel(logic, board, "Usa reglas de tablero")
Rel(logic, gameState, "Usa estado de partida")
Rel(app, storageModule, "Guarda progreso")
Rel(app, mastery, "Calcula estrellas")
Rel(app, leaderboard, "Publica y consulta ranking")
Rel(app, audio, "Dispara feedback sonoro")
Rel(storageModule, storage, "Lee/escribe")
Rel(app, clerk, "Valida sesion")
Rel(leaderboard, supabase, "RPC y consultas")
```

## 2.3 Modelo de Dominio

El modelo de dominio representa los conceptos centrales del juego: jugador, partida, tablero, celdas, gemas, objetivos, puntuacion, progreso y ranking diario.

```mermaid
classDiagram
  class Jugador {
    +id: string
    +nombre: string
  }

  class ProgresoJugador {
    +nivelDesbloqueado: int
    +records: Map
    +estrellasPorNivel: Map
    +sonidoActivo: boolean
    +guardar()
    +cargar()
  }

  class Partida {
    +estado: string
    +puntuacion: int
    +movimientosRestantes: int
    +intercambiar()
    +resolverTablero()
    +evaluarResultado()
  }

  class Nivel {
    +id: int
    +nombre: string
    +filas: int
    +columnas: int
    +movimientos: int
    +tiposGema: int
  }

  class ObjetivoNivel {
    +tipo: string
    +meta: int
    +gemaObjetivo: int
    +estaCompletado()
  }

  class Tablero {
    +filas: int
    +columnas: int
    +detectarCombinaciones()
    +aplicarGravedad()
    +rellenar()
  }

  class Celda {
    +fila: int
    +columna: int
    +bloqueada: boolean
  }

  class Gema {
    +id: int
    +nombre: string
    +claseCss: string
  }

  class SistemaPuntuacion {
    +calcularPuntos()
    +aplicarBonusCascada()
  }

  class SistemaMaestria {
    +calcularEstrellas()
    +conservarMejorResultado()
  }

  class RankingDiario {
    +fecha: date
    +nivelId: int
    +publicarPuntaje()
    +consultarTop()
  }

  class EntradaRanking {
    +jugadorId: string
    +nombreJugador: string
    +puntuacion: int
    +estrellas: int
    +movimientosRestantes: int
  }

  Jugador "1" --> "1" ProgresoJugador : conserva
  Jugador "1" --> "0..*" Partida : juega
  Jugador "1" --> "0..*" EntradaRanking : publica
  Partida "1" --> "1" Nivel : usa
  Partida "1" --> "1" Tablero : contiene
  Partida "1" --> "1" ObjetivoNivel : evalua
  Partida "1" --> "1" SistemaPuntuacion : calcula
  Partida "1" --> "1" SistemaMaestria : evalua dominio
  Tablero "1" --> "64" Celda : formado por
  Celda "1" --> "0..1" Gema : contiene
  Nivel "1" --> "1" ObjetivoNivel : define
  RankingDiario "1" --> "*" EntradaRanking : ordena
  RankingDiario "*" --> "1" Nivel : pertenece
```

## 2.4 Maquina de estados del juego

La maquina de estados describe el flujo principal desde el inicio hasta la victoria o derrota.

```mermaid
stateDiagram-v2
  [*] --> Inicio
  Inicio --> SeleccionNivel: comenzar
  SeleccionNivel --> PreparandoPartida: elegir nivel desbloqueado
  PreparandoPartida --> Jugando: tablero valido generado

  Jugando --> GemaSeleccionada: seleccionar gema
  GemaSeleccionada --> Jugando: cancelar seleccion
  GemaSeleccionada --> ValidandoIntercambio: seleccionar gema adyacente
  ValidandoIntercambio --> Jugando: no genera combinacion
  ValidandoIntercambio --> ResolviendoCombinaciones: genera combinacion

  ResolviendoCombinaciones --> EliminandoGemas: detectar 3+
  EliminandoGemas --> AplicandoGravedad: remover gemas y sumar puntos
  AplicandoGravedad --> RecargandoTablero: caer gemas
  RecargandoTablero --> ResolviendoCombinaciones: nueva cascada
  RecargandoTablero --> EvaluandoObjetivo: tablero estable

  EvaluandoObjetivo --> CalculandoMaestria: objetivo cumplido
  EvaluandoObjetivo --> Derrota: movimientos agotados
  EvaluandoObjetivo --> Jugando: quedan movimientos

  CalculandoMaestria --> PublicandoRanking: asignar estrellas y guardar progreso
  PublicandoRanking --> Victoria: publicar puntaje diario o continuar sin bloquear
  Victoria --> SeleccionNivel: continuar
  Derrota --> PreparandoPartida: reintentar
```

## 2.5 Modelado de la logica del tablero

La logica del tablero esta separada de la interfaz en `src/gameLogic.js`. Esto permite probar reglas sin depender del DOM.

### Reglas principales

| Regla | Descripcion | Historia relacionada |
| --- | --- | --- |
| Generacion valida | El tablero inicial se crea sin combinaciones automaticas. | HU-01 |
| Adyacencia | Solo se pueden intercambiar gemas vecinas en horizontal o vertical. | HU-02 |
| Reversion | Si el intercambio no forma combinacion, se revierte para mantener el tablero estable. | HU-02 |
| Descuento de intento | Todo intercambio adyacente consume 1 movimiento, incluso cuando no genera combinacion. | HU-08, HU-13 |
| Deteccion | Se detectan grupos horizontales y verticales de 3 o mas gemas iguales. | HU-03 |
| Eliminacion | Las gemas combinadas se eliminan del tablero y suman puntos. | HU-04, HU-07 |
| Gravedad | Las gemas superiores caen para llenar espacios vacios. | HU-05 |
| Recarga | Se generan nuevas gemas en los espacios superiores. | HU-06 |
| Cascadas | Si despues de rellenar aparecen nuevas combinaciones, se resuelven automaticamente. | HU-03, HU-04, HU-05, HU-06 |
| Obstaculos | Las combinaciones adyacentes rompen obstaculos del nivel 3. | HU-09 |
| Combos | Cuando una jugada genera mas de una cascada, se muestra feedback `Combo xN` y se refuerza el sonido. | HU-16, HU-17 |
| Maestria | Al ganar se calculan de 1 a 3 estrellas segun puntuacion y movimientos restantes. | HU-15, HU-16 |
| Ranking diario | Al ganar se publica el mejor puntaje diario del jugador por nivel y se consulta el Top 10 del dia. | HU-15 |

### Flujo de resolucion de una jugada

```mermaid
flowchart TD
  A["Jugador selecciona dos gemas"] --> B{"Son adyacentes?"}
  B -- No --> C["Movimiento rechazado"]
  B -- Si --> D["Intercambiar gemas"]
  D --> E{"Hay combinacion 3+?"}
  E -- No --> F["Revertir intercambio y consumir 1 movimiento"]
  F --> P
  E -- Si --> G["Consumir 1 movimiento"]
  G --> H["Eliminar combinaciones"]
  H --> I["Sumar puntos y recolectar gemas"]
  I --> J["Romper obstaculos adyacentes"]
  J --> K["Aplicar gravedad"]
  K --> L["Generar nuevas gemas"]
  L --> M{"Aparecio cascada?"}
  M -- Si --> H
  M -- No --> N{"Objetivo cumplido?"}
  N -- Si --> O["Victoria"]
  N -- No --> P{"Sin movimientos?"}
  P -- Si --> Q["Derrota"]
  P -- No --> R["Continuar jugando"]
```

## 2.6 Niveles del MVP

| Nivel | Nombre | Objetivo | Movimientos | Dificultad |
| --- | --- | --- | --- | --- |
| 1 | Brillo inicial | Lograr 780 puntos | 18 | Base |
| 2 | Cosecha azul | Eliminar 20 gemas Zafiro | 20 | Media |
| 3 | Ruinas bloqueadas | Romper 8 obstaculos | 24 | Alta |

### Sistema de maestria por estrellas

El sistema de maestria no bloquea el avance del jugador; funciona como motivacion para repetir niveles y mejorar resultados.

| Estrellas | Condicion general |
| --- | --- |
| 0 | El jugador pierde el nivel. |
| 1 | El jugador gana el nivel. |
| 2 | El jugador gana y supera aproximadamente el 125% del objetivo base de maestria. |
| 3 | El jugador gana y supera aproximadamente el 150% del objetivo base, o logra buen puntaje conservando al menos 25% de movimientos. |

Para niveles de recoleccion y obstaculos, `src/mastery.js` convierte el objetivo a una meta de puntuacion de maestria proporcional para mantener un criterio comun entre tipos de nivel.

## 2.7 Trazabilidad entre historias y codigo

| Historia | Archivo principal | Evidencia tecnica |
| --- | --- | --- |
| HU-01 | `src/gameLogic.js` | `createBoard()` genera tablero completo sin combinaciones iniciales. |
| HU-02 | `src/gameLogic.js`, `src/app.js` | `applyMove()` valida adyacencia y `handleCellClick()` gestiona seleccion. |
| HU-03 | `src/gameLogic.js` | `findMatches()` detecta combinaciones horizontales y verticales. |
| HU-04 | `src/gameLogic.js` | `resolveBoard()` elimina gemas detectadas. |
| HU-05 | `src/gameLogic.js` | `applyGravityAndRefill()` aplica gravedad por columna. |
| HU-06 | `src/gameLogic.js` | `applyGravityAndRefill()` rellena espacios vacios. |
| HU-07 | `src/gameLogic.js`, `src/views.js` | `resolveBoard()` calcula puntos y la HUD los muestra. |
| HU-08 | `src/gameLogic.js`, `src/app.js` | `movesLeft` se reduce en cada intercambio adyacente, incluso si no forma combinacion. |
| HU-09 | `src/gameLogic.js` | `isObjectiveComplete()` evalua objetivos de puntaje, recoleccion y obstaculos. |
| HU-10 | `src/views.js` | `renderHome()` muestra pantalla inicial con arte de fondo definido en CSS. |
| HU-11 | `src/views.js`, `src/styles.css` | `renderLevels()` muestra niveles bloqueados/desbloqueados con tarjetas dinamicas. |
| HU-12 | `src/views.js` | `renderVictoryOverlay()` muestra victoria, puntuacion, estrellas ganadas y acciones de avance. |
| HU-13 | `src/views.js` | `renderDefeatOverlay()` muestra derrota, progreso del objetivo y acciones de reintento. |
| HU-14 | `src/storage.js` | `loadProgress()`, `normalizeProgress()` y `saveProgress()` guardan progreso compatible con versiones anteriores. |
| HU-15 | `src/app.js`, `src/storage.js`, `src/leaderboard.js`, `supabase/gemquest_daily_leaderboard.sql` | `bestScores` guarda el record local por nivel y `leaderboard.js` publica/consulta el ranking diario Top 10 en Supabase. |
| HU-16 | `src/styles.css`, `src/mastery.js`, `src/views.js` | Transiciones, seleccion visual, progreso, estrellas de maestria y feedback de combos/tablero. |
| HU-17 | `src/audio.js` | `playTone()` genera sonidos con Web Audio API y `ensureBackgroundMusic()` reproduce musica en loop. |

# 3. Integracion DevOps y ejecucion

## 3.1 Scripts principales

| Comando | Funcion |
| --- | --- |
| `npm start` | Levanta el servidor local estatico. |
| `npm run build` | Valida que los archivos estaticos existan y que los modulos carguen. |
| `npm test` | Ejecuta pruebas automatizadas de la logica del juego, maestria, persistencia, vistas y ranking. |

## 3.2 Pipeline CI/CD

El archivo `.github/workflows/ci.yml` ejecuta:

- Validacion estatica con `npm run build`.
- Pruebas automatizadas con `npm test`.

## 3.3 Despliegue o contenedorizacion

El proyecto incluye un `Dockerfile` basico para ejecutar el MVP como aplicacion estatica servida por Node.js.

Comandos de ejecucion:

```bash
docker build -t gemquest .
docker run --rm -p 4173:4173 --env-file .env gemquest
```

Abrir `http://127.0.0.1:4173`.

## 3.4 Base de datos Supabase para ranking diario

El ranking diario por nivel se implementa como extension de HU-15. No se crea una nueva historia de usuario; se amplifica el record del jugador con un ranking online.

| Elemento | Definicion |
| --- | --- |
| Tabla | `gemquest_daily_scores` |
| Llave logica | `score_date`, `level_id`, `player_id` |
| Reinicio diario | La interfaz consulta solo `score_date` del dia actual en America/Guayaquil. |
| Escritura | Funcion SQL `submit_gemquest_daily_score()` |
| Seguridad | RLS habilitado; lectura publica del ranking y escritura mediante funcion controlada. |
| Configuracion | Variables `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en `.env`. |

El SQL de creacion se encuentra en `supabase/gemquest_daily_leaderboard.sql`.

# 4. Bitacora de actualizaciones del documento vivo


## 4.1 Responsables normalizados desde Git

| Autor visto en commits o trabajo local | Responsable en el documento |
| --- | --- |
| `Sebastian Bravo Veliz` | Jordy Sebastian Bravo Veliz |
| `Sebastian Alvarez` | Sebastian Esteban Alvarez De la Rosa |
| `adriels27` | Adriel Elias Sanchez Zaldumbide |
| `Jose Sarabia` | Jose Luis Sarabia Calderon |
| `jostrootbash` | Romero Ponce Jostin Paul |

## 4.2 Bitacora consolidada de cambios

| Fecha | Responsable | Cambios realizados |
| --- | --- | --- |
| 2026-07-12 | Jordy Sebastian Bravo Veliz | Se movio la bitacora larga del `README.md` a `docs/modelado.md` para mantener un unico documento vivo, y el README quedo como guia de ejecucion y configuracion. |
| 2026-07-12 | Jordy Sebastian Bravo Veliz | Se agrego ranking diario por nivel con Supabase: ventana Top 10, variables `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`, SQL de tabla, RLS, funcion de escritura y guia de ejecucion Docker. |
| 2026-07-12 | Jordy Sebastian Bravo Veliz | Se corrigio el permiso de lectura del ranking agregando `grant select on public.gemquest_daily_scores to anon, authenticated`, manteniendo RLS activo. |
| 2026-07-12 | Jordy Sebastian Bravo Veliz | Se actualizo el modelo C4 para incluir Clerk, Supabase, LocalStorage, servidor estatico y componentes internos como `leaderboard.js`. |
| 2026-07-12 | Romero Ponce Jostin Paul | Se configuro GemQuest como PWA instalable para moviles con `manifest.webmanifest`, `sw.js`, cache offline, metadatos iOS/Android, modo fullscreen y orientacion horizontal. |
| 2026-07-12 | Romero Ponce Jostin Paul | Se adapto la entrada tactil movil con `touchstart`, `touchmove`, `touchend`, `touch-action: none` y arrastre fluido usando `requestAnimationFrame`. |
| 2026-07-12 | Romero Ponce Jostin Paul | Se corrigio la experiencia responsive de la PWA: mapa compacto, sprites visibles en victoria/derrota, overlays sin scroll y bloqueo real de desplazamiento con `overlay-locked`. |
| 2026-07-12 | Romero Ponce Jostin Paul | Se restauraron controles de escritorio con `pointerdown`, `pointermove` y `pointerup` para mouse/lapiz, manteniendo separada la experiencia tactil movil. |
| 2026-07-12 | Romero Ponce Jostin Paul | Se reactivaron animaciones del mapa en movil: nubes, brillo del camino, nodos flotantes, cofre y estrellas, reduciendo animaciones pesadas de overlays. |
| 2026-07-11 | Sebastian Esteban Alvarez De la Rosa | Se agrego efecto de animacion y recompensa al completar los 3 niveles, incluyendo cofre del mapa, estrellas y mensaje de recompensa. |
| 2026-07-11 | Sebastian Esteban Alvarez De la Rosa | Se corrigio el calculo de progreso del mapa para contar la campana como 100% al completar los 3 niveles, aunque no se obtengan 3 estrellas perfectas. |
| 2026-07-11 | Sebastian Esteban Alvarez De la Rosa | Se agrego `.dockerignore` para optimizar el contexto Docker y excluir archivos no necesarios como `.git`, `.github`, `.vscode`, `docs`, `tests`, `.env` y documentacion pesada. |
| 2026-07-11 | Sebastian Esteban Alvarez De la Rosa | Se procesaron assets de estrella y tesoro para obtener versiones PNG transparentes usadas en el mapa y recompensas. |
| 2026-07-11 | Adriel Elias Sanchez Zaldumbide | Se creo y mejoro el mapa interactivo de niveles con camino pirata, tres nodos, cofre central, decoracion, estados visuales, nubes, brillo y animaciones. |
| 2026-07-11 | Adriel Elias Sanchez Zaldumbide | Se implementaron efectos de arrastre y combinacion de gemas: seleccion con brillo, seguimiento suavizado, empuje de gema vecina, retroceso invalido y caida con rebote. |
| 2026-07-11 | Adriel Elias Sanchez Zaldumbide | Se actualizaron documentos del proyecto para reflejar cambios de interfaz, autenticacion, mapa, experiencia visual y avance del producto. |
| 2026-07-11 | Adriel Elias Sanchez Zaldumbide | Se hizo mas discreta la barra de cuenta autenticada y se ajustaron botones de inicio/reinicio al estilo visual del juego. |
| 2026-07-10 | Jose Luis Sarabia Calderon | Se integro Clerk como autenticacion del producto, incluyendo flujo embebido de inicio de sesion y persistencia de progreso por usuario. |
| 2026-07-10 | Jose Luis Sarabia Calderon | Se modularizo la logica del juego en archivos enfocados como `board.js`, `gameData.js`, `gameFunctions.js`, `gameState.js` y fachada `gameLogic.js`. |
| 2026-07-10 | Jose Luis Sarabia Calderon | Se preparo la configuracion de autenticacion para entorno local/produccion mediante variables publicas y servidor estatico. |
| 2026-07-09 | Sebastian Esteban Alvarez De la Rosa | Se agrego pantalla de derrota con resumen de puntaje/progreso, botones de reintento y mapa, y sprite `pirata_sprite.png`. |
| 2026-07-09 | Sebastian Esteban Alvarez De la Rosa | Se reemplazo el pirata dibujado con CSS por sprite visual en la pantalla de victoria, manteniendo animacion de entrada. |
| 2026-07-08 | Sebastian Esteban Alvarez De la Rosa | Se agregaron assets personalizados para gemas en `assets/gems/`, interaccion por arrastre, resaltado de celda destino y modal de victoria con confetti. |
| 2026-07-08 | Sebastian Esteban Alvarez De la Rosa | Se mejoro la experiencia visual y la pantalla de victoria con transiciones naturales, fondo con blur, tablero atenuado, recompensas y paleta navy/dorado. |
| 2026-07-08 | Sebastian Esteban Alvarez De la Rosa | Se mejoro la guia rapida con mejor contraste, pasos numerados y tabla de valor de gemas. |
| 2026-07-08 | Sebastian Esteban Alvarez De la Rosa | Se documento la planificacion y se agrego bitacora inicial al README, luego trasladada a este documento vivo. |
| 2026-07-08 | Jose Luis Sarabia Calderon | Se refactorizo el frontend en modulos y se mejoraron vistas, persistencia, audio y separacion de responsabilidades. |
| 2026-07-08 | Jose Luis Sarabia Calderon | Se agrego sistema de estrellas de maestria y feedback de combos por cascadas, documentado dentro de HU-15, HU-16 y HU-17 sin crear nuevas historias. |
| 2026-07-08 | Jose Luis Sarabia Calderon | Se actualizo `docs/modelado.md` para reflejar nuevas funciones, reglas, trazabilidad y cambios del juego. |
| 2026-07-08 | Jordy Sebastian Bravo Veliz | Se integraron cambios de la rama `cambios` hacia `master` mediante pull request y merge. |
| 2026-07-07 | Jordy Sebastian Bravo Veliz | Se mejoraron reglas y experiencia visual: objetivos, movimientos, animaciones, fichas diferenciadas y descuento de movimiento en intentos adyacentes. |
| 2026-07-07 | Jordy Sebastian Bravo Veliz | Se realizo la implementacion inicial de GemQuest con tablero Match-3, intercambio de gemas, combinaciones, puntuacion, niveles y estructura base del proyecto. |

# 5. Retrospectiva final y metricas

Como equipo se realizó una retrospectiva general para evaluar el proceso, las decisiones tecnicas y la colaboracion durante la construccion de GemQuest.

## 5.1 Retrospectiva final del equipo

| Aspecto evaluado | Resultado |
| --- | --- |
| Que funciono bien | La division por modulos permitio trabajar en paralelo: logica del tablero, interfaz, autenticacion, ranking y despliegue. |
| Que se debe mejorar | Al integrar cambios de varias ramas aparecieron ajustes pendientes en documentacion, permisos de Supabase y configuracion de CI/CD. |
| Leccion aprendida | Mantener el documento vivo actualizado evita contradicciones entre el MVP, los diagramas, el backlog y el codigo real. |
| Decision para futuros proyectos | Validar el build Docker y el pipeline CI antes de presentar el despliegue para detectar errores de entorno a tiempo. |

## 5.2 Metricas basicas del proyecto

| Metrica | Valor aproximado | Interpretacion |
| --- | --- | --- |
| Velocidad del Sprint 1 | 6 historias completadas | Se completaron HU-01 a HU-06, correspondientes al nucleo jugable del tablero Match-3. |
| Velocidad del Sprint 2 | 11 historias completadas | Se completaron HU-07 a HU-17, correspondientes a puntuacion, niveles, pantallas, persistencia, animaciones y sonidos. |
| Velocidad total del MVP | 17 historias completadas | El backlog comprometido del MVP quedo completo sin agregar nuevas historias fuera de HU-01 a HU-17. |
| Cycle time promedio | 1 a 2 dias por bloque funcional | Las tareas pequenas como UI o ajustes de reglas avanzaron en menos tiempo; autenticacion, PWA, ranking y despliegue requirieron mas validacion. |
| Burndown cualitativo | Descenso progresivo con concentracion final en integracion | El avance fue estable en mecanicas e interfaz, y al final se concentraron tareas de integracion, documentacion, CI/CD y despliegue. |
| Defectos corregidos al cierre | 4 incidencias principales | Se corrigieron permisos de Supabase, configuracion de `.env`, build Docker en Render y compatibilidad del pipeline CI. |

## 5.3 Lecciones aprendidas

- La separacion entre logica de juego y presentacion facilito probar reglas sin depender del DOM.
- La maquina de estados ayudo a explicar el flujo de juego, desde seleccion de nivel hasta victoria o derrota.
- C4 fue util para diferenciar el sistema, contenedores, componentes, servicios externos y responsabilidades.
- Clerk simplifico la autenticacion, pero exigio configurar correctamente dominios y variables publicas.
- Supabase permitio agregar ranking diario rapidamente, pero fue necesario aplicar RLS, permisos y funcion SQL controlada.
- Render facilito el despliegue continuo, aunque obligo a alinear Docker, Node.js y GitHub Actions.
