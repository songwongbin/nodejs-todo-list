export default (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ errorMessage: err.message });
  }
  return res.status(500).json({ errorMessage: "서버 에러 발생!" });
};
