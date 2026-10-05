import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates a request body against a Zod schema.
 */
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const field = issue.path.join('.');
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(issue.message);
      }

      return {
        error: NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: fieldErrors,
          },
          { status: 400 },
        ),
      };
    }

    // Malformed JSON or unexpected error
    return {
      error: NextResponse.json(
        {
          success: false,
          message: 'Invalid request body',
        },
        { status: 400 },
      ),
    };
  }
}
