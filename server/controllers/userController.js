const User = require('../models/User');

// @route GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// @route POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    const { password: _, ...userData } = user.toObject();
    return res.status(201).json({ success: true, data: userData });
  } catch (err) { next(err); }
};

// @route PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    Object.assign(user, rest);
    if (password) user.password = password;
    await user.save();
    return res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @route DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, message: 'User deactivated' });
  } catch (err) { next(err); }
};
