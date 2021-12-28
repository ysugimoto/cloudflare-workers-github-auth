export function signinResponse(): string {
  return `<a href="/signin">You need to sign into GitHub</a>`;
}

export function signedInResponse(githubName: string): string {
  return `<p>You're signing in as <strong>${escape(githubName)}</strong></p><a href="/signout">Signout</a>`;
}

export function signoutResponse(): string {
  return `<p>You've signed out!</p><a href="/">back to top</a>`;
}

function escape(str: string): string {
  return str
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace("\"", "&ldquo;")
    .replace("'", "&lsquo;")
  ;
}
