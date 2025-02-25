import { TableCell, Typography } from '@mui/material';

const HeadingCell = ({
  value,
  sx,
}) => {
  return (
    <TableCell className='table-cell' sx={sx}>
      <Typography fontWeight={'bold'}>{value}</Typography>
    </TableCell>
  );
};

export default HeadingCell;
