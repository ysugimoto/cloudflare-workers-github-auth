export {};

declare global {
  const GITHUB_CLIENT_ID: string;
  const GITHUB_CLIENT_SECRET: string;
  const GITHUB_REDIRECT_URI: string;
  const SESSION: KVNamespace;
  const STATE: KVNamespace;
}
