const db = require('../utilities/database');
const email = require('../utilities/email');


/** APPLICATION **/

const getAllApplications = async (req, res) => {
  const [rows] = await db.execute(`
    SELECT App_acronym AS acronym,
      App_rNumber AS rNumber,
      App_description AS description,
      App_startDate AS startDate,
      App_endDate AS endDate,
      App_permit_Create AS permitCreate,
      App_permit_Open AS permitOpen,
      App_permit_toDoList AS permitToDo,
      App_permit_Doing AS permitDoing,
      App_permit_Done AS permitDone
    FROM application
  `);

  res.json(rows);
};

const getApplicationPermissions = async (req, res) => {
  const { application } = req.params;

  const [rows] = await db.execute(`
    SELECT App_acronym AS acronym,
      App_permit_Create as permitCreate,
      App_permit_Open AS permitOpen,
      App_permit_toDoList AS permitToDo,
      App_permit_Doing AS permitDoing,
      App_permit_Done AS permitDone
    FROM application
    WHERE App_acronym = ?
    `,
    [application]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Application not found' });
  }

  res.json(rows[0]);
};

const createApplication = async (req, res) => {
  let { acronym, rNumber, description, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone } = req.body;
  acronym = acronym.toLowerCase();

  if (!validateAppAcronym(acronym)) {
    return res.status(400).json({ message: 'Acronym must contain: 1 - 50 characters; only letters (not case sensitive) or numbers' });
  }
  if (!isNumberInRange(rNumber, 0, 2147483647)) {
    return res.status(400).json({ message: 'Running number must be: integer between 0 - 2147483647' });
  }
  if (!isLengthInRange(description, 0, 65535)) {
    return res.status(400).json({ message: 'Description must contain: maximum 65535 characters' });
  }
  if (!isDate(startDate)) {
    return res.status(400).json({ message: 'Start date must be a valid date: e.g. yyyy-mm-dd' });
  }
  if (!isDate(endDate)) {
    return res.status(400).json({ message: 'End date must be a valid date: e.g. yyyy-mm-dd' });
  }

  try {
    await db.execute(`
      INSERT INTO application (App_acronym, App_rNumber, App_description, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [acronym, rNumber, description, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone],
    );
    res.status(201).json({ acronym });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Application already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create application, please try again' });
    }
  }
};

const updateApplication = async (req, res) => {
  let { acronym, description, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone } = req.body;
  acronym = acronym.toLowerCase();

  const clauses = [];

  if (description !== undefined) {
    if (!isLengthInRange(description, 0, 65535)) {
      return res.status(400).json({ message: 'Description must contain: maximum 65535 characters' });
    }
    clauses.push({ key: 'App_description', value: description });
  }
  if (startDate !== undefined) {
    if (!isDate(startDate)) {
      return res.status(400).json({ message: 'Start date must be a valid date: e.g. yyyy-mm-dd' });
    }
    clauses.push({ key: 'App_startDate', value: startDate });
  }
  if (endDate !== undefined) {
    if (!isDate(endDate)) {
      return res.status(400).json({ message: 'End date must be a valid date: e.g. yyyy-mm-dd' });
    }
    clauses.push({ key: 'App_endDate', value: endDate });
  }
  if (permitCreate !== undefined) {
    clauses.push({ key: 'App_permit_Create', value: permitCreate });
  }
  if (permitOpen !== undefined) {
    clauses.push({ key: 'App_permit_Open', value: permitOpen });
  }
  if (permitToDo !== undefined) {
    clauses.push({ key: 'App_permit_toDoList', value: permitToDo });
  }
  if (permitDoing !== undefined) {
    clauses.push({ key: 'App_permit_Doing', value: permitDoing });
  }
  if (permitDone !== undefined) {
    clauses.push({ key: 'App_permit_Done', value: permitDone });
  }
  // No changes
  if (clauses.length === 0) {
    return res.sendStatus(204);
  }

  const query = `UPDATE application SET ${clauses.map(clause => `${clause.key} = ?`).join(', ')} WHERE App_acronym = ?`;
  const values = clauses.map(clause => clause.value).concat(acronym);

  try {
    const [rows] = await db.execute(query, values);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.sendStatus(204);

  } catch (error) {
    res.status(500).json({ message: 'Failed to update application, please try again' });
  }
};


/** PLAN **/

const getAllPlans = async (req, res) => {
  let { application } = req.params;

  const [planRows] = await db.execute('SELECT Plan_MVP_name as name, Plan_color as color FROM plan WHERE Plan_app_Acronym = ?', [application]);

  const result = {}
  planRows.sort().forEach(plan => result[plan.name] = plan.color);

  res.status(201).json(result);
};

const createPlan = async (req, res) => {
  let { name, application, startDate, endDate } = req.body;
  application = application.toLowerCase();

  if (!validatePlanName(name)) {
    return res.status(400).json({ message: 'Name must contain: 1 - 50 characters; only letters (not case sensitive), numbers, or spaces' });
  }
  if (!isDate(startDate)) {
    return res.status(400).json({ message: 'Start date must be a valid date: e.g. yyyy-mm-dd' });
  }
  if (!isDate(endDate)) {
    return res.status(400).json({ message: 'End date must be a valid date: e.g. yyyy-mm-dd' });
  }

  const color = getRandomWebSafeColor();

  try {
    const [applicationRows] = await db.execute('SELECT 1 FROM application WHERE App_acronym = ?', [application]);
    if (applicationRows.length === 0) {
      return res.status(404).json({ message: 'Plan application not found' });
    }

    await db.execute(`
      INSERT INTO plan (Plan_MVP_name, Plan_app_Acronym, Plan_startDate, Plan_endDate, Plan_color)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, application, startDate, endDate, color]
    );

    res.status(201).json({ name, application });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Plan already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create plan, please try again' });
    }
  }
};


