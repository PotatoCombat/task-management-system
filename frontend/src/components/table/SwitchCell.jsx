import { forwardRef, useImperativeHandle, useState } from 'react';

import { Switch, TableCell } from '@mui/material';

const SwitchCell = forwardRef(({
  defaultChecked,
  onChange,
  ...props
}, ref) => {
  const [value, setValue] = useState(defaultChecked ? 1 : 0);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
    setValue: setValue,
  }));

  const handleChange = (event) => {
    setValue(event.target.checked);
    onChange?.(event.target.checked);
  };

  return (
    <TableCell className='table-cell'>
      <Switch color='primary' onChange={handleChange} {...props} checked={value} />
    </TableCell>
  );
});

export default SwitchCell;
