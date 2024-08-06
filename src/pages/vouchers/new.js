import { useEffect } from 'react';
import NextLink from 'next/link';
import Head from 'next/head';
import { Box, Breadcrumbs, Container, Link, Typography } from '@mui/material';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { VoucherCreateForm } from '../../components/vouchers/voucher-create-form';
import { gtm } from '../../lib/gtm';

const VoucherCreate = () => {
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  return (
    <>
      <Head>
        <title>
          Bonos | Nuevo
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
              Crear un nuevo bono
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
                href="/vouchers"
                passHref
              >
                <Link
                  color="primary"
                  variant="subtitle2"
                >
                  Bonos
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
          <VoucherCreateForm />
        </Container>
      </Box>
    </>
  );
};

VoucherCreate.getLayout = (page) => (
    <DashboardLayout>
      {page}
    </DashboardLayout>
);

export default VoucherCreate;