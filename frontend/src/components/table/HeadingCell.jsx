import { TableCell, Typography } from '@mui/material';

const HeadingCell = ({
  value
}) => {
  return (
    <TableCell className='table-cell'>
      <Typography fontWeight={'bold'}>{value}</Typography>
    </TableCell>
  );
};

export default HeadingCell;
