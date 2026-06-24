const REPO_OWNER = "franci8319";
const REPO_NAME = "izquierdo-seguros";
const BRANCH = "master";
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

export class GithubConflictError extends Error {}

function githubHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${API_BASE}/contents/${path}?ref=${BRANCH}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub getFile failed for ${path}: ${res.status}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function putFileBase64(
  path: string,
  base64Content: string,
  sha: string | undefined,
  message: string
): Promise<{ sha: string }> {
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "PUT",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: base64Content, sha, branch: BRANCH }),
  });
  if (res.status === 409) {
    throw new GithubConflictError(`Conflicto de sha al guardar ${path}`);
  }
  if (!res.ok) {
    throw new Error(`GitHub putFile failed for ${path}: ${res.status}`);
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

export async function putFile(
  path: string,
  textContent: string,
  sha: string | undefined,
  message: string
): Promise<{ sha: string }> {
  return putFileBase64(path, Buffer.from(textContent, "utf-8").toString("base64"), sha, message);
}
