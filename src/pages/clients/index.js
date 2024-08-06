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
import { productApi } from '../../api/product-api';
import { subscriptionApi } from '../../api/subscription-api';
import { voucherApi } from '../../api/voucher-api';
import { serviceApi } from '../../api/service-api';

/* Esto muestra la Lista de Clientes en la URL /clients.
*
* Voy a agregar una funcionalidad aquí para poder enviar emails por Mailrelay usando una API que tengo en la web app
* en Django.
* */

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

const genreOptions = [
  {
    label: 'Todos',
    value: 'Todos'
  },
  {
    label: 'Masculino',
    value: 'M'
  },
  {
    label: 'Femenino',
    value: 'F'
  },
  {
    label: 'Otro',
    value: 'X'
  }
  
];

const estadoOptions = [
  {
    label: 'Todos',
    value: 'Todos'
  },
  {
    label: 'Activos',
    value: '1'
  },
  {
    label: 'De Baja',
    value: '0'
  },
  {
    label: 'De Excedencia',
    value: '2'
  }
  
];

const applyFilters = (customers, filters) => customers.filter((customer) => {
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

  if(filters.estado!='Todos' && (filters.estado!=customer.subscription_status && filters.estado!=customer.voucher_status)){
    return false
  }
  if(filters.product!='Todos' && !customer.products?.includes(parseInt(filters.product))){
    return false
  }
  if(filters.voucher!='Todos' && !customer.vouchers?.includes(parseInt(filters.voucher))){
    return false
  }
  if(filters.service!='Todos' && !customer.services?.includes(parseInt(filters.service))){
    return false
  }
  if(filters.subscription!='Todos' && !customer.subscriptions?.includes(parseInt(filters.subscription))){
    return false
  }
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
  const [genre, setGenre] = useState(genreOptions[0].value);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState( new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
  const [filters, setFilters] = useState({
    query: '',
    hasAcceptedMarketing: undefined,
    isProspect: undefined,
    isReturning: undefined,
    genre:'Todos',
    postal_code:'Todos',
    estado: 'Todos',
    product:'Todos',
    subscription:'Todos',
    voucher:'Todos',
    service:'Todos'
  });
  const [search, setSearch] = useState('')
  const [postalCodesOptions, setPostalCodesOptions] = useState(['Todos'])
  const [products,setProducts ] = useState([])
  const [services,setServices ] = useState([])
  const [vouchers,setVouchers ] = useState([])
  const [subscriptions,setSubscriptions ] = useState([])

  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  const getClients = useCallback(async () => {
    try {
      const data = await clientApi.getClients();
      if (isMounted()) {
        setClients(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  const getProducts = useCallback(async () => {
    try {
      const data = await productApi.getProducts();
      if (isMounted()) {
        setProducts(data.filter(producto => producto.is_active));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);
  const getSubscriptions= useCallback(async () => {
    try {
      const data = await subscriptionApi.getSubscriptions();
      if (isMounted()) {
        setSubscriptions(data.filter(e=>e.price_id_stripe!==null && e.is_active));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);
  const getVouchers= useCallback(async () => {
    try {
      const data = await voucherApi.getVouchers();
      if (isMounted()) {
        setVouchers(data.filter(voucher => voucher.is_active));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);
  const getServices = useCallback(async () => {
    try {
      const data = await serviceApi.getServices();
      if (isMounted()) {
        setServices(data.filter(service => service.is_active));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);
  
  useEffect(() => {
    getClients();
    getProducts();
    getSubscriptions();
    getVouchers()
    getServices()
  },
  []);

 
  
  useEffect(() => {
      if(clients.length){
        let pcs =['Todos'];
        clients.map(e=>{
          if(e && e.postal_code && !pcs.includes(e.postal_code)) pcs.push(e.postal_code)
        })
      setPostalCodesOptions(pcs)
      }
    },[clients]);

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
      query: search,
    }));
  };

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
    setFilters((prevState) => ({
      ...prevState,
      genre: event.target.value,
    }));
  };
  const handleEstadoChange = (event) => {
    setFilters((prevState) => ({
      ...prevState,
      estado: event.target.value,
    }));
    };
  const handlePostalCodeChange = (event) => {
    setFilters((prevState) => ({
      ...prevState,
      postal_code: event.target.value,
    }));
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handleSearchChange = (e)=>{
    setSearch(e.target.value)
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // Usually query is done on backend with indexing solutions
  
  const filteredCustomers = applyFilters(clients, filters);
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
              {/* Botón para Crear a un Nuevo Cliente ("Añadir") */}
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
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'wrap',
                m: '-1.5 1.5 0 1.5',
                p: '3 3 0 3'
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
                  onChange={handleSearchChange}
                  placeholder="Buscar clientes"
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
            <Grid
              container
              sx={{
                m: '-2.5 -1.5 0 1.5',
                p: '0 3 1 3'
              }}
              spacing={3}
            >
              <Grid
                item
                md={2}
                xs={12}
              >
                 <TextField
                  label="Género"
                  name="genre"
                  onChange={handleGenreChange}
                  select
                  SelectProps={{ native: true }}
                  sx={{ m: 1.5, width:'100%' }}
                  value={genre}
                >
                  {genreOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid
                item
                md={2}
                xs={12}
              >
                <TextField
                  label="Código postal"
                  name="postal_code"
                  onChange={handlePostalCodeChange}
                  select
                  SelectProps={{ native: true }}
                  sx={{ m: 1.5,width:'100%' }}
                  //value={genre}
                >
                  {postalCodesOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid
                item
                md={2}
                xs={12}
              >
                <TextField
                  label="Estado"
                  name="postal_code"
                  onChange={handleEstadoChange}
                  select
                  SelectProps={{ native: true }}
                  sx={{ m: 1.5,width:'100%' }}
                  //value={genre}
                >
                  {estadoOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </TextField>

              </Grid>
              <Grid
                item
                md={2}
                xs={12}
              >
                <DateTimePicker
                  label="Fecha desde"
                  onChange={(e) => { setStartDate(e.target.value)}}
                  renderInput={(inputProps) => (
                    <TextField
                      fullWidth
                      sx={{ m: 1.5,width:'100%' }}
                      {...inputProps} />
                  )}
                  
                  value={startDate}
                />
              </Grid>
              <Grid
                item
                md={2}
                xs={12}
              >
                <DateTimePicker
                  label="Fecha hasta"
                  onChange={(e) => {setEndDate(e.target.value) }}
                  renderInput={(inputProps) => (
                    <TextField
                      fullWidth
                      sx={{ m: 1.5,width:'100%' }}
                      {...inputProps} />
                  )}
                  
                  value={endDate}
                />
              </Grid>
            </Grid>
              {/* ROW 2 */}
              <Grid
                container
                sx={{
                  m: '-2.5 -1.5 0 1.5',
                  p: '0 3 1 3'
                }}
                spacing={3}
              >

              <Grid
                item
                md={3}
                xs={12}
              
              >
                <TextField
                  label="Tipo de producto"
                  name="product"
                  onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                  select
                  SelectProps={{ native: true }}
                  sx={{ my: 1.5,width:'100%',px:1.5}}
                >
                  <option>Todos</option>
                  {products.map((option) => (
                    <option
                      key={option.id}
                      value={option.id}
                    >
                      {option.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <TextField
                  label="Tipo de bono"
                  name="postal_code"
                  onChange={(e) => setFilters({ ...filters, voucher: e.target.value })}
                  select
                  SelectProps={{ native: true }}
                  sx={{ my: 1.5,width:'100%' ,px:1.5}}
                >
                  <option>Todos</option>
                  {vouchers.map((option) => (
                    <option
                      key={option.id}
                      value={option.id}
                    >
                      {option.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <TextField
                  label="Tipo de cuota"
                  name="subscription"
                  onChange={(e) => setFilters({ ...filters, subscription: e.target.value })}
                  select
                  SelectProps={{ native: true }}
                  sx={{ my: 1.5,width:'100%',px:1.5 }}
                >
                  <option>Todos</option>
                  {subscriptions.map((option) => (
                    <option
                      key={option.id}
                      value={option.id}
                    >
                      {option.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <TextField
                  label="Tipo de servicio"
                  name="service"
                  onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                  select
                  SelectProps={{ native: true }}
                  sx={{ my: 1.5,width:'100%',px:1.5 }}
                >
                  <option>Todos</option>
                  {services.map((option) => (
                    <option
                      key={option.id}
                      value={option.id}
                    >
                      {option.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
              <ClientListTable
                customers={paginatedCustomers}
                customersCount={filteredCustomers.length}
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

ClientList.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default ClientList;
