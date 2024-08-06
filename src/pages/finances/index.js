import Head from 'next/head';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { AuthGuard } from '../../components/authentication/auth-guard';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { FinanceCostBreakdown } from '../../components/dashboard/finance/finance-cost-breakdown';
import { FinanceOverview } from '../../components/dashboard/finance/finance-overview';
import { FinanceIncrementalSales } from '../../components/dashboard/finance/finance-incremental-sales';
import { FinanceProfitableProducts } from '../../components/dashboard/finance/finance-profitable-products';
import { FinanceSalesByContinent } from '../../components/dashboard/finance/finance-sales-by-continent';
import { FinanceSalesRevenue } from '../../components/dashboard/finance/finance-sales-revenue';
import { Download as DownloadIcon } from '../../icons/download';
import { Reports as ReportsIcon } from '../../icons/reports';
import { Cog as CogIcon } from '../../icons/cog';
import { gtm } from '../../lib/gtm';
import { MonthSales } from '../../components/finance/month-sales';
import { MonthClients } from '../../components/finance/month-clients';
import { MonthAtt } from '../../components/finance/month-att';
import { MonthBalance } from '../../components/finance/month-balance';

import { useEffect, useState,useCallback } from "react";
import { useMounted } from '../../hooks/use-mounted';
import { saleApi } from '../../api/sale-api';
import { clientApi } from '../../api/client-api';
import { subscriptionApi } from '../../api/subscription-api';
import {expenseApi} from '../../api/expense-api'
import { YearSales } from '../../components/finance/year-sales';
import { historyApi } from '../../api/history-api';

function obtenerNombreMesYAno(fecha) {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mes = fecha.getMonth();
  const ano = fecha.getFullYear();
  return `${meses[mes]} ${ano}`;
}