/** TASK **/

const getAllTasks = async (req, res) => {
  let { application } = req.params;

  const [results] = await db.execute(
    'SELECT Task_id as id, Task_state as state, Task_plan as plan, Task_name as name FROM task WHERE Task_app_Acronym = ?',
    [application]
  );
  res.status(201).json(results);
};

const getTask = async (req, res) => {
  let { taskId } = req.params;

  const [rows] = await db.execute(
    'SELECT Task_id as id, Task_state as state, Task_plan as plan, Task_name as name, Task_description as description, Task_notes as notes FROM task WHERE Task_id = ?',
    [taskId]
  );
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const result = rows[0];
  result.notes = JSON.parse(result.notes);
  res.status(201).json(result);
};

const createTask = async (req, res) => {
  let { application, plan, name, description } = req.body;
  application = application.toLowerCase();
  plan = plan ? plan.toLowerCase() : null;

  const username = req.username;

  const state = 'OPEN';
  const createDate = new Date();
  const creator = username;
  const owner = username;
  const notes = notesForCreateTask(createDate, creator);
  const permission = 'App_permit_Create';

  if (!validateTaskName(name)) {
    return res.status(400).json({ message: 'Name must contain: 1 - 50 characters; only letters (not case sensitive), numbers, or spaces' });
  }
  if (!isLengthInRange(description, 0, 65535)) {
    return res.status(400).json({ message: 'Description must contain: maximum 65535 characters' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check application
    const [appRows] = await connection.execute(`SELECT App_rNumber as rNumber, ${permission} as groupPermission FROM application WHERE App_acronym = ? FOR UPDATE`, [application]);
    if (appRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Application not found' });
    }

    const { rNumber, groupPermission } = appRows[0];
    const id = `${application}_${rNumber}`;

    // Check plan
    if (plan) {
      const [planRows] = await connection.execute('SELECT 1 FROM plan WHERE Plan_app_acronym = ? AND Plan_MVP_name = ?', [application, plan]);
      if (planRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Plan not found' });
      }
    }

    // Verify task permission
    const [groupRows] = await connection.execute('SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?', [username, groupPermission]);
    if (groupRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create task
    await connection.execute(`
      INSERT INTO task (Task_id, Task_app_Acronym, Task_plan, Task_state, Task_name, Task_description, Task_notes, Task_createDate, Task_creator, Task_owner)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [id, application, plan, state, name, description, notes, createDate, creator, owner],
    );

    // Update application running number
    await connection.execute('UPDATE application SET App_rNumber = ? WHERE App_acronym = ?', [rNumber + 1, application]);

    await connection.commit();
    res.status(201).json({ id });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to create task, please try again' });

  } finally {
    connection.release();
  }
};

const promoteTask2ToDo = async (req, res) => {
  const { id } = req.body;
  const username = req.username;
  const currState = 'OPEN';
  const nextState = 'TODO';
  const permission = 'App_permit_Open';
  const notes = notesForReleaseTask(new Date(), username);

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get task details
    const [taskRows] = await connection.execute(
      'SELECT Task_app_Acronym AS application, Task_notes AS oldNotes FROM task WHERE Task_id = ? AND Task_state = ? FOR UPDATE',
      [id, currState]
    );
    if (taskRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Task ${id} not found or not ${currState}` });
    }
    const { application, oldNotes } = taskRows[0];

    // Get task permission
    const [groupPermissionRows] = await connection.execute(`SELECT ${permission} AS groupPermission FROM application WHERE App_acronym = ?`, [application]);
    const { groupPermission } = groupPermissionRows[0];

    // Verify task permission
    const [groupRows] = await connection.execute('SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?', [username, groupPermission]);
    if (groupRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task
    const newNotes = notes.concat(JSON.parse(oldNotes));
    await connection.execute(
      'UPDATE task SET Task_state = ?, Task_owner = ?, Task_notes = ? WHERE Task_id = ?',
      [nextState, username, newNotes, id]
    );

    await connection.commit();
    res.sendStatus(204);

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update task, please try again' });

  } finally {
    connection.release();
  }
};

const promoteTask2Doing = async (req, res) => {
  const { id } = req.body;
  const username = req.username;
  const currState = 'TODO';
  const nextState = 'DOING';
  const permission = 'App_permit_toDoList';
  const notes = notesForWorkOnTask(new Date(), username);

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get task details
    const [taskRows] = await connection.execute(
      'SELECT Task_app_Acronym AS application, Task_notes AS oldNotes FROM task WHERE Task_id = ? AND Task_state = ? FOR UPDATE',
      [id, currState]
    );
    if (taskRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Task ${id} not found or not ${currState}` });
    }
    const { application, oldNotes } = taskRows[0];

    // Get task permission
    const [groupPermissionRows] = await connection.execute(`SELECT ${permission} AS groupPermission FROM application WHERE App_acronym = ?`, [application]);
    const { groupPermission } = groupPermissionRows[0];

    // Verify task permission
    const [groupRows] = await connection.execute('SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?', [username, groupPermission]);
    if (groupRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task
    const newNotes = notes.concat(JSON.parse(oldNotes));
    await connection.execute(
      'UPDATE task SET Task_state = ?, Task_owner = ?, Task_notes = ? WHERE Task_id = ?',
      [nextState, username, newNotes, id]
    );

    await connection.commit();
    res.sendStatus(204);

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update task, please try again' });

  } finally {
    connection.release();
  }
};

const promoteTask2Done = async (req, res) => {
  const { id, requestExtension } = req.body;
  const username = req.username;
  const currState = 'DOING';
  const nextState = 'DONE';
  const permission = 'App_permit_Doing';
  const notes = requestExtension ? notesForRequestExtensionTask(new Date(), username) : notesForSeekApprovalTask(new Date(), username);

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get task details
    const [taskRows] = await connection.execute(
      'SELECT Task_app_Acronym AS application, Task_notes AS oldNotes FROM task WHERE Task_id = ? AND Task_state = ? FOR UPDATE',
      [id, currState]
    );
    if (taskRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Task ${id} not found or not ${currState}` });
    }
    const { application, oldNotes } = taskRows[0];

    // Get task permissions
    const [groupPermissionRows] = await connection.execute(
      `SELECT ${permission} AS groupPermission, App_permit_Done AS plPermission FROM application WHERE App_acronym = ?`,
      [application]
    );
    const { groupPermission, plPermission } = groupPermissionRows[0];

    // Verify task permission
    const [groupRows] = await connection.execute('SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?', [username, groupPermission]);
    if (groupRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task
    const newNotes = notes.concat(JSON.parse(oldNotes));
    await connection.execute(
      'UPDATE task SET Task_state = ?, Task_owner = ?, Task_notes = ? WHERE Task_id = ?',
      [nextState, username, newNotes, id]
    );

    // Notify users who can review task
    const [plRows] = await db.execute('SELECT user_group_username AS username FROM user_group WHERE user_group_groupName = ?', [plPermission]);
    const plUsers = plRows.map(row => row.username);

    const [recipientRows] = await db.query('SELECT user_username AS username, user_email AS email FROM user WHERE user_username IN (?)', [plUsers]);
    const recipients = recipientRows.map(row => `${row.username} <${row.email}>`);

    const subject = `[TMS] Task ${id} is DONE`;
    const text = requestExtension ? `Requesting to extend task ${id}` : `Seeking approval for task ${id}`;

    await email.send({ to: recipients, subject, text});

    await connection.commit();
    res.sendStatus(204);

  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update task, please try again' });

  } finally {
    connection.release();
  }
};

