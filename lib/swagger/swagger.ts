import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
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
    });
    return spec;
};
