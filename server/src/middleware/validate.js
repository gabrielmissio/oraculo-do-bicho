/**
 * Factory that returns an Express middleware which validates req.body against
 * a Zod schema. On success, req.body is replaced with the parsed (and trimmed)
 * value. On failure, a 400 response is returned with field-level error details.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
