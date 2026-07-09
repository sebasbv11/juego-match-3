# 1. Planificacion y Gestion Agil

## 1.1 Metodologia agil seleccionada

Para el desarrollo de **GemQuest** se selecciono **Scrum** como metodologia agil, debido a que permite organizar el trabajo mediante iteraciones cortas, entregas incrementales y adaptacion continua ante cambios en los requisitos.

GemQuest es un juego web tipo **Match-3**, inspirado en mecanicas similares a Candy Crush, donde el jugador intercambia gemas adyacentes para formar combinaciones de tres o mas elementos iguales. El proyecto se planifica como un **Producto Minimo Viable (MVP)** dividido en dos sprints.

### Roles Scrum

| Rol | Responsable | Funciones principales |
|---|---|---|
| Product Owner | Equipo del proyecto | Define la vision del producto, prioriza el Product Backlog y valida que las historias cumplan los criterios de aceptacion. |
| Scrum Master | Equipo del proyecto | Facilita las ceremonias Scrum, da seguimiento al tablero y ayuda a resolver impedimentos. |
| Equipo de desarrollo | Integrantes del equipo | Diseña, implementa, prueba e integra las funcionalidades del juego. |

## 1.2 Vision del producto

**GemQuest** permitira al jugador iniciar una partida, visualizar un tablero de gemas, intercambiar piezas, formar combinaciones, acumular puntos, completar objetivos por nivel y guardar su progreso.

El MVP incluye:

- Tablero funcional de gemas.
- Intercambio de fichas adyacentes.
- Deteccion y eliminacion de combinaciones.
- Sistema de gravedad y generacion de nuevas fichas.
- Tres niveles con objetivos definidos.
- Sistema de puntuacion y movimientos limitados.
- Persistencia basica del progreso.
- Interfaz clara para iniciar, jugar, ganar o perder una partida.

## 1.3 Product Backlog

La estimacion se realizo mediante **T-shirt sizing**, usando las tallas **XS, S, M, L y XL**. Esta tecnica se aplico de forma manual durante la planificacion del equipo, comparando la complejidad, esfuerzo e incertidumbre de cada historia de usuario.

La priorizacion se realizo con **MoSCoW**:

- **Must Have:** indispensable para el MVP.
- **Should Have:** importante, pero no bloquea la funcionalidad principal.
- **Could Have:** deseable si queda tiempo.
- **Won't Have:** fuera del alcance de esta entrega.

| ID | Nombre | Epica | Historia de usuario | Prioridad MoSCoW | Estimacion |
|---|---|---|---|---|---|
| HU-01 | Generar tablero valido | EP-01 Gestion del tablero | Como jugador, quiero que el juego genere automaticamente un tablero valido para comenzar una partida inmediatamente. | Must | M |
| HU-02 | Intercambiar fichas | EP-02 Mecanicas del juego | Como jugador, quiero intercambiar dos gemas adyacentes para intentar formar combinaciones. | Must | M |
| HU-03 | Detectar combinaciones | EP-02 Mecanicas del juego | Como jugador, quiero que el juego detecte combinaciones de tres o mas gemas iguales para validar mis movimientos. | Must | L |
| HU-04 | Eliminar combinaciones | EP-02 Mecanicas del juego | Como jugador, quiero que las combinaciones encontradas se eliminen del tablero para recibir puntos. | Must | M |
| HU-05 | Aplicar gravedad | EP-01 Gestion del tablero | Como jugador, quiero que las gemas caigan automaticamente para ocupar los espacios vacios. | Must | L |
| HU-06 | Generar nuevas fichas | EP-01 Gestion del tablero | Como jugador, quiero que aparezcan nuevas gemas para mantener el tablero completo. | Must | M |
| HU-07 | Sistema de puntuacion | EP-03 Sistema de niveles | Como jugador, quiero obtener puntos por cada combinacion realizada para medir mi avance. | Must | S |
| HU-08 | Movimientos limitados | EP-03 Sistema de niveles | Como jugador, quiero tener una cantidad limitada de movimientos para que el nivel represente un reto. | Must | S |
| HU-09 | Objetivos por nivel | EP-03 Sistema de niveles | Como jugador, quiero objetivos diferentes por nivel para que cada partida tenga una meta clara. | Must | L |
| HU-10 | Pantalla de inicio | EP-04 Interfaz de usuario | Como jugador, quiero una pantalla de inicio para acceder facilmente al juego. | Should | XS |
| HU-11 | Seleccion de nivel | EP-04 Interfaz de usuario | Como jugador, quiero seleccionar el nivel que deseo jugar para continuar mi progreso. | Should | S |
| HU-12 | Pantalla de victoria | EP-04 Interfaz de usuario | Como jugador, quiero ver una pantalla de victoria cuando cumpla el objetivo del nivel. | Should | XS |
| HU-13 | Pantalla de derrota | EP-04 Interfaz de usuario | Como jugador, quiero ver una pantalla de derrota cuando se terminen mis movimientos sin cumplir el objetivo. | Should | XS |
| HU-14 | Guardar progreso | EP-05 Persistencia | Como jugador, quiero guardar mi progreso para continuar desde el ultimo nivel desbloqueado. | Should | M |
| HU-15 | Guardar record | EP-05 Persistencia | Como jugador, quiero guardar mi mejor puntuacion para intentar superar mi record. | Could | S |
| HU-16 | Animaciones | EP-06 Experiencia de usuario | Como jugador, quiero animaciones al eliminar y caer gemas para que el juego se sienta mas dinamico. | Could | M |
| HU-17 | Sonidos | EP-06 Experiencia de usuario | Como jugador, quiero efectos de sonido para recibir retroalimentacion durante la partida. | Could | S |

