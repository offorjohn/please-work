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
  Typography,
  MenuItem,
  CircularProgress,
  useTheme
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { clientApi } from '../../api/client-api';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { AccessListTable } from '../../components/access/access-list-table';
import { useMounted } from '../../hooks/use-mounted';
import { Download as DownloadIcon } from '../../icons/download';
import { Plus as PlusIcon } from '../../icons/plus';
import { Search as SearchIcon } from '../../icons/search';
import { Upload as UploadIcon } from '../../icons/upload';
import { gtm } from '../../lib/gtm';
import { AuthGuard } from '../../components/authentication/auth-guard';
import { accessApi } from '../../api/access-api';
import toast from 'react-hot-toast'

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
    label: 'Date (newest)',
    value: 'date|desc'
  },
  {
    label: 'Date (oldest)',
    value: 'date|asc'
  },
  {
    label: 'Username (A-Z)',
    value: 'client.username|desc'
  },
  {
    label: 'Username (Z-A)',
    value: 'client.username|asc'
  }
];

const today = new Date();
const pad = (num) => num.toString().padStart(2, '0');
const formatDate = (date) => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

const getMonthName = (monthIndex) => {
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return months[monthIndex];
}

const dateOptions = [
  {
    label: `Hoy (${formatDate(new Date())})`,
    value: 'Hoy'
  },
  {
    label: `Ayer (${formatDate(new Date(new Date().setDate(new Date().getDate() - 1)))})`,
    value: 'Ayer'
  },
  {
    label: `Esta semana (${Math.ceil((new Date().getDate() + new Date().getDay() + 1) / 7)})`,
    value: 'Esta semana'
  },
  {
    label: `Semana anterior (${Math.ceil((new Date(new Date().setDate(new Date().getDate() - 7)).getDate() + new Date().getDay() + 1) / 7)})`,
    value: 'Semana anterior'
  },
  /*{
    label: `Próximo mes (${getMonthName((new Date().getMonth() + 1) % 12)})`,
    value: 'Próximo mes'
  },*/
  {
    label: `Este mes (${getMonthName(new Date().getMonth())})`,
    value: 'Este mes'
  },
  {
    label: `Último mes (${getMonthName((new Date().getMonth() - 1 + 12) % 12)})`,
    value: 'Último mes'
  }
];
for (let i = 2; i <= 12; i++) {
  const pastMonth = new Date(new Date().setMonth(new Date().getMonth() - i));
  dateOptions.push({
    label: getMonthName(pastMonth.getMonth()),
    value: `month-${pastMonth.getMonth() + 1}`
  });
}
dateOptions.push(
  {
    label: `Este año (${new Date().getFullYear()})`,
    value: 'Este año'
  },
  {
    label: `Último año (${new Date().getFullYear() - 1})`,
    value: 'Último año'
  }
);


const esMismoDia = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
};

const esMismaSemana = (date1, date2) => {
  const startOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust if the week starts on Sunday
    return new Date(date.setDate(diff));
  };

  return startOfWeek(date1).getTime() === startOfWeek(date2).getTime();
};

const esMismoMes = (date1, date2) => {
  return date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
};

const esMismoAno = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear();
};

