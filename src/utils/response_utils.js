export const successResponse = (
  res,
  { message = "OK", data = null, status = 200 }
) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (Array.isArray(data)) {
    response.dataAmount = data.length;
  }
  return res.status(status).json(response);
};

export const errorResponse = (
  res,
  { message = "Error", errors = null, status = 500 }
) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};
