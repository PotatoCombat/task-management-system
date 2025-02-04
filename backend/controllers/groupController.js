const repository = require('../repositories/groupRepository');

async function getAllGroups(req, res) {
  try {
    const groups = await repository.getAllGroups();
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching groups');
  }
}

async function createGroup(req, res) {
  try {
    const newGroup = await repository.createGroup(req.body);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating group');
  }
}

module.exports = {
  getAllGroups,
  createGroup,
};
