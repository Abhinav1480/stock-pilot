import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-helpers";

// Standard rate limiter cache (in-memory for local dev)
const rateLimitCache = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitCache.get(ip) || [];
  const filtered = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (filtered.length >= MAX_REQUESTS) {
    return true;
  }
  filtered.push(now);
  rateLimitCache.set(ip, filtered);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      return errorResponse("Unauthorized", 401);
    }

    // Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    if (isRateLimited(ip)) {
      return errorResponse("Too many requests. Please wait a minute.", 429);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return errorResponse(
        "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.",
        500
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    const sourceType = (formData.get("sourceType") as string) || "IMAGE";

    if (!file) {
      return errorResponse("No file uploaded", 400);
    }

    // Size limit check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse("File size exceeds 10MB limit", 400);
    }

    // Type validation
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return errorResponse("Invalid file type. Only PNG, JPG, JPEG, WEBP are supported.", 400);
    }

    // Read file bytes
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    // Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert inventory data extractor. Analyze the uploaded image (which could be a product packaging, barcode, invoice, bill, or product photo) and return a strict JSON payload. Do not wrap the JSON in markdown code blocks (e.g., do not use \`\`\`json). Return only the JSON object.

The JSON object must have this structure:
{
  "mode": "single" | "multi" | "invoice",
  "products": [
    {
      "productName": "extracted product name",
      "brand": "extracted brand name or null",
      "category": "suggested general category, e.g., Electronics, Clothing, Office Supplies",
      "subCategory": "suggested subcategory or null",
      "description": "short description of the product based on packaging or visual features",
      "sku": "suggested SKU following a clean format based on product name and brand, e.g., TECH-KBD-001",
      "barcode": "extracted barcode value or null",
      "price": estimated selling price as a number, or null,
      "costPrice": estimated cost price as a number, or null,
      "weight": "weight with unit, e.g., 500g or 1.2kg, or null",
      "color": "color or null",
      "material": "material or null",
      "packageSize": "dimensions or size description, or null",
      "manufacturer": "manufacturer or null",
      "country": "country of origin or null",
      "condition": "NEW" | "USED" | "REFURBISHED",
      "unit": "pcs" | "kg" | "box" | "pack",
      "tags": ["tag1", "tag2"],
      "confidence": {
        "productName": number between 0 and 100,
        "brand": number between 0 and 100,
        "category": number between 0 and 100,
        "price": number between 0 and 100,
        "sku": number between 0 and 100
      }
    }
  ],
  "invoice": {
    "supplierName": "extracted supplier name or null",
    "invoiceNumber": "invoice or bill number or null",
    "invoiceDate": "YYYY-MM-DD or null",
    "totalAmount": total invoice amount as a number, or null,
    "gst": GST/Tax amount as a number, or null,
    "items": [
      {
        "productName": "name of product on line item",
        "quantity": quantity as a number,
        "unitPrice": unit price as a number,
        "totalAmount": line total amount as a number,
        "gst": line tax as a number or null
      }
    ]
  }
}

Rules:
1. If the image is a single product/packaging, set mode to "single", fill the "products" array with exactly 1 product, and set "invoice" to null.
2. If the image contains multiple separate products, set mode to "multi", list them in the "products" array, and set "invoice" to null.
3. If the image is an invoice, bill, or receipt, set mode to "invoice", fill the "invoice" object, and set "products" to an empty array.
4. Output strict JSON. Do not include any text, notes, explanation, or markdown blocks. Just the raw JSON.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const responseText = result.response.text().trim();

    // Clean up potentially returned markdown wrappers (just in case model disobeys prompt)
    const cleanedText = responseText
      .replace(/^```json/i, "")
      .replace(/```$/, "")
      .trim();

    let extractedData;
    try {
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Gemini failed to return valid JSON:", responseText);
      return errorResponse("AI failed to return structured data. Please try again.", 502);
    }

    // Save logs to DB
    const extraction = await prisma.aiExtraction.create({
      data: {
        sourceType,
        extractedData: extractedData,
        confidence: extractedData.products?.[0]?.confidence || {},
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return successResponse({
      id: extraction.id,
      ...extractedData,
    });
  } catch (error: any) {
    console.error("AI Analysis failed:", error);
    return errorResponse(error.message || "Internal Server Error", 500);
  }
}
