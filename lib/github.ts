export async function fetchContributions(username: string) {
  const response = await fetch(`https://api.github.com/users/${username}/repos`);
  if (!response.ok) throw new Error('Failed to fetch repositories');
  return await response.json();
}