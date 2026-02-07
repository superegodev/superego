const REPO_API_URL = "https://api.github.com/repos/superegodev/superego";

export default async function getStarCount() {
  try {
    const response = await fetch(REPO_API_URL);
    const data = await response.json();
    return typeof data?.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}
