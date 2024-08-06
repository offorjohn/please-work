import { useEffect } from 'react';
import NextLink from 'next/link';
import Head from 'next/head';
import { Box, Breadcrumbs, Container, Link, Typography } from '@mui/material';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { GroupCreateForm } from '../../components/group/group-create-form';
import { AuthGuard } from '../../components/authentication/auth-guard';
import { gtm } from '../../lib/gtm';

const GroupCreate = () => {
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  return (
    <>
      <Head>
        <title>
          Actividades | Nueva
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
              Crear un nuevo grupo de actividades
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
                  Gym
                </Link>
              </NextLink>
              <NextLink
                href="/groups"
                passHref
              >
                <Link
                  color="primary"
                  variant="subtitle2"
                >
                  Actividades
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
          <GroupCreateForm />
        </Container>
      </Box>
    </>
  );
};

GroupCreate.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default GroupCreate;