const GITHUB_USER = "Plattnericus";

type GithubApiRepo = {
  name: string;
  description: string | null;
  homepage: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
};

export type GithubRepoStats = {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
};

export type GithubSummary = {
  ok: boolean;
  totals: { repos: number; stars: number; forks: number };
  repos: GithubRepoStats[];
  fetchedAt: string;
};

export const emptyGithubSummary = (): GithubSummary => ({
  ok: false,
  totals: { repos: 0, stars: 0, forks: 0 },
  repos: [],
  fetchedAt: new Date().toISOString(),
});

function fetchRepos(useToken: boolean) {
  const token =
    process.env["GITHUB-TOKEN"] ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Plattnericus-LandingPage",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (useToken && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
    { headers, next: { revalidate: 3600 } },
  );
}

export async function getGithubSummary(): Promise<GithubSummary> {
  try {
    let response = await fetchRepos(true);

    if (response.status === 401 || response.status === 403) {
      response = await fetchRepos(false);
    }

    if (!response.ok) {
      return emptyGithubSummary();
    }

    const repos = (await response.json()) as GithubApiRepo[];
    const publicRepos = repos.filter((repo) => !repo.fork);

    return {
      ok: true,
      totals: {
        repos: publicRepos.length,
        stars: publicRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
        forks: publicRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
      },
      repos: publicRepos.map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        homepage: repo.homepage,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        pushedAt: repo.pushed_at,
      })),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return emptyGithubSummary();
  }
}

const normalizeRepoName = (value: string) => value.toLowerCase().replace(/[-_\s.]/g, "");

export function findRepoStats(
  summary: GithubSummary,
  repoName: string,
): GithubRepoStats | null {
  if (!summary.ok) return null;
  const target = normalizeRepoName(repoName);
  return summary.repos.find((repo) => normalizeRepoName(repo.name) === target) ?? null;
}

/** Fixed locale + UTC so server and client render the same string (hydration-safe). */
export const formatRepoDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
