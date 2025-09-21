import { useState } from "react";
import { fetchContributions } from "../lib/github";

export default function Home() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setError("");
    try {
      const data = await fetchContributions(username);
      setRepos(data);
    } catch (e) {
      setError("Failed to fetch contributions");
    }
  };

  return (
    <main>
      <h1>GitHub Contributions App</h1>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Enter GitHub username"
      />
      <button onClick={handleFetch}>Fetch Contributions</button>
      {error && <p>{error}</p>}
      <ul>
        {repos.map((repo: any) => (
          <li key={repo.id}>{repo.name}</li>
        ))}
      </ul>
    </main>
  );
}