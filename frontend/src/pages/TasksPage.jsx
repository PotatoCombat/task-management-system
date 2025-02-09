import { Container, Typography } from '@mui/material';

import styles from './styles';

const TasksPage = () => {
  return (
    <Container maxWidth={false}>
      <Typography variant='h4' align='left' sx={styles.title}>Tasks</Typography>
    </Container>
  );
};

export default TasksPage;
