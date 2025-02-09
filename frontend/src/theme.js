import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  typography: {
    h3: {
      fontWeight: 600, // Increase the weight to make it bolder
    },
  },
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    text: {
      primary: '#000', // Text color for normal text
      disabled: '#BBB', // Global disabled text color (light grey or any color you prefer)
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          '&.table-cell': {
            // verticalAlign: 'top',
            padding: 0,
            border: `1px solid black`,
            '& .MuiInputBase-root': {
              display: 'flex',
            },
            '& .MuiTypography-root, & .MuiInputBase-input': {
              display: 'block',
              padding: '4px 8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            },
            '&:focus-within': {
              outline: `2px solid #556cd6`,
            },
          }
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent', // Default background
          '&:hover': {
            backgroundColor: 'lightgrey', // Hover effect
          },
          '&:focus': {
            outline: '2px solid #556cd6', // Hover effect
            zIndex: 10,
          },
          '&.Mui-selected': {
            backgroundColor: '#89bbfe', // Selected item color
            '&:hover': {
              backgroundColor: '#6f8ab7', // Hover when selected
            },
            '&:focus': {
              backgroundColor: '#6f8ab7',
            },
          }
        },
      },
    },
  },
});

export default theme;
