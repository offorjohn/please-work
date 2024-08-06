import React, { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';

// Esto me deja crear Formularios con los Estilos de Material-UI para los formularios Formik
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
  CardContent
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { clientApi } from '../../../../api/client-api';

// Esto me agrega la Disposición con el Navbar (tanto el de arriba como el de la izquierda)
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import { ClientListTable } from '../../../../components/client/client-list-for-uploading-documents';
import { useMounted } from '../../../../hooks/use-mounted';
import { Download as DownloadIcon } from '../../../../icons/download';
import { Plus as PlusIcon } from '../../../../icons/plus';
import { Search as SearchIcon } from '../../../../icons/search';
import { Upload as UploadIcon } from '../../../../icons/upload';
import { gtm } from '../../../../lib/gtm';

// Esto creo que es para evitar que alguien entre aquí sin haberse autenticado / logueado
import { AuthGuard } from '../../../../components/authentication/auth-guard';
import { productApi } from '../../../../api/product-api';
import { subscriptionApi } from '../../../../api/subscription-api';
import { voucherApi } from '../../../../api/voucher-api';
import { serviceApi } from '../../../../api/service-api';

import { useRouter } from 'next/router';
// import { Form, FormGroup, Label, Input, Button } from 'reactstrap';

// Esto importa el archivo con la API que me deja agarrar TODOS los datos del Gimnasio seleccionado
import { gymApiAllData } from '../../../../api/gym-api-all-data';

import axios from 'axios';

// Esto importa los Formularios de Formik
import { useFormik } from 'formik';

// Esto me mostrará mensajes de error si el usuario no llena los campos del formulario
import * as Yup from 'yup';

// Esto me dejará ver la lista de Clientes junto con el filtro que me deja buscarlos rápidamente
import { CustomerListTable } from '../../../../components/dashboard/customer/customer-list-table';

// Esto me dejará imprimir mensajes flash de confirmación y de error como se hacen en el resto de la web app de React
import toast from 'react-hot-toast';

/* Página para enviarles los Documentos Subidos a los Clientes si eres un Administrador. Esta página se encuentra
* en la URL /documents/send-to-client/[documentID].
*
*
* */

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

  if (filters.hasAcceptedMarketing && !customer.hasAcceptedMarketing) {
    return false;
  }

  if (filters.isProspect && !customer.isProspect) {
    return false;
  }

  if (filters.isReturning && !customer.isReturning) {
    return false;
  }

  if (filters.genre !== 'Todos' && customer.genre !== filters.genre) {
    return false;
  }

  if (filters.postal_code !== 'Todos' && customer.postal_code !== filters.postal_code) {
    return false;
  }

  if (filters.estado !== 'Todos' && (filters.estado !== customer.subscription_status && filters.estado !== customer.voucher_status)) {
    return false;
  }
  if (filters.product !== 'Todos' && !customer.products?.includes(parseInt(filters.product))) {
    return false;
  }
  if (filters.voucher !== 'Todos' && !customer.vouchers?.includes(parseInt(filters.voucher))) {
    return false;
  }
  if (filters.service !== 'Todos' && !customer.services?.includes(parseInt(filters.service))) {
    return false;
  }
  return !(filters.subscription !== 'Todos' && !customer.subscriptions?.includes(parseInt(filters.subscription)));
});

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

const applyPagination = (customers, page, rowsPerPage) => customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

const Index = () => {
  const isMounted = useMounted();
  const queryRef = useRef(null);
  const [clients, setClients] = useState([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [genre, setGenre] = useState(genreOptions[0].value);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
  const [filters, setFilters] = useState({
    query: '',
    hasAcceptedMarketing: undefined,
    isProspect: undefined,
    isReturning: undefined,
    genre: 'Todos',
    postal_code: 'Todos',
    estado: 'Todos',
    product: 'Todos',
    subscription: 'Todos',
    voucher: 'Todos',
    service: 'Todos'
  });
  const [search, setSearch] = useState('');
  const [postalCodesOptions, setPostalCodesOptions] = useState(['Todos']);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [fileInputs, setFileInputs] = useState([0]);

  const addFileInput = () => {
    setFileInputs([...fileInputs, fileInputs.length]);
  };

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

  const getSubscriptions = useCallback(async () => {
    try {
      const data = await subscriptionApi.getSubscriptions();
      if (isMounted()) {
        setSubscriptions(data.filter(subscription => subscription.is_active));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  const getVouchers = useCallback(async () => {
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

  const getPostalCodesOptions = useCallback(async () => {
    try {
      const { data } = await clientApi.getPostalCodesOptions();
      if (isMounted()) {
        setPostalCodesOptions(['Todos', ...data]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getClients();
    getProducts();
    getSubscriptions();
    getVouchers();
    getServices();
    getPostalCodesOptions();
  }, [getClients, getProducts, getSubscriptions, getVouchers, getServices, getPostalCodesOptions]);

  const handleFilterChange = (event) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSortChange = (event, newValue) => {
    setSort(newValue);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      query: event.target.value
    }));
  };

  const filteredClients = applyFilters(clients, filters);
  const sortedClients = applySort(filteredClients, sort);
  const paginatedClients = applyPagination(sortedClients, page, rowsPerPage);

  const handleSendDocument = async () => {
    try {
      await axios.post('/api/send-document', { documentId: queryRef.current, clients: paginatedClients });
      toast.success('Document sent successfully');
    } catch (error) {
      console.error('Error sending document:', error);
      toast.error('Failed to send document');
    }
  };

  return (
    <>
      <Head>
        <title>Send Document | Dashboard</title>
      </Head>
      <AuthGuard>
        <DashboardLayout>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ mb: 3 }}>
              Send Document
            </Typography>
            <Card>
              <CardContent>
                <Box>
                  <TextField
                    fullWidth
                    label="Search"
                    name="query"
                    onChange={handleSearchChange}
                    value={filters.query}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Divider />
                <Box sx={{ mt: 2 }}>
                  <Button
                    color="primary"
                    onClick={handleSendDocument}
                    startIcon={<UploadIcon />}
                  >
                    Send Document
                  </Button>
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">
                Clients
              </Typography>
              <ClientListTable clients={paginatedClients} />
            </Box>
          </Container>
        </DashboardLayout>
      </AuthGuard>
    </>
  );
};

export default Index;
