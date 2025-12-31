// Database type helpers (Difficulty enum is now defined in schema.ts)

// Type guard for difficulty validation
export function isValidDifficulty(value: string): boolean {
  return ['Easy', 'Medium', 'Hard'].includes(value);
}

// Helper function to get all difficulty levels
export function getDifficultyLevels(): string[] {
  return ['Easy', 'Medium', 'Hard'];
}

// Helper function to get difficulty as display string
export function getDifficultyDisplay(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return 'آسان';
    case 'Medium':
      return 'متوسط';
    case 'Hard':
      return 'سخت';
    default:
      return difficulty;
  }
}
