export function calculateStars({ level, score, movesLeft, won }) {
  if (!won) {
    return 0;
  }

  const target = getMasteryScoreTarget(level);
  const twoStarScore = Math.ceil(target * 1.25);
  const threeStarScore = Math.ceil(target * 1.5);
  const strongMovesLeft = movesLeft >= Math.ceil(level.moves * 0.25);

  if (score >= threeStarScore || (score >= twoStarScore && strongMovesLeft)) {
    return 3;
  }

  if (score >= twoStarScore) {
    return 2;
  }

  return 1;
}

export function mergeBestStars(previousStars, nextStars) {
  return Math.max(Number(previousStars) || 0, Number(nextStars) || 0);
}

function getMasteryScoreTarget(level) {
  if (level.objective.type === "score") {
    return level.objective.target;
  }

  if (level.objective.type === "collect") {
    return level.objective.target * 36;
  }

  return level.objective.target * 60;
}
