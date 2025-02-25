import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Box, Button, TextField, Typography } from '@mui/material';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import api from '@/api';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';

import styles from './styles';


const createDefaultPlan = (application) => ({
  application,
  name: '',
  startDate: null,
  endDate: null,
  color: '#6666cc',
});

const KanbanPage = () => {
  const { application } = useParams();

  const { isUserInGroup, isProjectManager } = useAuth();

  const [tasks, setTasks] = useState(undefined);
  const [plans, setPlans] = useState(undefined);
  const [appPermissions, setAppPermissions] = useState(undefined);

  const [newPlan, setNewPlan] = useState(createDefaultPlan(application));

  const { showSuccess, showError } = useAlert();

  const canCreateTask = appPermissions === undefined ? false : isUserInGroup(appPermissions.permitCreate);

  useEffect(() => {
    fetchTasks();
    fetchPlans();
    fetchAppPermissions();
  }, []);

  async function fetchTasks() {
    try {
      const response = await api.getAllTasks({ application });
      setTasks(response.data.reverse());
    } catch (error) {
      showError(error);
    }
  }

  async function fetchPlans() {
    try {
      const response = await api.getAllPlans({ application });
      setPlans(response.data);
    } catch (error) {
      showError(error);
    }
  }

  async function fetchAppPermissions() {
    try {
      const response = await api.getApplicationPermissions({ acronym: application });
      setAppPermissions(response.data);
    } catch (error) {
      showError(error);
    }
  }

  const toDateString = (date) => {
    if (!date) {
      return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const createPlan = async () => {
    try {
      const response = await api.createPlan({
        ...newPlan,
        startDate: toDateString(newPlan.startDate),
        endDate: toDateString(newPlan.endDate),
      });
      await fetchPlans();
      setNewPlan(createDefaultPlan(application));
      showSuccess(`Created plan: ${response.data.name}`);
    } catch (error) {
      showError(error);
    }
  }

  function renderCreatePlan() {
    return (
      <Box className='create-plan' sx={{display: 'flex', }}>
        <Typography variant='h5' sx={{fontWeight: 'bold', alignSelf: 'center', height: 'auto', pr: 2}}>PLAN</Typography>
        <TextField value={newPlan.name} label='Name' placeholder='Enter name' sx={{padding: 0}} onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}></TextField>
        <DatePicker selected={newPlan.startDate} onChange={(date) => setNewPlan({...newPlan, startDate: date})} dateFormat="yyyy-MM-dd" placeholderText='Enter yyyy-mm-dd' customInput={<TextField label='Start Date' autoComplete='new-password' />} />
        <DatePicker selected={newPlan.endDate} onChange={(date) => setNewPlan({...newPlan, endDate: date})} dateFormat="yyyy-MM-dd" placeholderText='Enter yyyy-mm-dd' customInput={<TextField label='End Date' autoComplete='new-password' />} />
        <Button sx={{textTransform: 'none'}} onClick={() => createPlan()}>Create</Button>
      </Box>
    );
  }

  function renderCreateTask() {
    return (
      <Button className='create-task' component={Link} to={`/apps/${application}/create-task`} sx={{textTransform: 'none', ml: 'auto'}}>
        Create Task
      </Button>
    );
  }

  function renderTask(task) {
    return (
      <Button key={task.id} variant='outlined' component={Link} to={`/apps/${application}/task/${task.id}`}
          sx={{width: '100%', backgroundColor: 'white', borderColor: plans[task.plan], borderWidth: 5, textTransform: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}} onClick={() => {}}>
        <Typography variant='h7' >{task.plan ?? '...'}</Typography>
        <Typography variant='h6' sx={{color: 'red'}}>{task.name}</Typography>
        <Typography variant='h7'>#{task.id}</Typography>
      </Button>
    )
  }

  if (tasks === undefined || plans === undefined || appPermissions === undefined) {
    return null;
  }

  return (
    <Box sx={styles.container}>
      <Typography className='app-title' variant='h4' sx={styles.title}>{application}</Typography>
      <Box className='app-toolbar' sx={{display: 'flex', mt: 2, mb: 2}}>
        {isProjectManager() && renderCreatePlan()}
        {canCreateTask && renderCreateTask()}
      </Box>
      {/* Kanban */}
      <Box className='kanban' gap={4} sx={{display: 'flex', minHeight: '200px', flex: 1}}>
        <Box className='kanban-open' sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #ccc' }}>
          <Typography variant='h6'>OPEN</Typography>
          <Box sx={{overflow: 'auto', flex: 1}}>
            {tasks?.filter(task => task.state === 'OPEN').map(renderTask)}
          </Box>
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #ccc' }}>
          <Typography variant='h6'>TODO</Typography>
          <Box sx={{overflow: 'auto', flex: 1}}>
            {tasks?.filter(task => task.state === 'TODO').map(renderTask)}
          </Box>
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #ccc' }}>
          <Typography variant='h6'>DOING</Typography>
          <Box sx={{overflow: 'auto', flex: 1}}>
            {tasks?.filter(task => task.state === 'DOING').map(renderTask)}
          </Box>
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #ccc' }}>
          <Typography variant='h6'>DONE</Typography>
          <Box sx={{overflow: 'auto', flex: 1}}>
            {tasks?.filter(task => task.state === 'DONE').map(renderTask)}
          </Box>
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid #ccc' }}>
          <Typography variant='h6'>CLOSED</Typography>
          <Box sx={{overflow: 'auto', flex: 1}}>
            {tasks?.filter(task => task.state === 'CLOSED').map(renderTask)}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default KanbanPage;
