import { useEffect } from 'react';
import NextLink from 'next/link';
import Head from 'next/head';
import { Box, Breadcrumbs, Container, Link, Typography } from '@mui/material';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { SubscriptionCreateForm } from '../../components/subscriptions/subscription-create-form';
import { gtm } from '../../lib/gtm';

const SubscriptionCreate = () => {
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  return (
    <>
      <Head>
        <title>
          Cuotas
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4">
              Crear una nueva cuota
            </Typography>
            <Breadcrumbs
              separator="/"
              sx={{ mt: 1 }}
            >
              <NextLink
                href="/dashboard"
                passHref
              >
                <Link variant="subtitle2">
                  Clientes
                </Link>
              </NextLink>
              <NextLink
                href="/subscriptions"
                passHref
              >
                <Link
                  color="primary"
                  variant="subtitle2"
                >
                  Cuotas
                </Link>
              </NextLink>
              <Typography
                color="textSecondary"
                variant="subtitle2"
              >
                Añadir
              </Typography>
            </Breadcrumbs>
          </Box>
          <SubscriptionCreateForm />
        </Container>
      </Box>
    </>
  );
};

SubscriptionCreate.getLayout = (page) => (
    <DashboardLayout>
      {page}
    </DashboardLayout>
);

export default SubscriptionCreate;