import { router } from "../src/router";
import { signinResponse } from "../src/response";
import makeServiceWorkerEnv from "service-worker-mock";

declare var global: any

describe("router test", () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv());
    jest.resetModules();
  });

  it(`test for "/"`, async () => {
    const response = await router.handle(new Request("/", { method: "GET" }));
    expect(response.status).toEqual(200);
    const body = await response.text();
    expect(body).toEqual(signinResponse());
  });
});
