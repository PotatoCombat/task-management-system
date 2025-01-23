function getUsers(req, res) {
  req.db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching users');
    } else {
      res.json(results);
    }
  });
};

function getUser(req, res) {
  res.status(503).send('This endpoint is under construction');
};

function createUser(req, res) {
  res.status(503).send('This endpoint is under construction');
};

function updateUser(req, res) {
  res.status(503).send('This endpoint is under construction');
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
};
