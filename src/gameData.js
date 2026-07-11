export const GEM_META = [
  { id: 0, name: "Rubi", cssClass: "gem-red", points: 6 },
  { id: 1, name: "Esmeralda", cssClass: "gem-green", points: 7 },
  { id: 2, name: "Zafiro", cssClass: "gem-blue", points: 8 },
  { id: 3, name: "Ambar", cssClass: "gem-amber", points: 9 },
  { id: 4, name: "Amatista", cssClass: "gem-violet", points: 10 },
  { id: 5, name: "Jade", cssClass: "gem-jade", points: 12 }
];

export const LEVELS = [
  {
    id: 1,
    name: "Brillo inicial",
    summary: "Alcanza la puntuacion meta.",
    rows: 8,
    cols: 8,
    gemTypes: 5,
    moves: 18,
    objective: { type: "score", target: 780 }
  },
  {
    id: 2,
    name: "Cosecha azul",
    summary: "Elimina zafiros suficientes.",
    rows: 8,
    cols: 8,
    gemTypes: 6,
    moves: 20,
    objective: { type: "collect", gem: 2, target: 20 }
  },
  {
    id: 3,
    name: "Ruinas bloqueadas",
    summary: "Rompe todos los obstaculos.",
    rows: 8,
    cols: 8,
    gemTypes: 6,
    moves: 24,
    objective: { type: "blockers", target: 8 },
    blockers: [
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 3, col: 2 },
      { row: 3, col: 5 },
      { row: 4, col: 2 },
      { row: 4, col: 5 },
      { row: 5, col: 3 },
      { row: 5, col: 4 }
    ]
  }
];
