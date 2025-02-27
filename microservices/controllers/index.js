const db = require('../utils/database');
const email = require('../utils/email');

const bcryptjs = require('bcryptjs');

const REGEX_TASK_NAME = /^[a-zA-Z0-9 ]{1,50}$/;
const REGEX_PLAN_NAME = /^[a-zA-Z0-9_ -]{1,50}$/;

const CreateTask = async (req, res) => {
  const { username, password, task_name, task_app_acronym, task_plan = null, task_description } = req.body;

  /** Validate Payload **/

  // Validate type
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ code: 'Username is required' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ code: 'Password is required' });
  }

  if (!task_name || typeof task_name !== 'string') {
    return res.status(400).json({ code: 'Task name is required' });
  }

  if (!task_app_acronym || typeof task_app_acronym !== 'string') {
    return res.status(400).json({ code: 'Task app acronym is required' });
  }

  if (task_plan && typeof task_plan !== 'string') {
    return res.status(400).json({ code: 'Task plan is required' });
  }

  if (task_description && typeof task_description !== 'string') {
    return res.status(400).json({ code: 'Task description is required' });
  }

  // Validate format
  if (!REGEX_TASK_NAME.test(task_name)) {
    return res.status(400).json({ code: 'Task name must contain: 1 - 50 characters; only letters (not case sensitive), numbers, or spaces' });
  }

  if (!REGEX_PLAN_NAME.test(task_plan)) {
    return res.status(400).json({ code: 'Task plan must contain: 1 - 50 characters; only letters (not case sensitive), numbers, underscores, or spaces' });
  }

  const conn = await db.getConnection();
  try {
    /** IAM **/

    // Verify login
    const [users] = await conn.execute('SELECT user_password AS hashedPassword FROM user WHERE user_username = ? AND user_enabled = 1', [username]);
    if (users.length === 0) {
      return res.status(400).json({ code: 'User not found' });
    }

    const hashedPassword = users[0].hashedPassword;
    const passwordsMatch = await bcryptjs.compare(password, hashedPassword);
    if (!passwordsMatch) {
      return res.status(400).json({ code: 'Invalid password' });
    }

    // Verify permissions
    const [permissions] = await conn.execute(`SELECT App_permit_Create AS userGroup FROM application WHERE App_acronym = ?`, [task_app_acronym]);
    if (permissions.length === 0) {
      return res.status(400).json({ code: 'You do not have permission to create a task in this application' });
    }

    const permittedGroup = permissions[0].userGroup;
    const [userGroups] = await conn.execute(`SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?`, [username, permittedGroup]);
    if (userGroups.length === 0) {
      return res.status(400).json({ code: 'You do not have permission to create a task in this application' });
    }

    /** TRANSACTION **/

    await conn.beginTransaction();

    // Optional Plan
    if (task_plan) {
      const [plans] = await conn.execute(`SELECT 1 FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?`, [task_plan, task_app_acronym]);
      if (plans.length === 0) {
        await conn.rollback();
        return res.status(400).json({ code: 'Plan not found' });
      }
    }

    // R Number
    const [applications] = await conn.execute(`SELECT App_rNumber AS rNumber FROM application WHERE App_acronym = ? FOR UPDATE`, [task_app_acronym]);
    const rNumber = applications[0].rNumber;
    if (rNumber === 2147483647) {
      await conn.rollback();
      return res.status(400).json({ code: 'Application is full' });
    }

    await conn.execute(`UPDATE application SET App_rNumber = ? WHERE App_acronym = ?`, [rNumber + 1, task_app_acronym]);

    // Create Task
    const task_id = `${task_app_acronym}_${rNumber + 1}`;
    const task_state = 'OPEN';
    const task_description = '';
    const task_owner = username;
    const task_creator = username;
    const task_createDate = new Date();
    const task_notes = [{ text: 'Created task', date_posted: task_createDate, creator: task_creator, state: task_state, type: 'system' }];
    await conn.execute(
      'INSERT INTO task (Task_id, Task_name, Task_app_Acronym, Task_plan, Task_state, Task_description, Task_owner, Task_creator, Task_createDate, Task_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [task_id, task_name, task_app_acronym, task_plan, task_state, task_description, task_owner, task_creator, task_createDate, task_notes]
    );

    await conn.commit();
    res.json({ task_id, code: 'Task created' });

  } catch (error) {
    console.log(error);
    await conn.rollback();
    res.status(400).json();

  } finally {
    conn.release();
  }
}

const TASK_STATES = ['OPEN', 'TODO', 'DOING', 'DONE', 'CLOSED'];

