export const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = schema.parse({
      ...req.body,
      ...req.params,
      ...req.query,
      files: req.files,
    });
    req.body = validatedData;
    next();
  } catch (error) {
    next(error);
  }
};