const promoteTask2Closed = async (req, res) => {
  const { id } = req.body;
  const username = req.username;
  const currState = 'DONE';
  const nextState = 'CLOSED';
  const permission = 'App_permit_Done';
  const notes = notesForApproveTask(new Date(), username);

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get task details
    const [taskRows] = await connection.execute(
      'SELECT Task_app_Acronym AS application, Task_notes AS oldNotes FROM task WHERE Task_id = ? AND Task_state = ? FOR UPDATE',
      [id, currState]
    );
    if (taskRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Task ${id} not found or not ${currState}` });
    }
    const { application, oldNotes } = taskRows[0];

    // Get task permission
    const [groupPermissionRows] = await connection.execute(`SELECT ${permission} AS groupPermission FROM application WHERE App_acronym = ?`, [application]);
    const { groupPermission } = groupPermissionRows[0];

    // Verify task permission
    const [groupRows] = await connection.execute('SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?', [username, groupPermission]);
    if (groupRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task
    const newNotes = notes.concat(JSON.parse(oldNotes));
    await connection.execute(
      'UPDATE task SET Task_state = ?, Task_owner = ?, Task_notes = ? WHERE Task_id = ?',
      [nextState, username, newNotes, id]
    );

    await connection.commit();
    res.sendStatus(204);

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update task, please try again' });

  } finally {
    connection.release();
  }
};

const demoteTask2ToDo = async (req, res) => {
  const { id } = req.body;
  const username = req.username;
  const currState = 'DOING';
  const nextState = 'TODO';
  const permission = 'App_permit_Doing';
  const notes = notesForReturnTask(new Date(), username);

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get task details
    const [taskRows] = await connection.execute(
      'SELECT Task_app_Acronym AS application, Task_notes AS oldNotes FROM task WHERE Task_id = ? AND Task_state = ? FOR UPDATE',
      [id, currState]
    );
    if (taskRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Task ${id} not found or not ${currState}` });
    }
    const { application, oldNotes } = taskRows[0];

    // Get task permission
    const [groupPermissionRows] = await connection.execute(`SELECT ${permission} AS groupPermission FROM application WHERE App_acronym = ?`, [application]);
    const { groupPermission } = groupPermissionRows[0];

    // Verify task permission
    const [groupRows] = await connection.execute('SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?', [username, groupPermission]);
    if (groupRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task
    const newNotes = notes.concat(JSON.parse(oldNotes));
    await connection.execute(
      'UPDATE task SET Task_state = ?, Task_owner = ?, Task_notes = ? WHERE Task_id = ?',
      [nextState, username, newNotes, id]
    );

    await connection.commit();
    res.sendStatus(204);

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update task, please try again' });

  } finally {
    connection.release();
  }
};

