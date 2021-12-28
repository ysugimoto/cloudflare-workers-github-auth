import { Router } from "itty-router";
import { parse, serialize } from "cookie";
import { signinResponse, signedInResponse, signoutResponse } from "./response";
import { v4 as uuidv4 } from "uuid";

export const router = Router();

// Application root
router.get("/", async (req: Request) => {
  const cookies = parse(req.headers.get("Cookie") || "");

  if (!cookies["sessionId"]) {
    return new Response(signinResponse(), {
      headers: {
        "content-type": "text/html"
      },
    });
  }

  const session = await SESSION.get(cookies["sessionId"]);
  if (!session) {
    return new Response(signinResponse(), {
      headers: {
        "content-type": "text/html"
      },
    });
  }

  return new Response(signedInResponse(session), {
    headers: {
      "content-type": "text/html"
    },
  });
});

// Supress error response e.g Chrome automatic request
router.get("/favicon.ico", async () => {
  return new Response("");
});

// Signout
router.get("/signout", async () => {
  const cookie = serialize("sessionId", "_", {
    expires: new Date(0),
    path: "/",
  });

  return new Response(signoutResponse(), {
    headers: {
      "content-type": "text/html",
      "set-cookie": cookie,
    },
  });
});

// Signin
router.get("/signin", async () => {
  const state = uuidv4();
  // on Cloudflare Workers KV, expirationTtl must be at least 60
  await STATE.put(state, state, { expirationTtl: 60 });

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    state,
  })

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
    302,
  );
});

// GitHub oauth callback handler
router.get("/signin/callback", async (req: Request) => {
  const url = new URL(req.url);
  const queries = url.searchParams;

  if (!queries.get("code")) {
    return Response.redirect("/", 302);
  }

  const state = queries.get("state");
  if (!state) {
    return Response.redirect("/", 302);
  }
  const value = await STATE.get(state);
  if (!value) {
    return Response.redirect("/", 302);
  }
  await STATE.delete(state);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code: queries.get("code") || "",
    redirect_uri: GITHUB_REDIRECT_URI,
  });

  const token = await fetch(
    `https://github.com/login/oauth/access_token`,
    {
      method: "POST",
      body: params.toString(),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "accept": "application/json",
      },
    },
  );
  const { access_token } = await token.json();
  console.log(access_token);

  const user = await fetch(
    `https://api.github.com/user`,
    {
      headers: {
        "accept": "application/vnd.github.v3+json",
        "authorization": `token ${access_token}`,
        "user-agent": "Cloudflare Workers/1.0"
      },
    }
  );
  const u = await user.text();
  console.log(u);
  const { login } = JSON.parse(u);
  const sessionId = uuidv4();
  await SESSION.put(sessionId, login, { expirationTtl: 60 * 60 });

  const cookie = serialize("sessionId", sessionId, {
    maxAge: 60 * 60,
    path: "/",
  });
  return new Response(signedInResponse(login), {
    headers: {
      "content-type": "text/html",
      "set-cookie": cookie,
    },
  });
});
