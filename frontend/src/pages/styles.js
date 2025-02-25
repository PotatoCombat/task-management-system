const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  formContainer: {
    width: '50%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 'auto',
    margin: 'auto',
  },
  formGroup: {
    gap: 2,
  },
  formButton: {
    width: '50%',
    margin: '20px auto',
  },
  title: {
    align: 'left',
    padding: '10px 0px',
    fontWeight: 'bold'
  },
  tableContainer: {
    flex: 1,
    overflow: 'auto',
    mb: 4,
  },
  tableOptions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  tableStickyCell: { position: 'sticky', left: 0, background: 'green', width: '200px', zIndex: 1 }
};

export default styles;