const demoteTask2Doing = async (req, res) => {
  const { id } = req.body;
  const username = req.username;
  const currState = 'DONE';
  const nextState = 'DOING';
  const permission = 'App_permit_Done';
  const notes = notesForRejectTask(new Date(), username);

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get task details
    const [taskRows] = await connection.execute(
      'SELECT Task_app_Acronym AS application, Task_notes AS oldNotes FROM task WHERE Task_id = ? AND Task_state = ? FOR UPDATE',
      [id, currState]
    );
    if (taskRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Task ${id} not found or not ${currState}` });
    }
    const { application, oldNotes } = taskRows[0];

    // Get task permission
    const [groupPermissionRows] = await connection.execute(`SELECT ${permission} AS groupPermission FROM application WHERE App_acronym = ?`, [application]);
    const { groupPermission } = groupPermissionRows[0];

    // Verify task permission
    const [groupRows] = await connection.execute('SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?', [username, groupPermission]);
    if (groupRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task
    const newNotes = notes.concat(JSON.parse(oldNotes));
    await connection.execute(
      'UPDATE task SET Task_state = ?, Task_owner = ?, Task_notes = ? WHERE Task_id = ?',
      [nextState, username, newNotes, id]
    );

    await connection.commit();
    res.sendStatus(204);

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update task, please try again' });

  } finally {
    connection.release();
  }
};

const TASK_PERMISSIONS = {
  CREATE: 'App_permit_Create',
  OPEN: 'App_permit_Open',
  TODO: 'App_permit_toDoList',
  DOING: 'App_permit_Doing',
  DONE: 'App_permit_Done',
  CLOSED: null,
}

const updateTaskPlan = async (req, res) => {
  let { id, plan } = req.body;
  const username = req.username;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [taskRows] = await connection.execute(
      'SELECT Task_state AS state, Task_app_Acronym AS application, Task_notes AS oldNotes FROM task WHERE Task_id = ? FOR UPDATE',
      [id]
    );
    if (taskRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Task ${id} not found` });
    }

    const { state, application, oldNotes } = taskRows[0];
    if (state !== 'OPEN' && state !== 'DONE') {
      await connection.rollback();
      return res.status(403).json({ message: `Access denied` });
    }
    const permission = TASK_PERMISSIONS[state];

    // Get task permission
    const [groupPermissionRows] = await connection.execute(`SELECT ${permission} AS groupPermission FROM application WHERE App_acronym = ?`, [application]);
    const { groupPermission } = groupPermissionRows[0];

    // Verify task permission
    const [groupRows] = await connection.execute('SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?', [username, groupPermission]);
    if (groupRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Access denied' });
    }

    const notes = notesForUpdatePlan(new Date(), username, state, plan).concat(JSON.parse(oldNotes));
    await connection.execute('UPDATE task SET Task_plan = ?, Task_owner = ?, Task_notes = ? WHERE Task_id = ?', [plan, username, notes, id]);

    await connection.commit();
    res.sendStatus(204);

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update task, please try again' });

  } finally {
    connection.release();
  }
};

