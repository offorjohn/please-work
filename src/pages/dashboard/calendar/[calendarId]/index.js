import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { calendarApi } from '../../../../api/calendar-api';
import { customerApi } from '../../../../api/customer-api';
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import { CustomerListTable } from '../../../../components/dashboard/customer/customer-list-table';
import { useMounted } from '../../../../hooks/use-mounted';
import { Download as DownloadIcon } from '../../../../icons/download';
import { Plus as PlusIcon } from '../../../../icons/plus';
import { Search as SearchIcon } from '../../../../icons/search';
import { Upload as UploadIcon } from '../../../../icons/upload';
import { gtm } from '../../../../lib/gtm';
import { useDispatch, useSelector } from '../../../../store';
import { getEvents, updateEvent, getEvent } from '../../../../thunks/calendar';

const tabs = [
  {
    label: 'Todos los clientes',
    value: 'all'
  },
  {
    label: 'Inscritos',
    value: 'hasAcceptedMarketing'
  },
  {
    label: 'Asistieron',
    value: 'isProspect'
  },
  {
    label: 'Late Cancel',
    value: 'isReturning'
  },
  {
    label:'Lista de espera',
    value:'waitlist'
  }
];

const sortOptions = [
  {
    label: 'Last update (newest)',
    value: 'updatedAt|desc'
  },
  {
    label: 'Last update (oldest)',
    value: 'updatedAt|asc'
  },
  {
    label: 'Total orders (highest)',
    value: 'totalOrders|desc'
  },
  {
    label: 'Total orders (lowest)',
    value: 'totalOrders|asc'
  }
];

// const applyFilters = (customers, filters, booked) => customers.filter((customer) => {
//   if (filters.query) {
//     let queryMatched = false;
//     const properties = ['email', 'name'];

//     properties.forEach((property) => {
//       if ((customer[property]).toLowerCase().includes(filters.query.toLowerCase())) {
//         queryMatched = true;
//       }
//     });

//     if (!queryMatched) {
//       return false;
//     }
//   }

//   if (filters.hasAcceptedMarketing && !(booked.includes(customer.id))) {
//     return false;
//   }

//   if (filters.isProspect && !customer.isProspect) {
//     return false;
//   }

//   if (filters.isReturning && !customer.isReturning) {
//     return false;
//   }

//   return true;
// });

//TODO: NO FUNCIONA LA TAB CUANDO QUIERO VER SOLO LOS CLIENTES FILTRADOS POR EL CURRENTEVENT (PARECE QUE EL CURRENT EVENT QUE SE PASA A LA FUNCION APPLY FILTERS NO CONTIENE LOS CUSTOMERS ACTUALIZADOS)

const descendingComparator = (a, b, sortBy) => {
  // When compared to something undefined, always returns false.
  // This means that if a field does not exist from either element ('a' or 'b') the return will be 0.

  if (b[sortBy] < a[sortBy]) {
    return -1;
  }

  if (b[sortBy] > a[sortBy]) {
    return 1;
  }

  return 0;
};

const getComparator = (sortDir, sortBy) => (sortDir === 'desc'
  ? (a, b) => descendingComparator(a, b, sortBy)
  : (a, b) => -descendingComparator(a, b, sortBy));

const applySort = (customers, sort) => {
  const [sortBy, sortDir] = sort.split('|');
  const comparator = getComparator(sortDir, sortBy);
  const stabilizedThis = customers.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const newOrder = comparator(a[0], b[0]);

    if (newOrder !== 0) {
      return newOrder;
    }

    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
};

const applyPagination = (customers, page, rowsPerPage) => customers.slice(page * rowsPerPage,
  page * rowsPerPage + rowsPerPage);

