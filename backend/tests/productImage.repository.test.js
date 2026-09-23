import { jest } from "@jest/globals";

const client = {
  query: jest.fn(),
  release: jest.fn(),
};

const pool = {
  connect: jest.fn().mockResolvedValue(client),
};

jest.unstable_mockModule("../src/config/database.js", () => ({ default: pool }));

const { setAsMain } = await import("../src/repositories/productImage.repository.js");

beforeEach(() => {
  jest.clearAllMocks();
  pool.connect.mockResolvedValue(client);
});

describe("productImage repository setAsMain", () => {
  test("hace rollback si UPDATE RETURNING no devuelve la imagen objetivo", async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({});

    await expect(setAsMain(1, 99)).rejects.toThrow(
      "La imagen principal no existe o no pertenece al producto",
    );

    expect(client.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(client.query).toHaveBeenNthCalledWith(4, "ROLLBACK");
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  test("confirma el cambio cuando UPDATE RETURNING devuelve la imagen", async () => {
    const updatedImage = { id: 99, product_id: 1, is_main: true };
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1, rows: [updatedImage] })
      .mockResolvedValueOnce({});

    await expect(setAsMain(1, 99)).resolves.toBe(updatedImage);

    expect(client.query).toHaveBeenNthCalledWith(4, "COMMIT");
    expect(client.query).not.toHaveBeenCalledWith("ROLLBACK");
  });

  test("hace rollback si PostgreSQL rechaza la unicidad de la principal", async () => {
    const uniqueError = new Error("unique violation");
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockRejectedValueOnce(uniqueError)
      .mockResolvedValueOnce({});

    await expect(setAsMain(1, 99)).rejects.toBe(uniqueError);

    expect(client.query).toHaveBeenNthCalledWith(4, "ROLLBACK");
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");
  });
});
