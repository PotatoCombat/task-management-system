import { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import api from '@/api';
import {
  ButtonCell,
  HeadingCell,
  SelectCell,
  SwitchCell,
  TextCell
} from '@/components';
import config from '@/config';
import useAlert from '@/hooks/useAlert';
import styles from './styles';

const createRowId = '*';

const UsersPage = () => {
  const [users, setUsers] = useState(null);
  const [groupNames, setGroupNames] = useState([]);

  const { alert, showSuccess, showError } = useAlert();
  const [group, setGroup] = useState('');

  const refs = useRef(new Map());

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  async function fetchUsers() {
    try {
      const response = await api.getAllUsers();
      setUsers(response.data);
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

  const handleCreateGroup = async () => {
    try {
      const response = await api.createGroup({ group });
      await fetchGroups();
      setGroup('');
      showSuccess(`Created group: ${response.data.group}`);
    } catch (error) {
      showError(error);
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await api.createUser(getRow());
      await fetchUsers();
      clearRow();
      showSuccess(`Created user: ${response.data.username}`);
    } catch (error) {
      showError(error);
    }
  }

  const handleUpdateUser = async (username) => {
    try {
      await api.updateUser(getRow(username));
      await fetchUsers();
      reloadRow(username);
      showSuccess(`Updated user: ${username}`);
    } catch (error) {
      showError(error);
    }
  }

  function getRowIds(username = createRowId) {
    return {
      username: `${username}-username`,
      password: `${username}-password`,
      email: `${username}-email`,
      groups: `${username}-groups`,
      enabled: `${username}-enabled`,
    };
  }

  function getRow(username = createRowId) {
    const rowIds = getRowIds(username);

    return {
      username: refs.current.get(rowIds.username).value,
      password: refs.current.get(rowIds.password).value,
      email: refs.current.get(rowIds.email).value,
      groups: refs.current.get(rowIds.groups).getValue(),
      enabled: refs.current.get(rowIds.enabled).getValue(),
    }
  }

  function clearRow(username = createRowId) {
    const rowIds = getRowIds(username);

    refs.current.get(rowIds.username).value = '';
    refs.current.get(rowIds.password).value = '';
    refs.current.get(rowIds.email).value = '';
  }

  function reloadRow(username = createRowId) {
    const rowIds = getRowIds(username);

    refs.current.get(rowIds.password).value = '';
  }

  function renderHeadings() {
    return (
      <TableRow sx={styles.headingRow}>
        <HeadingCell value='Username' />
        <HeadingCell value='Password' />
        <HeadingCell value='Email' />
        <HeadingCell value='Groups' />
        <HeadingCell value='Account status' />
        <HeadingCell value='Actions' />
      </TableRow>
    );
  }

  function renderCreateRow() {
    const rowIds = getRowIds();

    return (
      <TableRow key={createRowId} sx={styles.tableCreateRow}>
        <TextCell
          inputRef={(el) => (refs.current.set(rowIds.username, el))}
          placeholder='Enter username'
        />
        <TextCell
          inputRef={(el) => (refs.current.set(rowIds.password, el))}
          placeholder='Enter password'
          type='password'
        />
        <TextCell
          inputRef={(el) => (refs.current.set(rowIds.email, el))}
          placeholder='Enter email'
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.groups, el))}
          defaultValue={[]}
          options={groupNames}
          multiple
        />
        <SwitchCell
          ref={(el) => (refs.current.set(rowIds.enabled, el))}
          defaultChecked
        />
        <ButtonCell label='Create' onClick={handleCreateUser} />
      </TableRow>
    );
  }

  function renderRow({ username, email, enabled, groups }) {
    const rowIds = getRowIds(username);

    return (
      <TableRow key={username} sx={styles.tableRow}>
        <TextCell
          inputRef={(el) => (refs.current.set(rowIds.username, el))}
          defaultValue={username}
          readOnly
        />
        <TextCell
          inputRef={(el) => (refs.current.set(rowIds.password, el))}
          defaultValue=''
          type='password'
          placeholder='Change password'
        />
        <TextCell
          inputRef={(el) => (refs.current.set(rowIds.email, el))}
          defaultValue={email}
        />
        <SelectCell
          ref={(el) => (refs.current.set(rowIds.groups, el))}
          defaultValue={groups}
          options={groupNames}
          disabledOptions={username === config.accounts.admin ? [config.accounts.admin] : undefined}
          multiple
        />
        <SwitchCell
          ref={(el) => (refs.current.set(rowIds.enabled, el))}
          defaultChecked={enabled}
          disabled={username === config.accounts.admin}
        />
        <ButtonCell label='Update' onClick={() => handleUpdateUser(username)} />
      </TableRow>
    );
  }

  if (!users) {
    return null;
  };

  return (
    <Container maxWidth={false} sx={styles.container}>
      <Typography variant='h4' align='left' sx={styles.title}>Users</Typography>
      <Box sx={styles.tableOptions}>
        <Alert severity={alert.severity} sx={{ flex: 1, visibility: alert.visible }}>{alert.message}</Alert>
        {/* Group Creation */}
        <TextField
          label='Group name'
          variant='standard'
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          sx={{ width: '27%', ml: 8 }}
        />
        <Button variant='contained' onClick={handleCreateGroup}>Create</Button>
      </Box>

      {/* User Table */}
      <TableContainer sx={styles.tableContainer}>
        <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            {renderHeadings()}
          </TableHead>
          <TableBody>
            {renderCreateRow()}
            {users.map(renderRow)}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UsersPage;
