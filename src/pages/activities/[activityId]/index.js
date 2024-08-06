import { useCallback, useEffect, useState } from 'react';
import {useRouter} from 'next/router'
import NextLink from 'next/link';
import Head from 'next/head';
import { Avatar, Box, Chip, Container, Link, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { activityApi } from '../../../api/activity-api';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { ActivityEditForm } from '../../../components/activity/activity-edit-form';
import { useMounted } from '../../../hooks/use-mounted';
import { gtm } from '../../../lib/gtm';
import { getInitials } from '../../../utils/get-initials';
import { AuthGuard } from '../../../components/authentication/auth-guard';

const Activity = (props) => {
  const isMounted = useMounted();
  const [activity, setActivity] = useState(null);
  const {activityId} = props
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);


  const getActivity = useCallback(async () => {
    try {
      const data = await activityApi.getActivity(activityId);
      // call API to set the requested activity
      
      if (isMounted()) {
        setActivity(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, activityId]);

  useEffect(() => {
      getActivity(activityId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  if (!activity) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          Dashboard: Actividad | Modificar
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
              href="/activities"
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
                  Actividades
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
            <div>
              <Typography
                noWrap
                variant="h4"
              >
                {activity.name}
              </Typography>
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
                  label={activity.id}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </div>
          </Box>
          <Box mt={3}>
            <ActivityEditForm activity={activity} />
          </Box>
        </Container>
      </Box>
    </>
  );
};

Activity.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default Activity;

export async function getServerSideProps(ctx) {
  const { activityId } = ctx.query;
  return {
    props: {
      activityId,
    },
  };
}