import { Button, TableCell } from '@mui/material';

const ButtonCell = ({
  label = 'Update',
  ...props
}) => {
  return (
    <TableCell className='table-cell'>
      <Button color='primary' sx={{justifyContent: 'flex-start', textAlign: 'left', width: '100%', p: 'auto'}} {...props}>
        {label}
      </Button>
    </TableCell>
  );
};

export default ButtonCell;
