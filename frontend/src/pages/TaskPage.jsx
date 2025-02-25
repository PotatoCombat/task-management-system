import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Chip,
  Input,
  InputLabel,
  MenuItem,
  Select,
  styled,
  Typography
} from '@mui/material';

import api from '@/api';
import { useAlert } from '@/contexts/AlertContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import styles from './styles';


const TextArea = styled('textarea')(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  border: `2px solid #bbb`,
  fontFamily: theme.typography.fontFamily, // Apply MUI's default font family
  fontSize: theme.typography.body1.fontSize, // Ensure font size matches theme
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '&:focus': {
    borderWidth: 2,
    borderColor: theme.palette.primary.main,
    outline: 'none',
  },
  '&::placeholder': {
    color: theme.palette.text.secondary, // Use secondary text color for placeholder
    fontFamily: theme.typography.fontFamily, // Apply MUI's default font family
    fontSize: theme.typography.body1.fontSize, // Use body font size for consistency
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground, // Change background on disable
    color: theme.palette.text.disabled, // Apply disabled text color
    borderColor: theme.palette.action.disabled, // Adjust border color
    '&::placeholder': {
      color: theme.palette.text.disabled, // Make placeholder text match disabled text color
    },
  },
}));

const createDefaultTask = (application) => ({
  id: application,
  state: 'OPEN',
  plan: null,
  name: '',
  description: '',
  notes: []
});

const VIEW = {
  CREATE: 'CREATE',
  OPEN: 'OPEN',
  TODO: 'TODO',
  DOING: 'DOING',
  DONE: 'DONE',
  CLOSED: 'CLOSED',
}

const getAppPermission = (permissions, view) => {
  switch (view) {
    case VIEW.CREATE:
      return permissions.permitCreate;
    case VIEW.OPEN:
      return permissions.permitOpen;
    case VIEW.TODO:
      return permissions.permitToDo;
    case VIEW.DOING:
      return permissions.permitDoing;
    case VIEW.DONE:
      return permissions.permitDone;
    default:
      return null;
  }
}

