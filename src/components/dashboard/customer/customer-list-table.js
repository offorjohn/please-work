import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '../../../icons/arrow-right';
import { PencilAlt as PencilAltIcon } from '../../../icons/pencil-alt';
import { getInitials } from '../../../utils/get-initials';
import { Scrollbar } from '../../scrollbar';

export const CustomerListTable = (props) => {
  const {
    customers,
    customersCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    onSelectedCustomersChange,
    onSignup,
    onSignout,
    onCustomerAssist,
    onRemoveCustomerAssist,
    onCustomerLateCancel,
    onRemoveCustomerLateCancel,
    onMoveToWaitList,
    onRemoveFromWaitlist,
    onSignupToRecurring,
    onRemoveFromRecurring,
    onMoveToWaitListRecurring,
    selCustomers,
    currentEvent,
    onCurrentEventChange,
    currentTab,
    ...other
  } = props;
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // Reset selected customers when customers change
  useEffect(() => {
      if (selectedCustomers.length) {
        setSelectedCustomers([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers]);

  useEffect(() => {
      setSelectedCustomers(selCustomers);
    }, [selCustomers]);

    const handleSelectAllCustomers = (event) => {
      const updatedSelectedCustomers = event.target.checked
        ? customers.map((customer) => customer.id)
        : [];

      setSelectedCustomers(updatedSelectedCustomers);
      onSelectedCustomersChange(updatedSelectedCustomers);
      props.onCurrentEventChange(currentEvent);
    };

    const handleSelectOneCustomer = (event, customerId) => {
      const isSelected = selectedCustomers.includes(customerId);
      let updatedSelectedCustomers;

      if (isSelected) {
        updatedSelectedCustomers = selectedCustomers.filter((id) => id !== customerId);
      } else {
        updatedSelectedCustomers = [...selectedCustomers, customerId];
      }
      setSelectedCustomers(updatedSelectedCustomers);
      onSelectedCustomersChange(updatedSelectedCustomers);
      props.onCurrentEventChange(currentEvent);
    };

    const handleLateCancel = () => {
      onCustomerLateCancel(selectedCustomers)
      toast.success('Clientes añadidos alla lista Late Cancel');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }
    const handleCustomerAssist = () => {
      onCustomerAssist(selectedCustomers)
      toast.success('Clientes añadidos alla lista de asistentes');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }
    const handleRemoveCustomerAssist = () => {
      onRemoveCustomerAssist(selectedCustomers)
      toast.success('Clientes eliminados de la lista de asistentes');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }
    const handleRemoveCustomerLateCancel = () => {
      onRemoveCustomerLateCancel(selectedCustomers)
      toast.success('Clientes eliminados de la lista de asistentes');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }
    const handleSignup = () => {
      onSignup(selectedCustomers)
      toast.success('Clientes añadidos a la clase');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }
    const handleSignout = () => {
      onSignout(selectedCustomers)
      toast.success('Clientes quitados de la clase');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }

    const handleMoveToWaitList = () => {
      onMoveToWaitList(selectedCustomers)
      toast.success('Clientes añadidos a la lista de espera');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }
    const handleRemoveFromWaitlist = () => {
      onRemoveFromWaitlist(selectedCustomers)
      toast.success('Clientes eliminados de la lista de espera');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }

    const handleSignupToRecurring = () => {
      onSignupToRecurring(selectedCustomers)
      toast.success('Clientes añadidos a próximos eventos');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }
    const handleRemoveFromRecurring = () => {
      onRemoveFromRecurring(selectedCustomers)
      toast.success('Clientes eliminados de próximos eventos');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }
    const handleMoveToWaitListRecurring = () => {
      onMoveToWaitListRecurring(selectedCustomers)
      toast.success('Clientes añadidos a la lista de espera de próximos eventos');
      setSelectedCustomers([])
      props.onCurrentEventChange(currentEvent);
    }
    
  const enableBulkActions = selectedCustomers.length > 0;
  const selectedSomeCustomers = selectedCustomers.length > 0
    && selectedCustomers.length < customers.length;
  const selectedAllCustomers = selectedCustomers.length === customers.length;

  return (
    <div {...other}>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark'
            ? 'neutral.800'
            : 'neutral.100',
          display: enableBulkActions ? 'block' : 'none',
          px: 2,
          py: 0.5
        }}
      >
        <Checkbox
          checked={selectedAllCustomers}
          indeterminate={selectedSomeCustomers}
          onChange={handleSelectAllCustomers}
        />
  { currentTab == "all" && (
        <>
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleSignup}
        >
          Apuntar
        </Button>
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleMoveToWaitList}
        >
          Mover a Lista de espera
        </Button>
        </>)}
  { (currentTab == "all" && currentEvent?.recurring_id!="00000000-0000-0000-0000-000000000000") && (
        <>
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleSignupToRecurring}
        >
          Apuntar a todos los próximos eventos
        </Button>
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleRemoveFromRecurring}
        >
          Desapuntar de todos los próximos eventos
        </Button>
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleMoveToWaitListRecurring}
        >
          Apuntar a lista de espera de todos los próximos eventos
        </Button>
        </>)}
  { currentTab == "hasAcceptedMarketing" && (
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleLateCancel}
        >
          Cancelaron tarde
        </Button>)}
  { currentTab == "hasAcceptedMarketing" && (
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleCustomerAssist}
        >
          Asistieron
        </Button>)}
  { currentTab == "hasAcceptedMarketing" && (
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleSignout}
        >
          Desapuntar
        </Button>)}
  { (currentTab == "hasAcceptedMarketing" && currentEvent?.recurring_id!="00000000-0000-0000-0000-000000000000") && (
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleRemoveFromRecurring}
        >
          Desapuntar de todos los próximos eventos
        </Button>
        )}
  
  { currentTab == "isProspect" && (
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleRemoveCustomerAssist}
        >
          Quitar de la lista
        </Button>)}
  { currentTab == "isReturning" && (
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleRemoveCustomerLateCancel}
        >
          Quitar de la lista
        </Button>)}
      { currentTab == "waitlist"  && (
        <>
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleSignup}
        >
          Apuntar
        </Button>
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={handleRemoveFromWaitlist}
        >
          Quitar de lista de espera
        </Button>
      </>)}
      </Box>
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ visibility: enableBulkActions ? 'collapse' : 'visible' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAllCustomers}
                  indeterminate={selectedSomeCustomers}
                  onChange={handleSelectAllCustomers}
                />
              </TableCell>
              <TableCell>
                Nombre
              </TableCell>
              <TableCell>
                Email
              </TableCell>
              <TableCell>
                Bonos restantes
              </TableCell>
              <TableCell>
                Importe bono
              </TableCell>
              <TableCell align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => {
              const isCustomerSelected = selectedCustomers.includes(customer.id);

              return (
                <TableRow
                  hover
                  key={customer.id}
                  selected={isCustomerSelected}
                >
                  <TableCell padding="checkbox">
                  { (currentEvent?.participants?.includes(customer.id) === false || currentTab != "all") &&
                    <Checkbox
                      checked={isCustomerSelected}
                      onChange={(event) => handleSelectOneCustomer(event, customer.id)}
                      value={isCustomerSelected}
                    />
                  }
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      <Avatar
                        src={customer.avatar}
                        sx={{
                          height: 42,
                          width: 42
                        }}
                      >
                        {getInitials(customer.first_name)}
                      </Avatar>
                      <Box sx={{ ml: 1 }}>
                        <NextLink
                          href="/dashboard/customers/1"
                          passHref
                        >
                          <Link
                          color={
                            currentEvent && currentEvent?.assisted_participants?.includes(customer.id)
                              ? 'success.main'
                              : currentEvent && currentEvent?.late_participants?.includes(customer.id)
                              ? 'error.main'
                              : 'textSecondary'
                          }
                            variant="subtitle2"
                          >
                            {customer.first_name}
                          </Link>
                        </NextLink>
                        <Typography
                          color={
                            currentEvent && currentEvent?.assisted_participants?.includes(customer.id)
                              ? 'success.main'
                              : currentEvent && currentEvent?.late_participants?.includes(customer.id)
                              ? 'error.main'
                              : 'textSecondary'
                          }
                          variant="body2"
                        >
                          {customer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                  <Typography
                          color={
                            currentEvent && currentEvent?.assisted_participants?.includes(customer.id)
                              ? 'success.main'
                              : currentEvent && currentEvent?.late_participants?.includes(customer.id)
                              ? 'error.main'
                              : 'textSecondary'
                          }
                        >
                    {`${customer.email}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                  <Typography
                          color={
                            currentEvent && currentEvent?.assisted_participants?.includes(customer.id)
                              ? 'success.main'
                              : currentEvent && currentEvent?.late_participants?.includes(customer.id)
                              ? 'error.main'
                              : 'textSecondary'
                          }
                        >
                    </Typography>
                    {customer.totalOrders}
                  </TableCell>
                  <TableCell>
                    <Typography
                          color={
                            currentEvent && currentEvent?.assisted_participants?.includes(customer.id)
                              ? 'success.main'
                              : currentEvent && currentEvent?.late_participants?.includes(customer.id)
                              ? 'error.main'
                              : 'textSecondary'
                          }
                      variant="subtitle2"
                    >
                      {numeral(customer.totalAmountSpent).format(`${customer.currency}0,0.00`)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <NextLink
                      href="/dashboard/customers/1/edit"
                      passHref
                    >
                      <IconButton component="a">
                        <PencilAltIcon fontSize="small" />
                      </IconButton>
                    </NextLink>
                    <NextLink
                      href="/dashboard/customers/1"
                      passHref
                    >
                      <IconButton component="a">
                        <ArrowRightIcon fontSize="small" />
                      </IconButton>
                    </NextLink>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={customersCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

CustomerListTable.propTypes = {
  customers: PropTypes.array.isRequired,
  customersCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired
};