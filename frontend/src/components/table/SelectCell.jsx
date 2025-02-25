import { forwardRef, useImperativeHandle, useState } from 'react';

import { MenuItem, Select, TableCell } from '@mui/material';

const SelectCell = forwardRef(({
  options,
  disabledOptions,
  defaultValue,
  multiple,
  onChange,
  ...props
}, ref) => {
  const [value, setValue] = useState(defaultValue ?? (multiple ? [] : '*'));

  useImperativeHandle(ref, () => ({
    getValue: () => value === '*' ? null : value,
    setValue: setValue,
  }));

  const renderText = (selected) => {
    return multiple ? `Selected ${selected.length}` : selected === '*' ? '- - - - -' : selected;
  }

  const handleChange = (event) => {
    setValue(event.target.value);
    onChange?.(event.target.value);
  };

  return (
    <TableCell className='table-cell'>
      <Select
        multiple={multiple}
        renderValue={renderText}
        onChange={handleChange}
        variant='standard'
        fullWidth
        displayEmpty
        disableUnderline
        MenuProps={{ disableAutoFocusItem: true }}
        {...props}
        value={value}
      >
        {!multiple && <MenuItem key={'*'} value={'*'}>- - - - -</MenuItem>}
        {options?.map((option) => (
          <MenuItem key={option} value={option} disabled={disabledOptions?.includes(option)}>{option}</MenuItem>
        ))}
      </Select>
    </TableCell>
  );
});

export default SelectCell;
