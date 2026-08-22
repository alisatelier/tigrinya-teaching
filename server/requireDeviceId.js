module.exports = function requireDeviceId(req, res, next) {
  const deviceId = req.header("X-Device-Id");
  if (!deviceId) {
    return res.status(400).json({ error: "Missing X-Device-Id header" });
  }
  req.deviceId = deviceId;
  next();
};
