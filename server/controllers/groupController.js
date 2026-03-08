const Group = require('../models/Group');
const Client = require('../models/Client');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const { LOAN_STATUS, GROUP_STATUS } = require('../config/constants');

// Check if a client is already in an active group
const checkClientActiveGroups = async (memberIds, excludeGroupId = null) => {
  const query = {
    members: { $in: memberIds },
    status: GROUP_STATUS.ACTIVE,
    isDeleted: false
  };
  if (excludeGroupId) query._id = { $ne: excludeGroupId };

  const existingGroups = await Group.find(query).populate('members', 'name');
  if (existingGroups.length > 0) {
    const names = existingGroups.map(g => g.members.filter(m => memberIds.includes(m._id.toString())).map(m => m.name)).flat();
    return [...new Set(names)];
  }
  return null;
};

// @route GET /api/groups
exports.getGroups = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, village, status } = req.query;
    const query = { isDeleted: false };

    if (search) {
      query.$text = { $search: search };
    }
    if (village) query.village = village;
    if (status) query.status = status;

    const total = await Group.countDocuments(query);
    const groups = await Group.find(query)
      .populate('groupHead', 'name phone aadhaar')
      .populate('members', 'name phone aadhaar')
      .populate('collectionAgent', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({
      success: true, data: groups,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// @route GET /api/groups/:id
exports.getGroup = async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, isDeleted: false })
      .populate('groupHead', 'name phone aadhaar address')
      .populate('members', 'name phone aadhaar address')
      .populate('collectionAgent', 'name');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    return res.json({ success: true, data: group });
  } catch (err) { next(err); }
};

// @route POST /api/groups
exports.createGroup = async (req, res, next) => {
  try {
    const { groupName, groupHead, members, centerNumber, centerName, village, centerCode, meetingDay, collectionAgent, riskCategory, status } = req.body;

    if (!groupName || !groupHead || !centerNumber || !centerName || !village) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    let groupMembers = members || [];
    if (!groupMembers.includes(groupHead)) groupMembers.push(groupHead);
    groupMembers = [...new Set(groupMembers)];

    // Enforce max 10 members
    if (groupMembers.length > 10) {
      return res.status(400).json({ success: false, message: 'A group cannot have more than 10 members' });
    }

    // Check if any member is already in another active group
    const duplicateNames = await checkClientActiveGroups(groupMembers);
    if (duplicateNames) {
      return res.status(400).json({
        success: false,
        message: `The following clients are already in an active group: ${duplicateNames.join(', ')}`
      });
    }

    // Optional manual centerCode, else auto-generate
    const finalCenterCode = centerCode || `CTR-${centerNumber}-${village.substring(0, 3).toUpperCase()}`;

    const group = await Group.create({
      groupName, groupHead, members: groupMembers,
      centerNumber, centerName, village, centerCode: finalCenterCode,
      meetingDay, collectionAgent, riskCategory, status,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, data: group });
  } catch (err) { next(err); }
};

// @route PUT /api/groups/:id
exports.updateGroup = async (req, res, next) => {
  try {
    const { groupName, groupHead, members, centerNumber, centerName, village, centerCode, meetingDay, collectionAgent, riskCategory, status } = req.body;

    let group = await Group.findOne({ _id: req.params.id, isDeleted: false });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    let groupMembers = members || group.members.map(m => m.toString());
    if (groupHead && !groupMembers.includes(groupHead)) groupMembers.push(groupHead);
    groupMembers = [...new Set(groupMembers)];

    if (groupMembers.length > 10) {
      return res.status(400).json({ success: false, message: 'A group cannot have more than 10 members' });
    }

    // Check if new members are in other active groups
    const duplicateNames = await checkClientActiveGroups(groupMembers, req.params.id);
    if (duplicateNames) {
      return res.status(400).json({
        success: false,
        message: `The following clients are already in an active group: ${duplicateNames.join(', ')}`
      });
    }

    const updateData = {
      groupName, groupHead, members: groupMembers,
      centerNumber, centerName, village, centerCode,
      meetingDay, collectionAgent, riskCategory, status
    };

    // Clean undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    group = await Group.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    return res.json({ success: true, data: group });
  } catch (err) { next(err); }
};

// @route DELETE /api/groups/:id
exports.deleteGroup = async (req, res, next) => {
  try {
    // Block if active loans exist
    const activeLoans = await Loan.countDocuments({ groupId: req.params.id, status: LOAN_STATUS.ACTIVE, isDeleted: false });
    if (activeLoans > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete group. There are ${activeLoans} active loans associated with this group.`
      });
    }

    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    return res.json({ success: true, message: 'Group deleted successfully' });
  } catch (err) { next(err); }
};

// @route GET /api/groups/:id/loans
exports.getGroupLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ groupId: req.params.id, isDeleted: false }).populate('clientId', 'name phone');
    return res.json({ success: true, data: loans });
  } catch (err) { next(err); }
};

// @route GET /api/groups/:id/payments
exports.getGroupPayments = async (req, res, next) => {
  try {
    const loans = await Loan.find({ groupId: req.params.id, isDeleted: false }).select('_id');
    const loanIds = loans.map(l => l._id);
    const payments = await Payment.find({ loanId: { $in: loanIds } })
      .populate('clientId', 'name')
      .populate('loanId', 'loanNumber')
      .sort({ paidAt: -1 });
    return res.json({ success: true, data: payments });
  } catch (err) { next(err); }
};

// @route GET /api/groups/:id/performance
exports.getGroupPerformance = async (req, res, next) => {
  try {
    const loans = await Loan.find({ groupId: req.params.id, isDeleted: false });
    const totalActive = loans.filter(l => l.status === LOAN_STATUS.ACTIVE).length;
    const totalPrincipal = loans.reduce((sum, l) => sum + (l.principal || 0), 0);
    const totalOutstanding = loans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
    const totalLoans = loans.length;

    // Safety: ensure it's a number
    const collectionEfficiency = totalPrincipal > 0 ? ((totalPrincipal - totalOutstanding) / totalPrincipal) * 100 : 100;
    const safeEfficiency = isNaN(collectionEfficiency) ? 100 : Math.round(collectionEfficiency);

    return res.json({
      success: true,
      data: {
        totalLoans,
        totalActive,
        totalPrincipal,
        totalOutstanding,
        collectionEfficiency: safeEfficiency,
        overdueCount: loans.filter(l => (l.outstandingBalance || 0) > 0 && l.status === LOAN_STATUS.DEFAULTED).length
      }
    });
  } catch (err) { next(err); }
};
