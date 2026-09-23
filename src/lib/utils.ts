/** First uppercase letter of a name, used for avatars. */
export function getInitial(name: string): string {
  const initial = name.trim().charAt(0);
  return initial ? initial.toUpperCase() : "?";
}

/** Motivational copy shown under the rep counter. */
export function repMessage(count: number): string {
  if (count === 0) return "All done. Enjoy the buzz.";
  if (count === 1) return "Just 1 more rep. You've got this.";
  if (count <= 5) return `Only ${count} more reps. Almost there.`;
  if (count <= 10) return `${count} reps left. Keep pushing.`;
  return `${count} reps are waiting for you.`;
}
