import { createSwaggerSpec } from "next-swagger-doc";

type SwaggerSpec = Record<string, unknown>;

let cachedSpecPromise: Promise<SwaggerSpec> | null = null;

export const getApiDocs = async (): Promise<SwaggerSpec> => {
    if (cachedSpecPromise) {
        return cachedSpecPromise;
    }

    cachedSpecPromise = Promise.resolve(
        createSwaggerSpec({
            apiFolder: "app/api", // Path to your API directory
            definition: {
                openapi: "3.0.0",
                info: {
                    title: "AI English Mentor API Docs",
                    version: "1.0.0",
                    description: "API documentation",
                },
            },
            components: {
                securitySchemes: {
                    cookieAuth: {
                        type: "apiKey",
                        in: "cookie",
                        name: "token",
                    },
                },
            },
        }) as SwaggerSpec
    );

    return cachedSpecPromise;
};