## 1.4 Criterios de aceptacion

| ID | Criterios de aceptacion |
|---|---|
| HU-01 | El tablero se genera al iniciar una partida. No existen combinaciones iniciales automaticas. Todas las celdas del tablero contienen una gema visible. |
| HU-02 | El jugador puede seleccionar dos gemas adyacentes. El intercambio solo se permite si las gemas estan una al lado de la otra. Si el movimiento no genera combinacion, las gemas regresan a su posicion original. |
| HU-03 | El sistema identifica combinaciones horizontales y verticales de tres o mas gemas iguales. Las combinaciones se detectan despues de cada movimiento valido. |
| HU-04 | Las gemas combinadas desaparecen del tablero. El sistema actualiza el puntaje despues de eliminar una combinacion. No se eliminan gemas que no formen parte de una combinacion. |
| HU-05 | Las gemas superiores caen para llenar los espacios vacios. La gravedad se aplica hasta que no queden huecos intermedios. El tablero mantiene su tamaño original. |
| HU-06 | Se generan nuevas gemas en los espacios vacios de la parte superior. Las nuevas gemas se integran al tablero despues de aplicar gravedad. El tablero queda completo al finalizar la jugada. |
| HU-07 | El puntaje aumenta al eliminar combinaciones. Las combinaciones mas grandes otorgan mayor puntaje. El puntaje actual se muestra durante la partida. |
| HU-08 | Cada movimiento valido reduce en uno el contador de movimientos. El contador se muestra en pantalla. Cuando llega a cero, el juego evalua si el nivel fue ganado o perdido. |
| HU-09 | Cada nivel tiene un objetivo especifico. El juego valida automaticamente si el objetivo fue cumplido. Al cumplir el objetivo, se muestra la pantalla de victoria. |
| HU-10 | La pantalla de inicio muestra el nombre del juego. Incluye un boton para comenzar. El boton lleva al flujo principal del juego. |
| HU-11 | La pantalla de seleccion muestra los niveles disponibles. Los niveles bloqueados no pueden seleccionarse. El jugador puede iniciar un nivel desbloqueado. |
| HU-12 | La pantalla de victoria aparece al cumplir el objetivo. Muestra el puntaje obtenido. Permite avanzar o volver a la seleccion de nivel. |
| HU-13 | La pantalla de derrota aparece cuando se agotan los movimientos sin cumplir el objetivo. Permite reintentar el nivel. |
| HU-14 | El progreso se guarda al completar un nivel. Al volver al juego se conserva el ultimo nivel desbloqueado. El guardado funciona aunque se cierre el navegador. |
| HU-15 | El sistema guarda la mejor puntuacion obtenida. Si el jugador supera su record, el valor anterior se actualiza. El record se muestra en la interfaz. |
| HU-16 | Las gemas tienen animacion al desaparecer. La caida de nuevas gemas se visualiza de forma fluida. Las animaciones no impiden jugar correctamente. |
| HU-17 | El juego reproduce sonidos en acciones importantes. Los sonidos no se superponen de forma molesta. El jugador puede jugar aunque el sonido no este disponible. |

