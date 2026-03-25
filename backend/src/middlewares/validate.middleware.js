export const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = schema.parse({
      ...req.body,
      ...req.params,
      ...req.query,
      file: req.file,
      files: req.files,
    });
    req.body = { ...req.body, ...validatedData }; // Merge to preserve multipart keys while applying validation transforms
    next();
  } catch (error) {
    next(error);
  }
};
