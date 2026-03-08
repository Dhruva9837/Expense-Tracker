const Client = require('../models/Client');
const Loan = require('../models/Loan');
const { LOAN_STATUS } = require('../config/constants');

// @route GET /api/clients
exports.getClients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { aadhaar: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('createdBy', 'name');

    return res.json({
      success: true,
      data: clients,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// @route GET /api/clients/:id
exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, isDeleted: false }).populate('createdBy', 'name');
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    return res.json({ success: true, data: client });
  } catch (err) { next(err); }
};

// @route POST /api/clients
exports.createClient = async (req, res, next) => {
  try {
    const { aadhaar } = req.body;
    const existing = await Client.findOne({ aadhaar, isDeleted: false });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Client with this Aadhaar already exists' });
    }

    const documents = [];
    if (req.files) {
      for (const [fieldname, files] of Object.entries(req.files)) {
        for (const file of files) {
          documents.push({ type: fieldname, filename: file.originalname, path: file.path });
        }
      }
    }

    const client = await Client.create({ ...req.body, documents, createdBy: req.user._id });
    return res.status(201).json({ success: true, data: client });
  } catch (err) { next(err); }
};

// @route PUT /api/clients/:id
exports.updateClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    return res.json({ success: true, data: client });
  } catch (err) { next(err); }
};

// @route DELETE /api/clients/:id  (soft delete)
exports.deleteClient = async (req, res, next) => {
  try {
    const activeLoan = await Loan.findOne({ clientId: req.params.id, status: LOAN_STATUS.ACTIVE });
    if (activeLoan) {
      return res.status(400).json({ success: false, message: 'Cannot delete client with an active loan' });
    }
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    return res.json({ success: true, message: 'Client deleted successfully' });
  } catch (err) { next(err); }
};

// @route GET /api/clients/:id/loans
exports.getClientLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ clientId: req.params.id, isDeleted: false })
      .sort({ createdAt: -1 })
      .select('-schedule');
    return res.json({ success: true, data: loans });
  } catch (err) { next(err); }
};
