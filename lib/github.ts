export async function fetchContributions(username: string) {
  async function gh(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('GitHub API error');
    return res.json();
  }

  const ownRepos = await gh(`https://api.github.com/users/${username}/repos?per_page=100`);
  const ownRepoNames = new Set(ownRepos.map((r: any) => r.full_name));

  const issuesRes = await gh(`https://api.github.com/search/issues?q=author:${username}+type:issue&per_page=30`);
  const issues = issuesRes.items.filter((i: any) => !ownRepoNames.has(i.repository_url.split('/').slice(-2).join('/')))
    .map((i: any) => ({
      type: 'Issue',
      repo: i.repository_url.split('/').slice(-2).join('/'),
      title: i.title,
      url: i.html_url,
      date: i.created_at,
    }));

  const prsRes = await gh(`https://api.github.com/search/issues?q=author:${username}+type:pr&per_page=30`);
  const prs = prsRes.items.filter((p: any) => !ownRepoNames.has(p.repository_url.split('/').slice(-2).join('/')))
    .map((p: any) => ({
      type: 'Pull Request',
      repo: p.repository_url.split('/').slice(-2).join('/'),
      title: p.title,
      url: p.html_url,
      date: p.created_at,
    }));

  const events = await gh(`https://api.github.com/users/${username}/events/public`);
  const comments = [];
  const reviews = [];
  const commits = [];
  for (const event of events) {
    const repoName = event.repo.name;
    if (ownRepoNames.has(repoName)) continue;

    if (event.type === 'IssueCommentEvent') {
      comments.push({
        type: 'Issue Comment',
        repo: repoName,
        title: event.payload.issue?.title,
        url: event.payload.issue?.html_url,
        date: event.created_at,
      });
    } else if (event.type === 'PullRequestReviewEvent') {
      reviews.push({
        type: 'PR Review',
        repo: repoName,
        title: event.payload.pull_request?.title,
        url: event.payload.pull_request?.html_url,
        date: event.created_at,
      });
    } else if (event.type === 'PushEvent') {
      for (const commit of event.payload.commits) {
        commits.push({
          type: 'Commit',
          repo: repoName,
          message: commit.message,
          url: `https://github.com/${repoName}/commit/${commit.sha}`,
          date: event.created_at,
        });
      }
    }
  }

  return [...issues, ...prs, ...comments, ...reviews, ...commits];
}