const applyFilters = (customers, filters) => customers.filter((customer) => {
  if (filters.query) {
    let queryMatched = false;
    const properties = ['username', 'email'];

    properties.forEach((property) => {
      if ((customer[property]).toLowerCase().includes(filters.query.toLowerCase())) {
        queryMatched = true;
      }
    });

    if (!queryMatched) {
      return false;
    }
  }

  const customerDate = new Date(customer.date);

  switch (filters.date) {
    case 'Hoy':
      if (!esMismoDia(customerDate, new Date())) {
        return false;
      }
      break;
    case 'Ayer':
      if (!esMismoDia(customerDate, new Date(new Date().setDate(new Date().getDate() - 1)))) {
        return false;
      }
      break;
    case 'Esta semana':
      if (!esMismaSemana(customerDate, new Date())) {
        return false;
      }
      break;
    case 'Semana anterior':
      if (!esMismaSemana(customerDate, new Date(new Date().setDate(new Date().getDate() - 7)))) {
        return false;
      }
      break;
    case 'Próximo mes':
      const nextMonthDate = new Date();
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      if (!esMismoMes(customerDate, nextMonthDate)) {
        return false;
      }
      break;
    case 'Este mes':
      if (!esMismoMes(customerDate, new Date())) {
        return false;
      }
      break;
    case 'Último mes':
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      if (!esMismoMes(customerDate, lastMonthDate)) {
        return false;
      }
      break;
    case 'Este año':
      if (!esMismoAno(customerDate, new Date())) {
        return false;
      }
      break;
    case 'Último año':
      const lastYearDate = new Date();
      lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
      if (!esMismoAno(customerDate, lastYearDate)) {
        return false;
      }
      break;
    default:
      // Handling dynamic month checks
      const monthMatch = filters.date.match(/^month-(\d+)$/);
      if (monthMatch) {
        const month = parseInt(monthMatch[1], 10) - 1; // month in the match is 1-based, JS Date months are 0-based
        const dynamicMonthDate = new Date();
        dynamicMonthDate.setMonth(month);
        if (!esMismoMes(customerDate, dynamicMonthDate)) {
          return false;
        }
      }
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


const AccessList = () => {
  const isMounted = useMounted();
  const queryRef = useRef(null);
  const [clients, setClients] = useState([])
  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [selectedClient, setSelectedClient] = useState('');
  const [date, setDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [filters, setFilters] = useState({
    query: '',
    date:'Hoy'
  });
  const [search, setSearch] = useState('')
  const [access,setAccess ] = useState([])
  const [loading, setLoading] = useState(false);
  const [todayVisitors,setTodayVisitors] = useState(0)
  const [filterDate,setFilterDate]=useState('Hoy')
  const theme = useTheme(); 

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

  const getAccess = useCallback(async () => {
    try {
      const data = await accessApi.getAccesss();
      if (isMounted()) {
        setAccess(data);
        setTodayVisitors(data.filter(a => esMismoDia(new Date(a.date),new Date())).length)
        console.log(data)
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);


  useEffect(() => {
    getClients();
    getAccess();
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
      query: search,
    }));
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handleSearchChange = (e)=>{
    setSearch(e.target.value)
  }

  const handleClientChange = (event) => {
    setSelectedClient(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleDateChange = (event) => {
    event.preventDefault();
    setFilterDate(event.target.value)
    setFilters((prevState) => ({
      ...prevState,
      date: event.target.value,
    }));
  };

  const handleAddAccess = async () => {
    if (!selectedClient) {
      toast.error('Por favor selecciona un cliente.');
      return;
    }

    setLoading(true);

    try {
      const client = clients.find(client => client.id === selectedClient);
      if (!client) {
        toast.error('Cliente no encontrado.');
        setLoading(false);
        return;
      }

      const accessData = {
        account: client.id,
        date: new Date(),
        gym:1
      };

      const newAccess = await accessApi.createAccess(accessData);
      newAccess.client=client;
      setAccess((prevAccess) => [...prevAccess, newAccess]);
      toast.success('Acceso creado exitosamente.');
    } catch (error) {
      toast.error('Error al crear el acceso.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Usually query is done on backend with indexing solutions
  
  const filteredCustomers = applyFilters(access, filters);
  const sortedCustomers = applySort(filteredCustomers, sort);
  const paginatedCustomers = applyPagination(sortedCustomers, page, rowsPerPage);
  
  return (
    <>
      <Head>
        <title>
          Dashboard: Listado de accesos clientes
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
                  Registro de accesos
                </Typography>
              </Grid>
              {/* Botón para Crear a un Nuevo Cliente ("Añadir") */}
            </Grid>
           
          </Box>
          <Box sx={{ p: 3, backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, width:'400px', my:2, borderRadius:2, ml:"auto" }}>
            <Typography variant="h6">
              Número de visitantes hoy: {todayVisitors}
            </Typography>
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
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'wrap',
                m: '-1.5 1.5 0 1.5',
                p: '3 3 0 3'
              }}
            >
            
              <TextField
                label="Registro entrada"
                sx={{ m: 1, width: "600px" }}
                select
                value={selectedClient}
                onChange={handleClientChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </MenuItem>
                ))}
              </TextField>
            
               
                <Button
                  sx={{ m: 2 }}
                  variant="contained"
                  onClick={handleAddAccess}
                  startIcon={loading ? <CircularProgress size="1rem" /> : <PlusIcon fontSize="small" />}
                  disabled={loading}
                >
                  Añadir acceso
                </Button>
                

                <TextField
                  label="Filtrar por fecha"
                  name="filter"
                  onChange={handleDateChange}
                  select
                  SelectProps={{ native: true }}
                  sx={{ m: 1.5 }}
                  value={filterDate}
                >
                  {dateOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </TextField>
            </Box>
              <AccessListTable
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

AccessList.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default AccessList;
