import { useEffect } from 'react';
import NextLink from 'next/link';
import Head from 'next/head';
import { Box, Breadcrumbs, Container, Link, Typography } from '@mui/material';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { ProductCreateForm } from '../../components/products/product-create-form';
import { gtm } from '../../lib/gtm';

const ProductCreate = () => {
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  return (
    <>
      <Head>
        <title>
          Productos | Nuevo
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
              Crear un nuevo producto
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
                href="/products"
                passHref
              >
                <Link
                  color="primary"
                  variant="subtitle2"
                >
                  Productos
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
          <ProductCreateForm />
        </Container>
      </Box>
    </>
  );
};

ProductCreate.getLayout = (page) => (
    <DashboardLayout>
      {page}
    </DashboardLayout>
);

export default ProductCreate;