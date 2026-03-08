const Settings = require('../models/Settings');

// @route GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.find();
    const settingsMap = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });
    return res.json({ success: true, data: settingsMap });
  } catch (err) { next(err); }
};

// @route PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // { key: value, ... }
    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const setting = await Settings.findOneAndUpdate(
        { key },
        { key, value, updatedBy: req.user._id },
        { upsert: true, new: true }
      );
      results.push(setting);
    }
    return res.json({ success: true, data: results });
  } catch (err) { next(err); }
};
