import { jest } from "@jest/globals";

import {
  checkLoginAttempts,
  clearLoginAccountFailures,
  recordLoginFailure,
} from "../src/middlewares/loginRateLimit.middleware.js";

describe("protección del login", () => {
  test("bloquea tras cinco fallos y anuncia el tiempo de espera", () => {
    const req = { body: { email: "PRUEBA@ejemplo.com" }, ip: "192.0.2.10" };
    const next = jest.fn();
    const res = { set: jest.fn(), status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);

    for (let count = 0; count < 5; count += 1) {
      checkLoginAttempts(req, res, next);
      recordLoginFailure(req);
    }

    expect(next).toHaveBeenCalledTimes(5);
    checkLoginAttempts(req, res, next);
    expect(next).toHaveBeenCalledTimes(5);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.set).toHaveBeenCalledWith("Retry-After", expect.any(String));

    clearLoginAccountFailures(req);
    checkLoginAttempts(req, res, next);
    expect(next).toHaveBeenCalledTimes(6);
  });
});
