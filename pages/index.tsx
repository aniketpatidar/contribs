import { GetServerSideProps } from 'next';
import { getUserPublicEvents, parseContributions } from '../lib/github';

interface Contribution {
  issues: any[];
  pullRequests: any[];
  commits: any[];
}

interface Props {
  username: string;
  contributions: Contribution;
}

export default function Home({ username, contributions }: Props) {
  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: '2rem' }}>
      <h1>GitHub Contributions by {username}</h1>
      <section>
        <h2>Issues</h2>
        {contributions.issues.length === 0 ? (
          <p>No issues found.</p>
        ) : (
          <ul>
            {contributions.issues.map((event, i) => (
              <li key={i}>
                <a
                  href={`https://github.com/${event.repo.name}/issues/${event.payload.issue?.number ?? event.payload.comment?.issue_url?.split('/').pop()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {event.payload.issue?.title ??
                    event.payload.comment?.body?.slice(0, 80) ??
                    '[comment]'}
                </a>
                {' '}
                in <b>{event.repo.name}</b> ({new Date(event.created_at).toLocaleDateString()})
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2>Pull Requests</h2>
        {contributions.pullRequests.length === 0 ? (
          <p>No pull requests found.</p>
        ) : (
          <ul>
            {contributions.pullRequests.map((event, i) => (
              <li key={i}>
                <a
                  href={event.payload.pull_request?.html_url ?? event.payload.review?.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {event.payload.pull_request?.title ?? '[review]'}
                </a>
                {' '}
                in <b>{event.repo.name}</b> ({new Date(event.created_at).toLocaleDateString()})
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2>Commits</h2>
        {contributions.commits.length === 0 ? (
          <p>No commits found.</p>
        ) : (
          <ul>
            {contributions.commits.map((commit, i) => (
              <li key={i}>
                <a
                  href={`https://github.com/${commit.repo.name}/commit/${commit.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {commit.message?.slice(0, 80)}
                </a>
                {' '}
                in <b>{commit.repo.name}</b> ({new Date(commit.created_at).toLocaleDateString()})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const username = ctx.query.username ? String(ctx.query.username) : 'aniketpatidar';
  const token = process.env.GITHUB_TOKEN || undefined;
  const events = await getUserPublicEvents(username, token);
  const contributions = parseContributions(events, username);
  return {
    props: {
      username,
      contributions,
    },
  };
};
