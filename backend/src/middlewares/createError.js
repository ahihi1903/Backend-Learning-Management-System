export default function createError(status, message, options = {}) {
  const err = new Error(message);
  err.status = status;
  if (options.expose !== undefined) err.expose = options.expose;
  return err;
}
