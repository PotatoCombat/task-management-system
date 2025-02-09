import { Button, TableCell } from '@mui/material';

const ButtonCell = ({
  label = 'Update',
  ...props
}) => {
  return (
    <TableCell className='table-cell'>
      <Button color='primary' {...props}>
        {label}
      </Button>
    </TableCell>
  );
};

export default ButtonCell;
