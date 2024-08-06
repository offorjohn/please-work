import { useCallback, useEffect, useState } from 'react';
import {useRouter} from 'next/router'
import NextLink from 'next/link';
import Head from 'next/head';
import { Avatar, Box, Button, Chip, Container, Link, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { useMounted } from '../../../hooks/use-mounted';
import { gtm } from '../../../lib/gtm';
import { getInitials } from '../../../utils/get-initials';
import { AuthGuard } from '../../../components/authentication/auth-guard';
import { ClientProfile } from '../../../components/client/client-profile';
import { clientApi } from '../../../api/client-api';
import { ClientCobrar } from '../../../components/client/client-cobrar';
import { stripeApi } from '../../../api/stripe-api';

const Client = (props) => {
  const isMounted = useMounted();
  const [client, setClient] = useState(null);
  const {userId} = props
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);


  const getClient = useCallback(async () => {
    try {
      const data = await clientApi.getClient(userId);
      // call API to set the requested activity
      
      if (isMounted()) {
        setClient(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, userId]);

  useEffect(() => {
      getClient(userId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  []);
  

  if (!client) {
    return null;
  }



  return (
    <>
      <Head>
        <title>
          Dashboard: Cliente | Perfil
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <NextLink
              href="/user"
              passHref
            >
              <Link
                color="textPrimary"
                component="a"
                sx={{
                  alignItems: 'center',
                  display: 'flex'
                }}
              >
                <ArrowBackIcon
                  fontSize="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="subtitle2">
                Inicio
                </Typography>
              </Link>
            </NextLink>
          </Box>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              overflow: 'hidden'
            }}
          >
            <Box sx={{width:'100%'}}>
              <Typography
                noWrap
                variant="h4"
              >
                {client.username}
              </Typography>
              <ClientCobrar client={client} />
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
          }}
              >
                <Typography variant="subtitle2">
                  id:
                </Typography>
                <Chip
                  label={client.id}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </Box>
          </Box>
          <Box mt={3}>
            <ClientProfile client={client}/>
          </Box>
        </Container>
      </Box>
    </>
  );
};

Client.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default Client;

export async function getServerSideProps(ctx) {
  const { userId } = ctx.query;
  return {
    props: {
      userId,
    },
  };
}