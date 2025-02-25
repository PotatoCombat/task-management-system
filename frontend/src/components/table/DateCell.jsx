import { forwardRef, useImperativeHandle, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { TableCell, Input } from '@mui/material';

const DateCell = forwardRef(({
  defaultValue,
  placeholder,
  onChange,
  ...props
}, ref) => {
  const [value, setValue] = useState(defaultValue ?? null);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
    setValue: setValue,
  }));

  const handleChange = (date) => {
    let dateString = null;
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`
    }
    setValue(dateString);
    onChange?.(dateString);
  };

  return (
    <TableCell className='table-cell'>
      <DatePicker customInput={<Input disableUnderline autoComplete='new-password' />} dateFormat="yyyy-MM-dd" placeholderText={placeholder} onChange={handleChange} {...props} selected={value} />
    </TableCell>
  );
});

export default DateCell;