## 1.5 Priorizacion MoSCoW

| Categoria | Historias incluidas | Justificacion |
|---|---|---|
| Must Have | HU-01, HU-02, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09 | Son necesarias para que el juego sea funcional y el MVP pueda completarse. |
| Should Have | HU-10, HU-11, HU-12, HU-13, HU-14 | Mejoran el flujo de usuario y permiten una experiencia completa, aunque la mecanica principal puede existir sin ellas. |
| Could Have | HU-15, HU-16, HU-17 | Aportan valor adicional y mejor experiencia, pero no son indispensables para la entrega inicial. |
| Won't Have | Tienda, sistema de vidas, ranking online, inicio de sesion | Se excluyen para mantener el alcance del MVP dentro del tiempo disponible. |

## 1.6 Planificacion de sprints

### Sprint 1: mecanica principal del juego

**Objetivo:** construir el nucleo jugable de GemQuest, permitiendo generar el tablero, mover gemas, detectar combinaciones y actualizar el tablero despues de cada jugada.

**Duracion estimada:** 1 semana.

| Historia | Actividades principales | Estado esperado |
|---|---|---|
| HU-01 | Crear estructura del tablero y generar gemas iniciales. | Terminado |
| HU-02 | Implementar seleccion e intercambio de gemas adyacentes. | Terminado |
| HU-03 | Programar deteccion de combinaciones horizontales y verticales. | Terminado |
| HU-04 | Eliminar combinaciones detectadas y preparar actualizacion del tablero. | Terminado |
| HU-05 | Implementar gravedad para llenar espacios vacios. | Terminado |
| HU-06 | Generar nuevas gemas despues de aplicar gravedad. | Terminado |

### Sprint 2: MVP completo e interfaz

**Objetivo:** completar las reglas del juego, niveles, pantallas principales, persistencia y mejoras de experiencia.

**Duracion estimada:** 1 semana.

| Historia | Actividades principales | Estado esperado |
|---|---|---|
| HU-07 | Implementar calculo y visualizacion de puntaje. | Terminado |
| HU-08 | Agregar contador de movimientos limitados. | Terminado |
| HU-09 | Definir objetivos por nivel y validacion de victoria. | Terminado |
| HU-10 | Crear pantalla de inicio. | Terminado |
| HU-11 | Crear seleccion de nivel. | Terminado |
| HU-12 | Crear pantalla de victoria. | Terminado |
| HU-13 | Crear pantalla de derrota. | Terminado |
| HU-14 | Guardar progreso del jugador. | Terminado |
| HU-15 | Guardar mejor puntuacion. | Pendiente o en progreso |
| HU-16 | Agregar animaciones. | Pendiente o en progreso |
| HU-17 | Agregar sonidos. | Pendiente o en progreso |

## 1.7 Ceremonias Scrum documentadas

### Sprint 1

| Ceremonia | Descripcion | Resultado |
|---|---|---|
| Sprint Planning | Se reviso el Product Backlog y se seleccionaron las historias indispensables para construir la mecanica base del juego. | Se definio el objetivo del sprint y se asignaron HU-01 a HU-06. |
| Daily Scrum | Se reviso el avance de las tareas, los bloqueos y las actividades pendientes del tablero. | Se identifico como principal riesgo la deteccion correcta de combinaciones y la aplicacion de gravedad. |
| Sprint Review | Se presento un tablero funcional donde el jugador podia intercambiar gemas y generar combinaciones. | Se valido que la mecanica principal funcionaba como base del MVP. |
| Sprint Retrospective | Se analizaron los avances y dificultades del sprint. | Se acordo dividir las tareas complejas en subtareas mas pequeñas y probar cada mecanica por separado. |

### Sprint 2

