const repository = require('../repositories/groupRepository');

const { ConflictError } = require('../utilities/errors');
const http = require('../utilities/http');
const validation = require('../utilities/validation');

const getAllGroups = http.asyncHandler(async (req, res) => {
  const groups = await repository.getAllGroups();
  res.json(groups);
})

const createGroup = http.asyncHandler(async (req, res) => {
  const { group } = req.body;

  // Validate params
  validation.validateGroupName(group);

  // Create group
  const newGroup = await repository.createGroup({ group });
  if (!newGroup) {
    throw new ConflictError('Group name already exists');
  }
  res.status(201).json(newGroup);
});

module.exports = {
  getAllGroups,
  createGroup,
};