const CustomerList = (props) => {
  const isMounted = useMounted();
  const queryRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [selCustomers, setSelCustomers] = useState([]);
  const dispatch = useDispatch();
  const { event } = useSelector((state) => state.calendar);
  const [currentEvent, setCurrentEvent] = useState(null)
  const [paginatedCustomers, setPaginatedCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const {calendarId} = props

  const [filters, setFilters] = useState({
    query: '',
    hasAcceptedMarketing: undefined,
    isProspect: undefined,
    isReturning: undefined
  });


  const applyFilters = (customers, filters) => customers.filter((customer) => {
    if (filters.query) {
      let queryMatched = false;
      const properties = ['email', 'first_name', 'last_name'];

      properties.forEach((property) => {
        if ((customer[property]).toLowerCase().includes(filters.query.toLowerCase())) {
          queryMatched = true;
        }
      });

      if (!queryMatched) {
        return false;
      }
    }

    if (filters.hasAcceptedMarketing && !(currentEvent?.participants?.includes(customer.id))) {
      return false;
    }

    if (filters.isProspect && !currentEvent?.assisted_participants?.includes(customer.id)) {
      return false;
    }

    if (filters.isReturning && !currentEvent?.late_participants?.includes(customer.id)) {
      return false;
    }

    if(currentTab=='waitlist' && !currentEvent?.waitlist_participants?.includes(customer.id)){
        return false
    }

    return true;
  });
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  const getEvent = useCallback(async () => {
    try {
      const data = await calendarApi.getEvent(calendarId);
      // call API to set the requested activity

      if (isMounted()) {
        setCurrentEvent(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted,calendarId]);

  useEffect(() => {
    getEvent(calendarId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  const getCustomers = useCallback(async () => {
    try {
      const data = await customerApi.getCustomers();

      if (isMounted()) {
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
      getCustomers();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
  // useEffect(() => {
  //     dispatch(getEvents());
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   []);

  // useEffect((calendarId) => {
  //     dispatch(getEvent(calendarId));
  //       console.log(event)
  //     },
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     []);

  // const getEvent = useCallback(async (calendarId) => {
  //   try {
  //     const data = await calendarApi.getEvent(calendarId);
  //     setCurrentEvent(data)
  //     console.log(data)
  //     console.log(currentEvent)

  //     // call API to set the requested activity

  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [currentEvent,setCurrentEvent]);



  const handleTabsChange = (event, value) => {
    const updatedFilters = {
      ...filters,
      hasAcceptedMarketing: undefined,
      isProspect: undefined,
      isReturning: undefined
    };

    if (value !== 'all') {
      updatedFilters[value] = true;
    }

    setFilters(updatedFilters);
    setCurrentTab(value);
  };

  const handleQueryChange = (event) => {
    event.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value
    }));
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };


  const handleCurrentEventChange = (updatedEvent) => {
    setCurrentEvent(updatedEvent);
  };

  const handleSelectedCustomersChange = useCallback((selectedCustomers) => {
    setSelCustomers(selectedCustomers);
  }, []);

  const handleSignup = useCallback(async (selectedCustomers) => {
    await calendarApi.addCustomersToEvent({
      eventId: calendarId,
      customers:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent((currentEvent) => event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);

  const handleSignout = useCallback(async (selectedCustomers) => {
    await calendarApi.removeCustomersFromEvent({
      eventId: calendarId,
      customers:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent(event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);

  const handleCustomerAssist = useCallback(async (selectedCustomers) => {
    await calendarApi.addAssistCustomersToEvent({
      eventId: calendarId,
      customers_ok:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent(event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);

  const handleRemoveCustomerAssist = useCallback(async (selectedCustomers) => {
    await calendarApi.removeAssistCustomersToEvent({
      eventId: calendarId,
      customers_ok:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent(event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);

  const handleCustomerLateCancel = useCallback(async (selectedCustomers) => {
    await calendarApi.addLateCustomersToEvent({
      eventId: calendarId,
      customers_late:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent(event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);

  const handleRemoveCustomerLateCancel = useCallback(async (selectedCustomers) => {
    await calendarApi.removeLateCustomersToEvent({
      eventId: calendarId,
      customers_late:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent(event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);

  const handleMoveToWaitList = useCallback(async (selectedCustomers) => {
    await calendarApi.addAccountsToEventWaitList({
      eventId: calendarId,
      participants:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent((currentEvent) => event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);
  const handleRemoveFromWaitlist = useCallback(async (selectedCustomers) => {
    await calendarApi.removeAccountsFromEventWaitList({
      eventId: calendarId,
      participants:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent(event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);

  const handleSignupToRecurring = useCallback(async (selectedCustomers) => {
    await calendarApi.addToRecurringEvent({
      eventId: calendarId,
      participants:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent((currentEvent) => event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);
  const handleRemoveFromRecurring = useCallback(async (selectedCustomers) => {
    await calendarApi.removeFromRecurringEvent({
      eventId: calendarId,
      participants:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent(event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);
  const handleMoveToWaitListRecurring = useCallback(async (selectedCustomers) => {
    await calendarApi.addToRecurringEventWaitList({
      eventId: calendarId,
      participants:  [...new Set([...selectedCustomers])]
      })
      const event= await calendarApi.getEvent(calendarId);
      setCurrentEvent((currentEvent) => event)
    setSelCustomers(selectedCustomers);
  }, [calendarId, ]);
  

  const addCustomerHandler = async () => {
    try {
      // await dispatch(updateEvent({
      //   eventId: calendarId,
      //   update: {
      //     customers:  [...new Set([...selCustomers])] //TODO: modificar para no borrar los clientes que ya están apuntados
      //   }
      // }));
      await calendarApi.updateEvent({
        eventId: calendarId,
        update: {
          customers:  [...new Set([...selCustomers])]
        }
      })
      const updatedEventData = await calendarApi.getEvent(calendarId);
      setCurrentEvent(updatedEventData);
      const filtered = applyFilters(customers, filters, currentEvent.customers);
      const sorted = applySort(filtered, sort);
      const paginated = applyPagination(sorted, page, rowsPerPage);
      setFilteredCustomers(sorted);
      setPaginatedCustomers(paginated);
    } catch (err) {
      console.error(err);
    }
  };

  // Usually query is done on backend with indexing solutions


  useEffect(() => {
    if (currentEvent) {
      const filtered = applyFilters(customers, filters);
      const sorted = applySort(filtered, sort);
      const paginated = applyPagination(sorted, page, rowsPerPage);

      setFilteredCustomers(sorted);
      setPaginatedCustomers(paginated);
    }
  }, [currentEvent, customers, filters, sort, page, rowsPerPage]);

  return (
    <>
      <Head>
        <title>
          Dashboard: Customer List | Material Kit Pro
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid
              container
              justifyContent="space-between"
              spacing={3}
            >
              <Grid item>
                <Typography variant="h4">
                {currentEvent ? currentEvent.title : "nada"}
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  startIcon={<PlusIcon fontSize="small" />}
                  variant="contained"
                  onClick={addCustomerHandler}
                >
                  Añadir clientes
                </Button>
              </Grid>
            </Grid>
            <Box
              sx={{
                m: -1,
                mt: 3
              }}
            >
              <Button
                startIcon={<UploadIcon fontSize="small" />}
                sx={{ m: 1 }}
              >
                Import
              </Button>
              <Button
                startIcon={<DownloadIcon fontSize="small" />}
                sx={{ m: 1 }}
              >
                Export
              </Button>
            </Box>
          </Box>
          <Card>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              sx={{ px: 3 }}
              textColor="primary"
              value={currentTab}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                />
              ))}
            </Tabs>
            <Divider />
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'wrap',
                m: -1.5,
                p: 3
              }}
            >
              <Box
                component="form"
                onSubmit={handleQueryChange}
                sx={{
                  flexGrow: 1,
                  m: 1.5
                }}
              >
                <TextField
                  defaultValue=""
                  fullWidth
                  inputProps={{ ref: queryRef }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  placeholder="Search customers"
                />
              </Box>
              <TextField
                label="Sort By"
                name="sort"
                onChange={handleSortChange}
                select
                SelectProps={{ native: true }}
                sx={{ m: 1.5 }}
                value={sort}
              >
                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Box>
            <CustomerListTable
              customers={paginatedCustomers}
              customersCount={filteredCustomers.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPage={rowsPerPage}
              page={page}
              currentTab={currentTab} // Pass currentTab
              currentEvent={currentEvent} // Pass currentEvent
              onSelectedCustomersChange={handleSelectedCustomersChange} // Pass the function to handle selected customers change
              onSignup={handleSignup}
              onSignout={handleSignout}
              onCustomerAssist={handleCustomerAssist}
              onRemoveCustomerAssist={handleRemoveCustomerAssist}
              onCustomerLateCancel={handleCustomerLateCancel}
              onRemoveCustomerLateCancel={handleRemoveCustomerLateCancel}
              onMoveToWaitList={handleMoveToWaitList}
              onRemoveFromWaitlist={handleRemoveFromWaitlist}
              onSignupToRecurring={handleSignupToRecurring}
              onRemoveFromRecurring={handleRemoveFromRecurring}
              onMoveToWaitListRecurring={handleMoveToWaitListRecurring}
              selCustomers={selCustomers}
              onCurrentEventChange={handleCurrentEventChange}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

CustomerList.getLayout = (page) => (
    <DashboardLayout>
      {page}
    </DashboardLayout>
);

export default CustomerList;

export async function getServerSideProps(ctx) {
  const { calendarId } = ctx.query;
  return {
    props: {
      calendarId,
    },
  };
}