const GetTaskbyState = async (req, res) => {
  const { username, password, task_state, task_app_acronym } = req.body;

  /** Validate Payload **/

  // Validate type
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ code: 'Username is required' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ code: 'Password is required' });
  }

  if (!task_state || !TASK_STATES.includes(task_state.toUpperCase())) {
    return res.status(400).json({ code: 'Task state is required' });
  }

  if (!task_app_acronym || typeof task_app_acronym !== 'string') {
    return res.status(400).json({ code: 'Task app acronym is required' });
  }

  const conn = await db.getConnection();
  try {
    /** IAM **/

    // Verify login
    const [users] = await conn.execute('SELECT user_password AS hashedPassword FROM user WHERE user_username = ? AND user_enabled = 1', [username]);
    if (users.length === 0) {
      return res.status(400).json({ code: 'User not found' });
    }

    const hashedPassword = users[0].hashedPassword;
    const passwordsMatch = await bcryptjs.compare(password, hashedPassword);
    if (!passwordsMatch) {
      return res.status(400).json({ code: 'Invalid password' });
    }

    /** TRANSACTION **/

    // Get Tasks
    const [tasks] = await conn.execute(`SELECT * FROM task WHERE Task_state = ? AND Task_app_Acronym = ?`, [task_state, task_app_acronym]);
    const result = tasks.map(task => ({
      task_id: task.Task_id,
      task_app_acronym: task.Task_app_Acronym,
      task_plan: task.Task_plan,
      task_state: task.Task_state,
      task_name: task.Task_name,
      task_description: task.Task_description,
      task_notes: JSON.parse(task.Task_notes),
      task_owner: task.Task_owner,
      task_creator: task.Task_creator,
      task_createDate: task.Task_createDate
    }));

    res.json(result);

  } catch (error) {
    res.status(400).json();

  } finally {
    conn.release();
  }
}

const PromoteTask2Done = async (req, res) => {
  const { username, password, task_id, task_notes } = req.body;

  /** Validate Payload **/

  // Validate type
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ code: 'Username is required' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ code: 'Password is required' });
  }

  if (!task_id || typeof task_id !== 'string') {
    return res.status(400).json({ code: 'Task id is required' });
  }

  if (task_notes && typeof task_notes !== 'string') {
    return res.status(400).json({ code: 'Task notes is invalid' });
  }

  if (task_notes && task_notes.length > 65535) {
    return res.status(400).json({ code: 'Notes too long' });
  }

  const conn = await db.getConnection();
  try {
    /** IAM **/

    // Verify login
    const [users] = await conn.execute('SELECT user_password AS hashedPassword FROM user WHERE user_username = ? AND user_enabled = 1', [username]);
    if (users.length === 0) {
      return res.status(400).json({ code: 'User not found' });
    }

    const hashedPassword = users[0].hashedPassword;
    const passwordsMatch = await bcryptjs.compare(password, hashedPassword);
    if (!passwordsMatch) {
      return res.status(400).json({ code: 'Invalid password' });
    }

    // Verify permissions
    const [applications] = await conn.execute(`SELECT Task_app_Acronym AS acronym FROM task WHERE Task_id = ?`, [task_id]);
    if (applications.length === 0) {
      return res.status(400).json({ code: 'You do not have permission to promote a task to done in this application' });
    }

    const task_app_acronym = applications[0].acronym;
    const [permissions] = await conn.execute(`SELECT App_permit_Doing AS userGroup FROM application WHERE App_acronym = ?`, [task_app_acronym]);

    const permittedGroup = permissions[0].userGroup;
    const [userGroups] = await conn.execute(`SELECT 1 FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?`, [username, permittedGroup]);
    if (userGroups.length === 0) {
      return res.status(400).json({ code: 'You do not have permission to promote a task to done in this application' });
    }

    /** TRANSACTION **/

    await conn.beginTransaction();

    const [tasks] = await conn.execute(`SELECT Task_state AS old_task_state, Task_notes AS old_task_notes FROM task WHERE Task_id = ? FOR UPDATE`, [task_id]);

    const { old_task_state, old_task_notes } = tasks[0];

    // Wrong state
    if (old_task_state !== 'DOING') {
      await conn.rollback();
      return res.status(400).json({ code: 'Task is not doing' });
    }

    // Notes
    const date_posted = new Date();
    const creator = username;
    const new_task_state = 'DONE';

    const notes = JSON.parse(old_task_notes);
    if (task_notes) {
      notes.unshift({ text: task_notes, date_posted, creator, state: new_task_state, type: 'comment' });
    }
    notes.unshift({ text: 'Seeking approval for task', date_posted, creator, state: new_task_state, type: 'system' });

    const new_task_notes = JSON.stringify(notes);
    if (new_task_notes.length > 65535) {
      await conn.rollback();
      return res.status(400).json({ code: 'Notes too long' });
    }

    await conn.execute(`UPDATE task SET Task_state = ?, Task_notes = ? WHERE Task_id = ?`, [new_task_state, new_task_notes, task_id]);

    // Email
    const [donePermissions] = await conn.execute(`SELECT App_permit_Done AS userGroup FROM application WHERE App_acronym = ?`, [task_app_acronym]);
    const doneGroup = donePermissions[0].userGroup;

    const [doneUsers] = await conn.execute(`SELECT user_group_username FROM user_group WHERE user_group_groupName = ?`, [doneGroup]);
    const usernames = doneUsers.map(user => user.user_group_username);

    const [profiles] = await conn.query(`SELECT user_email FROM user WHERE user_username IN (?)`, [usernames]);

    const subject = `[TMS] Task ${task_id} is DONE`;
    const text = `Task ${task_id} is requires appoval`;
    const recipients = profiles.map(profile => profile.user_email);
    await email.send({ recipients, subject, text });

    await conn.commit();
    res.json({ code: 'Task promoted to DONE state' });

  } catch (error) {
    await conn.rollback();
    res.status(400).json();

  } finally {
    conn.release();
  }
}


module.exports = {
  CreateTask,
  GetTaskbyState,
  PromoteTask2Done,
};
