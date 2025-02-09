const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '50%',
    justifyContent: 'center',
  },
  formGroup: {
    gap: 2,
  },
  formButton: {
    width: '50%',
    margin: '20px auto',
  },
  title: {
    width: '100%',
    padding: '20px 0px',
    fontWeight: 'bold'
  },
  tableContainer: {
    flex: 1,
    overflow: 'auto',
    mb: 4,
    outline: '1px solid black',
  },
  tableOptions: {
    display: 'flex',
    alignItems: 'center',
  },
  tableRow: {
    outline: '1px solid black',
  },
  tableHeadingRow: {
    outline: '1px solid black',
  },
  tableCreateRow: {
    outline: '1px solid black',
    backgroundColor: 'lightgrey',
  },
};

export default styles;