const addTaskNote = async (req, res) => {
  let { id, text } = req.body;
  const username = req.username;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [taskRows] = await connection.execute(
      'SELECT Task_state AS state, Task_app_Acronym AS application, Task_notes AS oldNotes FROM task WHERE Task_id = ? FOR UPDATE',
      [id]
    );
    if (taskRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Task ${id} not found` });
    }

    const { state, application, oldNotes } = taskRows[0];
    if (state === 'CLOSED') {
      await connection.rollback();
      return res.status(404).json({ message: `Task ${id} is closed` });
    }

    const permission = TASK_PERMISSIONS[state];

    // Get task permission
    const [groupPermissionRows] = await connection.execute(`SELECT ${permission} AS groupPermission FROM application WHERE App_acronym = ?`, [application]);
    const { groupPermission } = groupPermissionRows[0];

    // Verify task permission
    const [groupRows] = await connection.execute('SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?', [username, groupPermission]);
    if (groupRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Access denied' });
    }

    const notes = notesForComment(new Date(), username, state, text).concat(JSON.parse(oldNotes));
    await connection.execute('UPDATE task SET Task_owner = ?, Task_notes = ? WHERE Task_id = ?', [username, notes, id]);

    await connection.commit();
    res.sendStatus(204);

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update task, please try again' });

  } finally {
    connection.release();
  }
};


/** NOTES **/

const SYSTEM_NOTE = 'audit';
const USER_NOTE = 'user';

function notesForComment(date_posted, creator, state, text) {
  return [{ text, date_posted, creator, state, type: USER_NOTE }];
}

function notesForUpdatePlan(date_posted, creator, state, plan) {
  return [{ text: `Updated: plan = ${plan}`, date_posted, creator, state, type: SYSTEM_NOTE }];
}

function notesForCreateTask(date_posted, creator) {
  return [{ text: `Created task`, date_posted, creator, state: 'OPEN', type: SYSTEM_NOTE }];
}

function notesForReleaseTask(date_posted, creator) {
  return [{ text: `Released task`, date_posted, creator, state: 'TODO', type: SYSTEM_NOTE }];
}

function notesForWorkOnTask(date_posted, creator) {
  return [{ text: `Working on task`, date_posted, creator, state: 'DOING', type: SYSTEM_NOTE }];
}

function notesForSeekApprovalTask(date_posted, creator) {
  return [{ text: `Seeking approval for task`, date_posted, creator, state: 'DONE', type: SYSTEM_NOTE }];
}

function notesForRequestExtensionTask(date_posted, creator) {
  return [{ text: `Requesting to extend task`, date_posted, creator, state: 'DONE', type: SYSTEM_NOTE }];
}

function notesForApproveTask(date_posted, creator) {
  return [{ text: `Approved task`, date_posted, creator, state: 'CLOSED', type: SYSTEM_NOTE }];
}

function notesForReturnTask(date_posted, creator) {
  return [{ text: `Returned task`, date_posted, creator, state: 'TODO', type: SYSTEM_NOTE }];
}

function notesForRejectTask(date_posted, creator) {
  return [{ text: `Rejected task`, date_posted, creator, state: 'DOING', type: SYSTEM_NOTE }];
}


/** COLOR **/

const HEX_VALUE = ['00', '33', '66', '99', 'CC', 'FF'];

function getRandomWebSafeColor() {
  const randomValue = () => HEX_VALUE[Math.floor(Math.random() * HEX_VALUE.length)];
  return `#${randomValue()}${randomValue()}${randomValue()}`;
}


/** VALIDATION */

const REGEX_APP_ACRONYM = /^[A-Za-z\d]{1,50}$/;

function validateAppAcronym(value) {
  return REGEX_APP_ACRONYM.test(value ?? '');
}

const REGEX_PLAN_NAME = /^[A-Za-z \d]{1,50}$/;

function validatePlanName(value) {
  return REGEX_PLAN_NAME.test(value ?? '');
}

function validateTaskName(value) {
  return isLengthInRange(value, 1, 50);
}

function isLengthInRange(value, from, to) {
  return value !== undefined && from <= value.length && value.length <= to;
}

const REGEX_NUMBER = /^\d+$/
function isNumberInRange(value, from, to) {
  const number = Number(value);
  return REGEX_NUMBER.test(value) && from <= number && number <= to;
}

function isDate(value) {
  return !isNaN(new Date(value).getTime())
}

/** EXPORTS **/

module.exports = {
  // APPLICATION
  getAllApplications,
  getApplicationPermissions,
  createApplication,
  updateApplication,
  // PLAN
  getAllPlans,
  createPlan,
  // TASK
  getAllTasks,
  getTask,
  updateTaskPlan,
  addTaskNote,
  createTask,
  promoteTask2ToDo,
  promoteTask2Doing,
  promoteTask2Done,
  promoteTask2Closed,
  demoteTask2ToDo,
  demoteTask2Doing,
};
