import { jest } from "@jest/globals";

const productRepository = {
  findById: jest.fn(),
};

const productImageRepository = {
  countByProductId: jest.fn(),
  create: jest.fn(),
  findByIdAndProductId: jest.fn(),
  remove: jest.fn(),
  setAsMain: jest.fn(),
};

const cloudinaryService = {
  deleteCloudinaryImage: jest.fn(),
  uploadImageBuffer: jest.fn(),
};

jest.unstable_mockModule("../src/repositories/product.repository.js", () => productRepository);
jest.unstable_mockModule(
  "../src/repositories/productImage.repository.js",
  () => productImageRepository,
);
jest.unstable_mockModule(
  "../src/services/cloudinary.service.js",
  () => cloudinaryService,
);

const { AppError } = await import("../src/utils/AppError.js");
const {
  addProductImage,
  deleteProductImage,
  setProductMainImage,
} = await import("../src/services/productImage.service.js");

const activeProduct = { id: 1, is_active: true };
const image = {
  id: 10,
  product_id: 1,
  public_id: "products/1/image-10",
  is_main: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  productRepository.findById.mockResolvedValue(activeProduct);
  productImageRepository.countByProductId.mockResolvedValue(0);
  productImageRepository.findByIdAndProductId.mockResolvedValue(image);
  cloudinaryService.deleteCloudinaryImage.mockResolvedValue({ result: "ok" });
});

describe("productImage service consistency", () => {
  test("propaga un upload fallido de Cloudinary sin cleanup", async () => {
    const cloudinaryError = new AppError("Cloudinary no disponible", 502);
    cloudinaryService.uploadImageBuffer.mockRejectedValue(cloudinaryError);

    await expect(
      addProductImage(1, { fileBuffer: Buffer.from("image") }),
    ).rejects.toBe(cloudinaryError);

    expect(productImageRepository.create).not.toHaveBeenCalled();
    expect(cloudinaryService.deleteCloudinaryImage).not.toHaveBeenCalled();
  });

  test("compensa un INSERT fallido cuando cleanup remoto funciona", async () => {
    const insertError = new Error("INSERT failed");
    cloudinaryService.uploadImageBuffer.mockResolvedValue({
      secure_url: "https://example.test/image.webp",
      public_id: "products/1/uploaded",
    });
    productImageRepository.create.mockRejectedValue(insertError);

    await expect(
      addProductImage(1, { fileBuffer: Buffer.from("image") }),
    ).rejects.toBe(insertError);

    expect(cloudinaryService.deleteCloudinaryImage).toHaveBeenCalledWith(
      "products/1/uploaded",
    );
  });

  test("registra public_id cuando falla también el cleanup", async () => {
    const insertError = new Error("INSERT failed");
    const cleanupError = new Error("destroy failed");
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    cloudinaryService.uploadImageBuffer.mockResolvedValue({
      secure_url: "https://example.test/image.webp",
      public_id: "products/1/orphan",
    });
    productImageRepository.create.mockRejectedValue(insertError);
    cloudinaryService.deleteCloudinaryImage.mockRejectedValue(cleanupError);

    await expect(
      addProductImage(1, { fileBuffer: Buffer.from("image") }),
    ).rejects.toBe(insertError);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "No se pudo limpiar la imagen de Cloudinary. public_id=products/1/orphan",
      {
        originalError: "INSERT failed",
        cleanupError: "destroy failed",
      },
    );
    consoleErrorSpy.mockRestore();
  });

  test("elimina PostgreSQL antes de destruir el asset remoto", async () => {
    productImageRepository.remove.mockResolvedValue(image);

    await expect(deleteProductImage(1, 10)).resolves.toBe(image);

    expect(productImageRepository.remove).toHaveBeenCalledWith(1, 10);
    expect(cloudinaryService.deleteCloudinaryImage).toHaveBeenCalledWith(
      image.public_id,
    );
    expect(
      productImageRepository.remove.mock.invocationCallOrder[0],
    ).toBeLessThan(
      cloudinaryService.deleteCloudinaryImage.mock.invocationCallOrder[0],
    );
  });

  test("no llama a Cloudinary si falla PostgreSQL al eliminar", async () => {
    productImageRepository.remove.mockRejectedValue(new Error("DB failed"));

    await expect(deleteProductImage(1, 10)).rejects.toMatchObject({
      statusCode: 500,
    });

    expect(cloudinaryService.deleteCloudinaryImage).not.toHaveBeenCalled();
  });

  test("devuelve 502 y registra el public_id si falla destroy después del commit", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    productImageRepository.remove.mockResolvedValue(image);
    cloudinaryService.deleteCloudinaryImage.mockRejectedValue(
      new AppError("Cloudinary failed", 502),
    );

    await expect(deleteProductImage(1, 10)).rejects.toMatchObject({
      statusCode: 502,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `La imagen fue eliminada de PostgreSQL, pero no pudo eliminarse de Cloudinary. public_id=${image.public_id}`,
      "Cloudinary failed",
    );
    consoleErrorSpy.mockRestore();
  });

  test("propaga error si setAsMain no devuelve la imagen objetivo", async () => {
    productImageRepository.setAsMain.mockResolvedValue(null);

    await expect(setProductMainImage(1, 10)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
