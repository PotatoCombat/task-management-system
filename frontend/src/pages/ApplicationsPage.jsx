import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Box,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

import api from '@/api';
import { ButtonCell, DateCell, HeadingCell, SelectCell, TextAreaCell, TextCell } from '@/components';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';

import styles from './styles';


const firstRow = '*';

const ApplicationsPage = () => {
  const { isProjectLead } = useAuth();

  const [applications, setApplications] = useState(undefined);
  const [groupNames, setGroupNames] = useState(undefined);

  const refs = useRef(new Map());

  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchApplications();
    fetchGroups();
  }, []);

  async function fetchApplications() {
    try {
      const response = await api.getAllApplications();
      setApplications(response.data);
    } catch (error) {
      showError(error);
    }
  }

  async function fetchGroups() {
    try {
      const response = await api.getAllGroups();
      setGroupNames(response.data);
    } catch (error) {
      showError(error);
    }
  }

  const createApplication = async () => {
    try {
      const response = await api.createApplication(getRow());
      await fetchApplications();
      clearRow();
      showSuccess(`Created application: ${response.data.acronym}`);
    } catch (error) {
      showError(error);
    }
  }

  const updateApplication = async (row) => {
    try {
      await api.updateApplication(getRow(row));
      await fetchApplications();
      showSuccess(`Updated application: ${row}`);
    } catch (error) {
      console.log(getRow(row));
      showError(error);
    }
  }

  function getRowIds(row = firstRow) {
    return {
      acronym: `${row}-acronym`,
      rNumber: `${row}-rNumber`,
      description: `${row}-description`,
      startDate: `${row}-startDate`,
      endDate: `${row}-endDate`,
      permitCreate: `${row}-permitCreate`,
      permitOpen: `${row}-permitOpen`,
      permitToDo: `${row}-permitToDo`,
      permitDoing: `${row}-permitDoing`,
      permitDone: `${row}-permitDone`,
    };
  }

  function getRow(row) {
    const rowIds = getRowIds(row ?? firstRow);

    return {
      acronym: row ?? refs.current.get(rowIds.acronym).value,
      rNumber: refs.current.get(rowIds.rNumber).value,
      description: refs.current.get(rowIds.description).value,
      startDate: refs.current.get(rowIds.startDate).getValue(),
      endDate: refs.current.get(rowIds.endDate).getValue(),
      permitCreate: refs.current.get(rowIds.permitCreate).getValue(),
      permitOpen: refs.current.get(rowIds.permitOpen).getValue(),
      permitToDo: refs.current.get(rowIds.permitToDo).getValue(),
      permitDoing: refs.current.get(rowIds.permitDoing).getValue(),
      permitDone: refs.current.get(rowIds.permitDone).getValue(),
    };
  }

  function clearRow(row = firstRow) {
    const rowIds = getRowIds(row);

    refs.current.get(rowIds.acronym).value = '';
    refs.current.get(rowIds.rNumber).value = '';
    refs.current.get(rowIds.description).value = '';
  }

  function renderHeadings() {
    return (
      <TableRow sx={{}}>
        <HeadingCell value='Acronym' sx={{width: '300px'}}/>
        <HeadingCell value='R .Num' sx={{width: '150px'}}/>
        <HeadingCell value='Description' sx={{width: '300px'}}/>
        <HeadingCell value='Start Date' sx={{width: '150px'}}/>
        <HeadingCell value='End Date' sx={{width: '150px'}}/>
        <HeadingCell value='Permit Create' sx={{width: '150px'}}/>
        <HeadingCell value='Permit Open' sx={{width: '150px'}} />
        <HeadingCell value='Permit To-Do' sx={{width: '150px'}}/>
        <HeadingCell value='Permit Doing' sx={{width: '150px'}} />
        <HeadingCell value='Permit Done'sx={{width: '150px'}} />
        {isProjectLead() && <HeadingCell value='Actions' sx={{width: '150px'}} />}
      </TableRow>
    );
  }

  function renderCreateRow() {
    const rowIds = getRowIds();

    return (
      <TableRow key={firstRow} sx={styles.tableCreateRow}>
        <TextCell
          inputRef={(el) => (refs.current.set(rowIds.acronym, el))}
          placeholder='Enter acronym'
        />
        <TextCell
          inputRef={(el) => (refs.current.set(rowIds.rNumber, el))}
          placeholder='Enter number'
          type='number'
        />
        <TextAreaCell
          ref={(el) => (refs.current.set(rowIds.description, el))}
          placeholder='Enter description'
          minRows={5}
        />
        <DateCell
          ref={(el) => (refs.current.set(rowIds.startDate, el))}
          placeholder='Enter yyyy-mm-dd'
        />
        <DateCell
          ref={(el) => (refs.current.set(rowIds.endDate, el))}
          placeholder='Enter yyyy-mm-dd'
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitCreate, el))}
          defaultValue={null}
          options={groupNames}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitOpen, el))}
          defaultValue={null}
          options={groupNames}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitToDo, el))}
          defaultValue={null}
          options={groupNames}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitDoing, el))}
          defaultValue={null}
          options={groupNames}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitDone, el))}
          defaultValue={null}
          options={groupNames}
        />
        <ButtonCell label='Create' onClick={() => createApplication()} />
      </TableRow>
    );
  }

  function renderRow({ acronym, rNumber, description, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone }) {
    const rowIds = getRowIds(acronym);

    return (
      <TableRow key={acronym} sx={styles.tableRow}>
        <ButtonCell component={Link} to={`/apps/${acronym}`} label={acronym} />
        <TextCell
          inputRef={(el) => (refs.current.set(rowIds.rNumber, el))}
          defaultValue={rNumber}
          readOnly
          type='number'
        />
        <TextAreaCell
          ref={(el) => (refs.current.set(rowIds.description, el))}
          defaultValue={description}
          readOnly = {!isProjectLead()}
          minRows={5}
        />
        <DateCell
          ref={(el) => (refs.current.set(rowIds.startDate, el))}
          defaultValue={startDate}
          readOnly = {!isProjectLead()}
        />
        <DateCell
          ref={(el) => (refs.current.set(rowIds.endDate, el))}
          defaultValue={endDate}
          readOnly = {!isProjectLead()}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitCreate, el))}
          defaultValue={permitCreate}
          readOnly = {!isProjectLead()}
          options={groupNames}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitOpen, el))}
          defaultValue={permitOpen}
          readOnly = {!isProjectLead()}
          options={groupNames}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitToDo, el))}
          defaultValue={permitToDo}
          readOnly = {!isProjectLead()}
          options={groupNames}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitDoing, el))}
          defaultValue={permitDoing}
          readOnly = {!isProjectLead()}
          options={groupNames}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.permitDone, el))}
          defaultValue={permitDone}
          readOnly = {!isProjectLead()}
          options={groupNames}
        />
        {isProjectLead() && <ButtonCell label='Update' onClick={() => updateApplication(acronym)} />}
      </TableRow>
    );
  }

  if (applications === undefined || groupNames === undefined) {
    return null;
  };

  return (
    <Box sx={{ ...styles.container, overflow: 'auto' }}>
      <Typography variant='h4' align='left' sx={styles.title}>Applications</Typography>
      {/* User Table */}
      <TableContainer sx={{display: 'block'}}>
        <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            {renderHeadings()}
          </TableHead>
          <TableBody>
            {isProjectLead() && renderCreateRow()}
            {applications.map(renderRow)}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ApplicationsPage;