const Finance = () => {
  const isMounted = useMounted();
  const [sales,setSales] = useState([])
  const [salesThisMonth,setSalesThisMonth] = useState(0)
  const [salesLastMonth,setSalesLastMonth] = useState(0)
  const [clients, setClients] = useState([])
  const [activeClients, setActiveClients] = useState([])
  const [newClients, setNewClients] = useState([]) // clientes de alta
  const [oldClients, setOldClients] = useState([]) // clientes de baja
  const [informaciones, setInformaciones] = useState(0)
  const [vidaMedia, setVidaMedia]= useState(0)
  const [atrittion, setAtrittion] = useState(0)
  const [expenses,setExpenses] = useState([])
  const [expensesThisMonth,setExpensesThisMonth] = useState(0)
  const [expensesLastMonth,setExpensesLastMonth] = useState(0)
  const [salesPerMonth, setSalesPerMonth] = useState({})
  const [activeClientsLastMonth, setActiveClientsLasthMonth] = useState([])

  const hoy = new Date();
  const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const esteDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());

  const getSales = useCallback(async () => {
      try {
        const data = await saleApi.getSales();
        if (isMounted()) {
          setSales(data);
        }
      } catch (err) {
        console.error(err);
      }
    }, [isMounted]);
  const getClients = useCallback(async()=>{
    try {
      const data = await clientApi.getClients();
      if (isMounted()) {
        setClients(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);
  const getExpenses = useCallback(async () => {
    try {
      const data = await expenseApi.getExpenses();
      if (isMounted()) {
        setExpenses(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);
  const calculateSales = useCallback(async ()=>{
      setSalesLastMonth(0)
      setSalesThisMonth(0)
      sales.map(e=>{
          let total = parseFloat(e.amount)
          let fecha = new Date(e.created_at)
          if (fecha >= primerDiaMesActual && fecha < hoy) {
              setSalesThisMonth(salesThisMonth+total)
          } else if (fecha >= primerDiaMesAnterior && fecha < esteDiaMesAnterior) {
              setSalesLastMonth(salesLastMonth+total)
          }

      })
  })
  const calculateExpenses = useCallback(async ()=>{
    setExpensesLastMonth(0)
    setExpensesThisMonth(0)
    expenses.map(e=>{
        let total = parseFloat(e.amount)
        let fecha = new Date(e.created_at)
        if (fecha >= primerDiaMesActual && fecha < hoy) {
            setExpensesThisMonth(expensesThisMonth+total)
        } else if (fecha >= primerDiaMesAnterior && fecha < esteDiaMesAnterior) {
            setExpensesLastMonth(expensesLastMonth+total)
        }

    })
})

  const selectActiveClients= useCallback(async()=>{
    let ac=[]
    clients.map(c=>{
      if(c.subscription_status==1) ac.push(c)
      else if(c.voucher_status) ac.push(c)
    })
    setActiveClients(ac)
  })

  const selectNewClients= useCallback(async()=>{
    let nc =[]
    activeClients.map(async (c)=>{
      let s = await historyApi.getUserStatus(c.id)
      if(s==3 || c.date_joined>= primerDiaMesActual) nc.push(c)
    })
    clients.map(c=>{
      if(!nc.some(n =>n.id==c.id)){
        if(c.date_joined>=primerDiaMesActual && c.voucher_status) nc.push(c)
      }
    })
    setNewClients(nc)
  })

  const selectOldClients= useCallback(async()=>{
    // tenían una suscripcion activa, la dieron de baja y no renovaron en este mes
    let oc=[]
    clients.map(async (c)=>{
      if(c.subscription_status==0){
        let lh = historyApi.getLastHistory(c.id)
        if(lh.date>=primerDiaMesActual || lh.current_status==0) oc.push(c)
      }
    })
    setOldClients(oc)

  })

  const calculateInformaciones = useCallback(async()=>{
    let cant =0;
    clients.map(c=>{
      if(!sales.some(sale=>sale.buyer == c.id) && new Date(c.date_joined) >= primerDiaMesActual)
      cant++
    })
    setInformaciones(cant)
  })

  const calculateVM = useCallback(async()=>{
    let meses =0;
    // ver date_joined de socios activos y contar meses hasta hoy
    activeClients.map(c=>{
      let fecha_registro = new Date(c.date_joined)
      let m = (hoy -fecha_registro) / (1000 * 60 * 60 * 24*30);
      meses+=m
    })
    setVidaMedia(meses)
    // cambiar para socios activos q tuvieron un período de baja
  })

  const calculateSalesPerMonth = useCallback(async()=>{
    const facturacion_por_mes= {}
    const haceUnAno = new Date(hoy);
    haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);
    sales.forEach(venta => {
      const fechaVenta = new Date(venta.created_at);

      if (fechaVenta >= haceUnAno && fechaVenta <= hoy) {
        const nombreMesYAno = obtenerNombreMesYAno(fechaVenta);
        if (facturacion_por_mes[nombreMesYAno]) {
            facturacion_por_mes[nombreMesYAno] += parseFloat(venta.amount);
        } else {
            facturacion_por_mes[nombreMesYAno] = parseFloat(venta.amount);
        }
      }
    });
    setSalesPerMonth(facturacion_por_mes);
  })
  const getActiveClientsLastMonth = useCallback(async()=>{
    try {
      const data = await historyApi.getCuentasMesPasado();
      if (isMounted()) {
        setActiveClientsLasthMonth(data);
      }
    } catch (err) {
      console.error(err);
    }
  },[isMounted])

  const calculateAtrittion = useCallback(async()=>{
    if(activeClientsLastMonth.length)
      setAtrittion(oldClients.length/activeClientsLastMonth.length)
  })

  useEffect(() => {
    getSales();
    getClients();
    getExpenses();
    getActiveClientsLastMonth()
    gtm.push({ event: 'page_view' });
  },
  []);
  useEffect(() => {
      calculateSales();
      calculateSalesPerMonth()
  },
  [sales]);
  useEffect(() => {
    selectActiveClients();
    calculateInformaciones();
    selectOldClients()
  },
  [clients]);
  useEffect(()=>{
    selectNewClients()
    calculateVM()
  },[activeClients])
  useEffect(() => {
    calculateExpenses();
  },
  [expenses]);
  useEffect(() => {
    calculateAtrittion();
  },
  [oldClients,activeClientsLastMonth]);


  return (
    <>
      <Head>
        <title>
          Dashboard: Finance | Material Kit Pro
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
                  Finance
                </Typography>
              </Grid>
              <Grid
                item
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  m: -1
                }}
              >
                <Button
                  startIcon={<ReportsIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="outlined"
                >
                  Reports
                </Button>
                <Button
                  startIcon={<CogIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="outlined"
                >
                  Settings
                </Button>
                <Button
                  startIcon={<DownloadIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="contained"
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Grid
            container
            spacing={4}
          >
            <Grid
              item
              xs={12}
            >
              <MonthSales salesLastMonth={salesLastMonth} salesThisMonth={salesThisMonth} activeClients={activeClients} informaciones={informaciones} newClients={newClients}/>
              <br></br>
              <MonthClients informaciones={informaciones} newClients={newClients} oldClients={oldClients}/>
              <br></br>
              <MonthAtt vidaMedia={vidaMedia} atrittion={atrittion} reservas={0} />
              <br></br>
              <MonthBalance balanceThisMonth={salesThisMonth-expensesThisMonth} balanceLastMonth={salesLastMonth-expensesLastMonth} />
              <br></br>
              <YearSales salesPerMonth={salesPerMonth} />
            </Grid>
          </Grid>
          </Container >
          <br></br>
           <Container maxWidth="xl">
          <Grid
            container
            spacing={4}
          >
            <Grid
              item
              xs={12}
            >
              <FinanceOverview />
            </Grid>
            <Grid
              item
              md={8}
              xs={12}
            >
              <FinanceSalesRevenue />
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <FinanceCostBreakdown />
            </Grid>
            <Grid
              item
              md={8}
              xs={12}
            >
              <FinanceSalesByContinent />
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <FinanceIncrementalSales />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <FinanceProfitableProducts />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Finance.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default Finance;