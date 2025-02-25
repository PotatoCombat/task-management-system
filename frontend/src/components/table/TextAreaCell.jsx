import { styled, TableCell } from '@mui/material';

const TextArea = styled('textarea')(({ theme }) => ({
  width: '100%',
  height: '2.25rem',
  // padding: theme.spacing(1.5),
  resize: 'vertical',
  // borderRadius: theme.shape.borderRadius,
  border: `none`,
  fontFamily: theme.typography.fontFamily, // Apply MUI's default font family
  fontSize: theme.typography.body1.fontSize, // Ensure font size matches theme
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  '&:focus': {
    border: 'none',
    borderWidth: 0,
    // borderColor: theme.palette.primary.main,
    outline: 'none',
  },
  '&::placeholder': {
    color: theme.palette.text.secondary, // Use secondary text color for placeholder
    fontFamily: theme.typography.fontFamily, // Apply MUI's default font family
    fontSize: theme.typography.body1.fontSize, // Use body font size for consistency
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground, // Change background on disable
    color: theme.palette.text.disabled, // Apply disabled text color
    // borderColor: theme.palette.action.disabled, // Adjust border color
    '&::placeholder': {
      color: theme.palette.text.disabled, // Make placeholder text match disabled text color
    },
  },
}));

const TextAreaCell = ({ ...props }) => {
  return (
    <TableCell className='table-cell' >
      <TextArea {...props} />
    </TableCell>
  );
};

export default TextAreaCell;
