import { useCallback,useState ,useEffect } from 'react';
import Head from 'next/head';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { AuthGuard } from '../../components/authentication/auth-guard';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { Cog as CogIcon } from '../../icons/cog';
import { gtm } from '../../lib/gtm';
import { ConfigForm } from '../../components/finance/config-form';
import { useMounted } from '../../hooks/use-mounted';
// import { gymApi } from '../../api/gym-api';

// Esto importa la API que me permite Editar la Configuración de Finanzas del Gimnasio.
import { gymApi } from "../../api/gym-api-para-configuracion-finanzas";


const FinanceConfig = () => {

    const isMounted= useMounted()

    const [gymApiKey,setGymApiKey] = useState('');
    const getGymApiKey = useCallback(async () => {
      try {
        const data = await gymApi.getGymApiKey(1);
        if (isMounted()) {
          setGymApiKey(data);
        }
      } catch (err) {
        console.error(err);
      }
    }, [isMounted]);


  useEffect(() => {
    gtm.push({ event: 'page_view' });
    getGymApiKey()
  }, []);

  return (
    <>
      <Head>
        <title>
          Dashboard: FinanceConfig | Material Kit Pro
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
                  Configuration
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
                  startIcon={<CogIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="outlined"
                >
                  Editar
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
              {/*<ConfigForm gym_api_key={gymApiKey}/>*/}
              {/* Cambiaré el nombre "gym_api_key" por "gym_data", ya que esto no solo agarra la Clave de Stripe. */}
              <ConfigForm gym_data={gymApiKey}/>
            </Grid>

          </Grid>
        </Container>
      </Box>
    </>
  );
};

FinanceConfig.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default FinanceConfig;