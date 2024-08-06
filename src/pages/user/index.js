import Head from "next/head";
import NextLink from "next/link"; 
import { useCallback, useEffect, useRef, useState } from "react"; 
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
} from "@mui/material"; 
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";

import { gtm } from '../../lib/gtm';
import { AuthGuard } from "../../components/authentication/auth-guard";
import { clientApi } from "../../api/client-api";
import { useMounted } from "../../hooks/use-mounted"; 
import { ArrowLeft } from "../../icons/arrow-left";
import { ArrowRight } from "../../icons/arrow-right";

/* Esta es la página que se le debería renderizar al Cliente cuando inicia sesión. Es decir, esta es la página para
* los clientes, NO para los administradores.
*
*
* */

/* Esto imprime el Nombre del Cliente logueado.
*
* Está hard-coded como "Usuario 1" pero debería ser el nombre del cliente logueado. Entonces, HAY QUE EDITARLO
*  */
const clientt = {
  first_name: "Usuario 1",
};

const tabs = [
  {
    label: "All",
    value: "all",
  },
];
const sortOptions = [
  {
    label: 'Last update (newest)',
    value: 'updatedAt|desc'
  },
];

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

const User = () => { 
  const isMounted = useMounted();
  const queryRef = useRef(null);
  const [clients, setClients] = useState([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [filters, setFilters] = useState({
    query: '',
    hasAcceptedMarketing: undefined,
    isProspect: undefined,
    isReturning: undefined
  });

  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

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
  const getClients = useCallback(async () => {
    try {
      const data = await clientApi.getClients();
      if (isMounted()) {
        setClients(data);
      }
      res = await data.json();
      console.log(res)
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getClients();
    console.log(getClients());
  }, []);
   
  useEffect(() => {
    if(clients.length){
      let pcs =['Todos'];
      clients.map(e=>{
        if(e && e.postal_code && !pcs.includes(e.postal_code)) pcs.push(e.postal_code)
      })
    setPostalCodesOptions(pcs)
    }
  },[clients]);

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
 
  // Usually query is done on backend with indexing solutions
  
  const filteredCustomers = applyFilters(clients, filters);
  const sortedCustomers = applySort(filteredCustomers, sort);
  const  paginatedCustomers = applyPagination(sortedCustomers, page, rowsPerPage);
  


     return (
    <>
      <Head>
        <title>Dashboard: Cliente</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}>
        <Box sx={{ mb: 4 }}>
          <Grid container  >
            <Grid item >
              <Typography variant="h4">
                {clientt.first_name}</Typography>
            </Grid>
          </Grid>
          
        </Box>
        <Card>
        <Grid  >
                <Typography  variant="h4">
                  Buenos días! 
                </Typography>
          </Grid>
          <Divider />
          <br></br>
          <Box sx={{ mb: 4 }}>
            <Grid container   spacing={3}>
              <Grid container item xs = {12} justifyContent="space-between">
                <Typography variant="h4">Inicio</Typography>
                <NextLink href="/dashboard">
                <Button 
                  startIcon={<ArrowRight fontSize="small" />}
                  variant="contained">
                  
                </Button>
                </NextLink>
              </Grid>
              <Grid container item xs = {12} justifyContent="space-between">
                <Typography variant="h4">Perfil</Typography>
                {/* <NextLink href={`/user/${clients.id}`}> */}
                <NextLink href={`/user/${clients.id}`}>
                <Button 
                  startIcon={<ArrowRight fontSize="small" />}
                  variant="contained">
                  
                </Button>
                </NextLink>
              </Grid>
              <Grid container item xs = {12} justifyContent="space-between">
                <Typography variant="h4">Tus reservas</Typography>

                {/*Enlace a las reservas / Ordenes.*/}
                {/*ESTO POR LOS MOMENTOS TIENE UN BUG QUE NO ME DEJA RENDERIZAR ESTA PAGINA. LUEGO LO ARREGLARE*/}
                {/*<NextLink href={`/user/orders/${order.id}`}>*/}
                <Button 
                  startIcon={<ArrowRight fontSize="small" />}
                  variant="contained">
                  
                </Button>
                {/*</NextLink>*/}
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Box>
      <br></br>
    </>
  );
};

User.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default User;

 