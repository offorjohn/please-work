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
import { saleApi } from '../../api/sale-api';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { ProfitsListTable } from '../../components/profit/profit-list-table';
import { useMounted } from '../../hooks/use-mounted';
import { Download as DownloadIcon } from '../../icons/download';
import { Plus as PlusIcon } from '../../icons/plus';
import { Search as SearchIcon } from '../../icons/search';
import { Upload as UploadIcon } from '../../icons/upload';
import { gtm } from '../../lib/gtm';
import { AuthGuard } from '../../components/authentication/auth-guard';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { clientApi } from '../../api/client-api';
const tabs = [
  {
    label: 'All',
    value: 'all'
  }
];

const sortOptions = [
  {
    label: 'Last update (newest)',
    value: 'updated_at|desc'
  },
  {
    label: 'Last update (oldest)',
    value: 'updated_at|asc'
  },
  {
    label: 'Monto (highest)',
    value: 'amount|desc'
  },
  {
    label: 'Monto (lowest)',
    value: 'amount|asc'
  }
];

const applyFilters = (sales, filters) => {
  return sales.filter((sale) => {
    let ret = true;
    let ret2 = true;
    let ret3 = true;
    if (filters.query) {
      const query = filters.query.toLowerCase();
      if (
        sale.name.toLowerCase().includes(query) ||
        sale.type.toLowerCase().includes(query)
      ) {
        ret=true;
      }else ret=false;
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      const saleDate = new Date(sale.created_at);
      if (saleDate >= startDate) {
        ret2 = true;
      }else ret2= false;
    }

    if(filters.endDate){
      const endDate = new Date(filters.endDate);
      const saleDate = new Date(sale.created_at);
      if(saleDate <= endDate){
        ret3=true
      }else ret3=false
    }

    return ret && ret2 && ret3;
  });
};


const descendingComparator = (a, b, sortBy) => {
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

const ProfitList = () => {
  const isMounted = useMounted();
  const queryRef = useRef(null);
  const [sales, setSales] = useState([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [filters, setFilters] = useState({
    query: '',
    hasAcceptedMarketing: undefined,
    isProspect: undefined,
    isReturning: undefined,
    startDate: null,
    endDate:null
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  const getSales = useCallback(async () => {
    try {
      const data = await saleApi.getSales();
      const data_vendedores = await saleApi.getSellers();
      const new_sales = [];

      for (const s of data) {
        // buscar cliente
        const data_client = await clientApi.getClient(s.buyer);
        // buscar empleado
        let vendedor = '';
        for (const v of data_vendedores) {
          if (v.id === s.seller) {
            vendedor = v;
            break;
          }
        }
        s.comprador = data_client.first_name + " " + data_client.last_name;
        s.vendedor = vendedor.username;
        new_sales.push(s);
      }

      if (isMounted()) {
        setSales(new_sales);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);


  useEffect(() => {
      getSales();
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

  const handleQueryChange = (event) => {
    event.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: search
    }));
  };

  const handleSearchChange = (e)=>{
    setSearch(e.target.value)
  }

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleStartDateChange = (date) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      startDate: date
    }));
  };

  const handleEndDateChange = (date) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      endDate: date
    }));
  };

  // Usually query is done on backend with indexing solutions
  useEffect(() => {
    getSales();
  },
  []);
  const filteredCustomers = applyFilters(sales, filters);
  const sortedCustomers = applySort(filteredCustomers, sort);
  const paginatedCustomers = applyPagination(sortedCustomers, page, rowsPerPage);

  return (
    <>
      <Head>
        <title>
          Dashboard: Listado de ingresos
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
                  Ingresos
                </Typography>
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
            <Box sx={{ alignItems: 'center', display: 'flex',flexWrap: 'wrap',m: -1.5, p: 3}}>

              <Box sx={{ m: 1.5 }}>
                <MobileDatePicker
                  label="Desde"
                  inputFormat="dd/MM/yyyy"
                  value={filters.startDate}
                  onChange={handleStartDateChange}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Box>
              <Box sx={{ m: 1.5 }}>
                <MobileDatePicker
                  label="Hasta"
                  inputFormat="dd/MM/yyyy"
                  value={filters.endDate}
                  onChange={handleEndDateChange}
                  renderInput={(params) => <TextField {...params} />}
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
            <ProfitsListTable
              sales={paginatedCustomers}
              salesCount={filteredCustomers.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPage={rowsPerPage}
              page={page}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

ProfitList.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default ProfitList;