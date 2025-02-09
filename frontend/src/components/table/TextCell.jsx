import { Input, TableCell } from '@mui/material';

const TextCell = ({ ...props }) => {
  return (
    <TableCell className='table-cell'>
      <Input fullWidth disableUnderline {...props} />
    </TableCell>
  );
};

export default TextCell;
