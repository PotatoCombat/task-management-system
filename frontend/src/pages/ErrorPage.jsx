import { Container, Typography } from '@mui/material';
import styles from './styles';


const ErrorPage = () => {
  return (
    <Container maxWidth='xl'>
      <Typography variant='h4' align='left' sx={styles.title}>404</Typography>
      <Typography variant='h6' align='left'>Page not found</Typography>
    </Container>
  );
};

export default ErrorPage;