| Ceremonia | Descripcion | Resultado |
|---|---|---|
| Sprint Planning | Se priorizaron las historias relacionadas con puntuacion, movimientos, niveles, pantallas y persistencia. | Se planificaron HU-07 a HU-17, dando mayor prioridad a HU-07, HU-08, HU-09 y HU-14. |
| Daily Scrum | Se dio seguimiento al avance de interfaz, reglas de niveles y guardado de progreso. | Se detecto que los objetivos por nivel requerian mayor esfuerzo del estimado inicialmente. |
| Sprint Review | Se presento el MVP con niveles, puntaje, movimientos, pantallas de resultado y guardado basico. | Se recibio retroalimentacion sobre mejorar la claridad de los objetivos por nivel. |
| Sprint Retrospective | Se reviso el cumplimiento del MVP y el manejo del cambio de requisito. | Se concluyo que la reestimacion permitio mantener controlado el alcance del sprint. |

## 1.8 Tablero de gestion en Trello

Para evidenciar la gestion agil se utilizara un tablero en **Trello**, ya que permite representar visualmente el flujo de trabajo mediante listas y tarjetas.

El tablero fue configurado como evidencia del proceso Scrum aplicado al proyecto. En el se representan las historias planificadas, las tareas en progreso, las tareas en revision, las historias finalizadas, los cambios gestionados y los elementos que quedan fuera del alcance del MVP.

**Enlace al tablero Trello:** https://trello.com/b/Bn3M92I8/gemquest-gestion

### Listas recomendadas

Crear un tablero llamado **GemQuest - Gestion Agil** con las siguientes listas:

| Lista en Trello | Uso |
|---|---|
| Product Backlog | Todas las historias HU-01 a HU-17 antes de ser planificadas. |
| Sprint 1 | Historias seleccionadas para el primer sprint: HU-01 a HU-06. |
| Sprint 2 | Historias seleccionadas para el segundo sprint: HU-07 a HU-17. |
| En progreso | Tarjetas que se estan desarrollando. |
| En revision | Tarjetas terminadas que deben validarse con criterios de aceptacion. |
| Terminado | Historias completadas y validadas. |
| Cambios gestionados | Requisitos modificados, reestimaciones y decisiones tomadas. |

### Tarjetas que deben crearse

Crear una tarjeta por cada historia de usuario:

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

### Informacion dentro de cada tarjeta

En cada tarjeta de Trello se recomienda agregar:

- Historia de usuario.
- Epica relacionada.
- Prioridad MoSCoW.
- Estimacion T-shirt.
- Criterios de aceptacion.
- Sprint asignado.
- Estado de avance.

### Etiquetas recomendadas

| Etiqueta | Color sugerido | Uso |
|---|---|---|
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

### Evidencia visual del tablero

**Figura 1. Vista general del tablero Trello**

Insertar captura del tablero completo donde se observen las listas: Sprint 1 - planificacion, Sprint 2, En progreso, En revision, Terminado, Cambios gestionados y Product Backlog.

Esta captura evidencia la organizacion general del flujo de trabajo, la distribucion de historias por sprint y el estado actual de cada actividad.

**Figura 2. Historias completadas del Sprint 1**

Insertar captura de la lista **Terminado**, donde se observen las historias HU-01 a HU-06.

Esta captura evidencia que las historias correspondientes a la mecanica principal del juego fueron completadas al cierre del Sprint 1.

**Figura 3. Seguimiento del Sprint 2**

Insertar captura de las listas **Sprint 2**, **En progreso** y **En revision**.

Esta captura evidencia que las historias del segundo sprint se encuentran distribuidas segun su estado: planificadas, en desarrollo o en revision.

**Figura 4. Detalle de historia de usuario**

Insertar captura de una tarjeta abierta, preferiblemente **HU-09 Objetivos por nivel** o **HU-14 Guardar progreso**, donde se observen la descripcion, prioridad, estimacion y criterios de aceptacion.

Esta captura evidencia que las historias de usuario fueron documentadas con informacion suficiente para su desarrollo y validacion.

**Figura 5. Cambio de requisito gestionado**

Insertar captura de la tarjeta **CR-01 Cambio en objetivos por nivel** dentro de la lista **Cambios gestionados**.

Esta captura evidencia que el cambio de requisito fue registrado, analizado y reestimado de M a L.

## 1.9 Gestion de cambio de requisito

Durante la planificacion inicial, los niveles de GemQuest se definieron con un unico tipo de objetivo: alcanzar una puntuacion minima. Posteriormente se identifico que esto podia volver repetitiva la experiencia de juego, por lo que se gestiono un cambio de requisito.

| Elemento | Descripcion |
|---|---|
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