const TaskPage = () => {
  const navigate = useNavigate();

  const { application, taskId } = useParams();
  const { showSuccess, showError } = useAlert();
  const { isUserInGroup } = useAuth();

  const [appPermissions, setAppPermissions] = useState(undefined);
  const [plans, setPlans] = useState(undefined);
  const [task, setTask] = useState(undefined);

  const [plan, setPlan] = useState(undefined);
  const [note, setNote] = useState('');

  const view = taskId === undefined ? VIEW.CREATE : task?.state;
  const hasPermission = appPermissions === undefined ? false : isUserInGroup(getAppPermission(appPermissions, view));

  useEffect(() => {
    fetchAppPermissions();
    fetchPlans();
    fetchTask();
  }, []);

  async function fetchAppPermissions() {
    try {
      const response = await api.getApplicationPermissions({ acronym: application });
      setAppPermissions(response.data);
    } catch (error) {
      showError(error);
    }
  }

  async function fetchPlans() {
    try {
      const response = await api.getAllPlans({ application });
      setPlans(Object.keys(response.data));
    } catch (error) {
      showError(error);
    }
  }

  async function fetchTask() {
    if (taskId) {
      try {
        const response = await api.getTask({ taskId });
        setTask(response.data);
        setPlan(response.data.plan);
      } catch (error) {
        showError(error);
      }
    } else {
      setTask(createDefaultTask(application));
    }
  }

  async function addTaskNote() {
    if (note.length === 0) {
      return false;
    }
    await api.addTaskNote({ taskId, note });
    setNote('');
    return true;
  }

  async function updateTaskPlan(newPlan = undefined) {
    if (newPlan) {
      await api.updateTaskPlan({ taskId, plan: newPlan });
      setPlan(newPlan);
      return true;
    }
    if (plan === task.plan || ![VIEW.OPEN, VIEW.DONE].includes(view)) {
      return false;
    }
    await api.updateTaskPlan({ taskId, plan: task.plan });
    setPlan(task.plan);
    return true;
  }

  async function updateTask() {
    let updates = 0;
    try {
      updates += await addTaskNote() ? 1 : 0;
      if (view !== VIEW.DONE) {
        updates += await updateTaskPlan() ? 1 : 0;
      }
      if (updates > 0) {
        await fetchTask();
        showSuccess('Updated task');
      }
    } catch (error) {
      showError(error);
    }
  }

  async function changeTaskState(action) {
    try {
      await addTaskNote();
      await updateTaskPlan();
      const message = await action();
      showSuccess(message, { persist: true });
      navigate(`/apps/${application}`);
    } catch (error) {
      showError(error);
    }
  }

  async function createTask() {
    changeTaskState(async () => {
      const response = await api.createTask({ application: application, name: task.name, plan: task.plan, description: task.description });
      return `Created task: ${response.data.id}`;
    });
  }

  async function releaseTask() {
    changeTaskState(async () => {
      await api.releaseTask({ taskId });
      return `Released task: ${taskId}`;
    });
  }

  async function workOnTask() {
    changeTaskState(async () => {
      await api.workOnTask({ taskId });
      return `Working on task: ${taskId}`;
    });
  }

  async function returnTask() {
    changeTaskState(async () => {
      await api.returnTask({ taskId });
      return `Returned task: ${taskId}`;
    });
  }

  async function seekApprovalTask() {
    changeTaskState(async () => {
      await api.seekApprovalTask({ taskId });
      return `Seeking approval for task: ${taskId}`;
    });
  }

  async function requestExtensionTask() {
    changeTaskState(async () => {
      await api.requestExtensionTask({ taskId });
      return `Requested extension for task: ${taskId}`;
    });
  }

  async function rejectTask() {
    changeTaskState(async () => {
      await api.rejectTask({ taskId });
      return `Rejected task: ${taskId}`;
    });
  }

  async function approveTask() {
    if (plan !== task.plan) {
      showError(new Error('Cannot approve task with different plan'));
      setTask({ ...task, plan: plan });
      return;
    }
    changeTaskState(async () => {
      await api.approveTask({ taskId });
      return `Approved task: ${taskId}`;
    });
  }

  function renderTaskName() {
    const editable = hasPermission && view === VIEW.CREATE;
    if (editable) {
      return <Input placeholder='Enter Task Name' sx={{fontWeight: 'bold', fontSize: '1.5rem' }} slotProps={{ input: { maxLength: 50 }}} onChange={(e) => setTask({ ...task, name: e.target.value })} />;
    } else {
      return <Input value={task.name} sx={{fontWeight: 'bold', fontSize: '1.5rem' }} disableUnderline readOnly />;
    }
  }

  function renderTaskId() {
    return <Chip label={`#${task.id}`} sx={{alignSelf: 'flex-start', mt: 1}} />;
  }

  const DEFAULT_PLAN = '*';

  function renderTaskPlan() {
    const editable = hasPermission && [VIEW.CREATE, VIEW.OPEN, VIEW.DONE].includes(view);
    return (
      <>
        <InputLabel sx={{mt: 1}}>Plan</InputLabel>
        <Select value={task.plan ?? DEFAULT_PLAN} disabled={!editable} onChange={(e) => setTask({ ...task, plan: e.target.value === DEFAULT_PLAN ? null : e.target.value })} >
          <MenuItem key={DEFAULT_PLAN} value={DEFAULT_PLAN}>- - - - -</MenuItem>
          {plans.map((plan) => (
            <MenuItem key={plan} value={plan}>{plan}</MenuItem>
          ))}
        </Select>
      </>
    );
  }

  function renderTaskState() {
    return (
      <Typography variant='h5' sx={{alignSelf: 'flex-start', alignItems: 'center', fontWeight: 'bold', width: 'auto', ml: 2}}>
        {task.state}
      </Typography>
    );
  }

  function renderTaskDescription() {
    const editable = hasPermission && view === VIEW.CREATE;
    return (
      <>
        <InputLabel sx={{mt: 2}}>Description</InputLabel>
        <TextArea value={task.description} disabled={!editable} placeholder={editable ? 'Enter description' : '...'} sx={{flex: 1, resize: 'none', overflow: 'auto', }} onChange={(e) => setTask({ ...task, description: e.target.value })}/>
      </>
    );
  }

  function renderTaskNote(note, index) {
    const color = note.type === 'audit' ? 'primary' : undefined
    const date = new Date(note.date_posted).toLocaleString();
    return (
      <Box key={index} sx={{display: 'flex', whiteSpace: 'pre-wrap'}}>
        <Typography color={color} sx={{fontWeight: 'bold'}}>{`${date} | ${note.state} (${note.creator}): `}</Typography>
        <Typography color={color}>{note.text}</Typography>

      </Box>
    );
  }

  function renderTaskNotes() {
    const editable = hasPermission && ![VIEW.CREATE, VIEW.CLOSED].includes(view);
    return (
      <>
        <Box sx={{ width: '100%', height: 'calc(100% - 70px)', resize: 'vertical', overflow: 'auto', backgroundColor: '#f5f5f5', border: '2px solid #bbb', borderRadius: '5px', padding: '10px', }}>
          {(task.notes.length > 0) ? task.notes.map(renderTaskNote) : <Typography>...</Typography>}
        </Box>
        <TextArea value={note} sx={{ width: '100%', minHeight: '70px', resize: 'none', overflow: 'auto', flex: 1 }} placeholder={editable ? 'Enter notes' : '...'} disabled={!editable} onChange={(e) => setNote(e.target.value)} />
      </>
    );
  }

  function renderActions() {
    if (!hasPermission) {
      return null;
    }
    switch (view) {
      case VIEW.CREATE:
        return (
          <>
            <Button onClick={createTask} sx={{ml: 'auto'}}>Create Task</Button>
          </>
        );
      case VIEW.OPEN:
        return (
          <>
            <Button onClick={releaseTask}>Release</Button>
            <Button onClick={updateTask} sx={{ml: 'auto'}}>Save Changes</Button>
          </>
        );
      case VIEW.TODO:
        return (
          <>
            <Button onClick={workOnTask}>Work On</Button>
            <Button onClick={updateTask} sx={{ml: 'auto'}}>Save Changes</Button>
          </>
        );
      case VIEW.DOING:
        return (
          <>
            <Button onClick={returnTask}>Return</Button>
            <Button onClick={seekApprovalTask}>Seek Approval</Button>
            <Button onClick={requestExtensionTask}>Request Extension</Button>
            <Button onClick={updateTask} sx={{ml: 'auto'}}>Save Changes</Button>
          </>
        );
      case VIEW.DONE:
        return (
          <>
            <Button onClick={rejectTask}>Reject</Button>
            <Button onClick={approveTask} disabled={plan !== task.plan}>Approve</Button>
            <Button onClick={updateTask} disabled={plan !== task.plan} sx={{ml: 'auto'}}>Save Changes</Button>
          </>
        );
      default:
        return null;
    };
  }

  if (plans === undefined || task === undefined) {
    return null;
  }

  return (
    <Box sx={styles.container}>
      <Box id='task-navigation'>
        <Button component={Link} to={`/apps/${application}`}>{'< Back'}</Button>
      </Box>
      <Box id='task-content' sx={{display: 'flex', flex: 1, overflow: 'auto', minHeight: '300px'}}>
        <Box id='task-content-left' sx={{flex: 1, flexDirection: 'column', display: 'flex', overflow: 'auto', mr: 4}}>
          <Box sx={{display: 'flex'}}>
            <Box sx={{display: 'flex', flexDirection: 'column', flex: 1}}>
              {renderTaskName()}
              {renderTaskId()}
              {renderTaskPlan()}
            </Box>
            {renderTaskState()}
          </Box>
          {renderTaskDescription()}
        </Box>
        <Box id='task-content-right' sx={{flex: 1, flexDirection: 'column', display: 'flex', overflow: 'auto'}}>
        {renderTaskNotes()}
        </Box>
      </Box>
      <Box id='task-actions' sx={{display: 'flex', alignItems: 'flex-end', height: '40px'}}>
        {renderActions()}
      </Box>
    </Box>
  );
};

export default TaskPage;
