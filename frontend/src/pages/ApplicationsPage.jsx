import { Box, Typography } from "@mui/material";

import styles from "./styles";

const ApplicationsPage = () => {

  return (
    <Box sx={{ ...styles.container, overflow: 'auto' }}>
      <Typography variant='h4' align='left' sx={styles.title}>Applications</Typography>
    </Box>
  );
};

export default ApplicationsPage;
