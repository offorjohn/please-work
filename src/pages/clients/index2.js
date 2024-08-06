import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import NextLink from "next/link";
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
import { DateTimePicker } from '@mui/x-date-pickers';
import { clientApi } from '../../api/client-api';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { ClientListTable } from '../../components/client/client-list-table';
import { useMounted } from '../../hooks/use-mounted';
import { Download as DownloadIcon } from '../../icons/download';
import { Plus as PlusIcon } from '../../icons/plus';
import { Search as SearchIcon } from '../../icons/search';
import { Upload as UploadIcon } from '../../icons/upload';
import { gtm } from '../../lib/gtm';
import { AuthGuard } from '../../components/authentication/auth-guard';

const tabs = [
  {
    label: 'All',
    value: 'all'
  },
];

const sortOptions = [
  {
    label: 'Date joined (newest)',
    value: 'date_joined|desc'
  },
  {
    label: 'Date joined (oldest)',
    value: 'date_joined|asc'
  },
  {
    label: 'Username (A-Z)',
    value: 'username|desc'
  },
  {
    label: 'Username (Z-A)',
    value: 'username|asc'
  }
];


const applyFilters = (customers, filters) => customers.filter((customer) => {
  /*console.log(filters)
  if (filters.query) {
    let queryMatched = false;
    const properties = ['username','email'];

    properties.forEach((property) => {
      if ((customer[property]).toLowerCase().includes(filters.query.toLowerCase())) {
        queryMatched = true;
      }
    });

    if (!queryMatched) {
      return false;
    }
  }

  if (filters.hasAcceptedMarketing && !customer.hasAcceptedMarketing) {
    return false;
  }

  if (filters.isProspect && !customer.isProspect) {
    return false;
  }

  if (filters.isReturning && !customer.isReturning) {
    return false;
  }

  if(filters.genre!='Todos' && customer.genre!=filters.genre){
    return false
  }

  if(filters.postal_code!='Todos' && customer.postal_code!=filters.postal_code){
    return false
  }

  if(filters.estado!='Todos' && filters.estado!=customer.estado){
    return false
  }*/
  return true;
});

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

const ClientList = () => {
  const isMounted = useMounted();
  const queryRef = useRef(null);
  const [clients, setClients] = useState([])
  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState(sortOptions[0].value);


  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  const getClients = useCallback(async () => {
    try {
      const data = await clientApi.getClients();
      console.log(data)
      if (isMounted()) {
        setClients(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getClients();
  },
  []);


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


  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // Usually query is done on backend with indexing solutions
  const filteredCustomers = applyFilters(clients, {});
  const sortedCustomers = applySort(filteredCustomers, sort);
  const paginatedCustomers = applyPagination(sortedCustomers, page, rowsPerPage);

  return (
    <>
      <Head>
        <title>
          Dashboard: Listado de clientes
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
                  Clientes
                </Typography>
              </Grid>
              <Grid item>
                <NextLink href="/clients/new">
                <Button
                  startIcon={<PlusIcon fontSize="small" />}
                  variant="contained"
                >
                  Añadir
                </Button>
              </NextLink>
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


              {/* ROW 2 */}
              <Grid
              container
              sx={{
                m: '-2.5 -1.5 0 -1.5',
                p: '0 3 1 3'
              }}
              spacing={3}
            >



            </Grid>
            {clients.length ?
              <ClientListTable
                customers={clients}
                customersCount={clients.length}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPage={rowsPerPage}
                page={page}
              /> :<>loaging</>
            }

          </Card>
        </Container>
      </Box>
    </>
  );
};

ClientList.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default ClientList;