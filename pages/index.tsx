import React, { useState } from "react";
import { fetchContributions } from "../lib/github";

type Contribution = {
  type: string;
  action?: string;
  repo: string;
  title?: string;
  url?: string;
  date: string;
  message?: string;
};

function groupByType(contributions: Contribution[]) {
  return contributions.reduce((acc, c) => {
    acc[c.type] = acc[c.type] || [];
    acc[c.type].push(c);
    return acc;
  }, {} as Record<string, Contribution[]>);
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await fetchContributions(username);
      setContributions(data);
    } catch (e) {
      setError("Failed to fetch contributions");
    }
    setLoading(false);
  };

  const grouped = groupByType(contributions);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#121417',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      color: '#f1f1f1',
    }}>
      <main style={{ flex: 1, padding: '3rem', maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: 24, color: '#00e6a8', fontWeight: 700 }}>GitHub Contributions Viewer</h1>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              fontSize: 18,
              borderRadius: 8,
              border: '1px solid #333',
              background: '#1e1f24',
              color: '#fff',
              outline: 'none',
              transition: 'border 0.2s',
            }}
          />
          <button
            onClick={handleFetch}
            disabled={loading || !username}
            style={{
              padding: '0.75rem 2rem',
              fontSize: 18,
              borderRadius: 8,
              background: loading ? '#009e7e' : '#00e6a8',
              color: '#121417',
              border: 'none',
              fontWeight: 600,
              cursor: loading || !username ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px #0004',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Loading...' : 'Fetch Contributions'}
          </button>
        </div>

        {error && (
          <p style={{
            color: '#ff4d4f',
            textAlign: 'center',
            fontWeight: 500,
            marginBottom: 20,
          }}>{error}</p>
        )}

        {contributions.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: 18, marginTop: 32 }}>
            No contributions found yet.
          </p>
        )}

        {Object.entries(grouped).map(([type, arr]) => (
          <div key={type} style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#00e6a8',
              marginBottom: 16,
              borderBottom: '1px solid #333',
              paddingBottom: 8,
              textTransform: 'capitalize',
            }}>
              {type} ({arr.length})
            </h2>

            <div style={{ display: 'grid', gap: 16 }}>
              {arr.map((c, i) => (
                <div key={i} style={{
                  border: '1px solid #2c2f36',
                  borderRadius: 10,
                  padding: '1rem',
                  background: '#1a1c20',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{
                    fontWeight: 600,
                    color: '#e0e0e0',
                    fontSize: 17,
                    marginBottom: 6,
                  }}>
                    {c.title || c.message || c.repo}
                  </div>

                  <div style={{ fontSize: 15, marginBottom: 4 }}>
                    <span style={{ color: '#888' }}>Repo:</span>{" "}
                    <b style={{ color: '#fff' }}>{c.repo}</b>
                  </div>

                  <div style={{
                    fontSize: 14,
                    color: '#00e6a8',
                    marginBottom: 6,
                  }}>
                    {new Date(c.date).toLocaleString()}
                  </div>

                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#00e6a8',
                        textDecoration: 'underline',
                        fontSize: 15,
                        fontWeight: 500,
                      }}
                    >
                      View on GitHub
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
