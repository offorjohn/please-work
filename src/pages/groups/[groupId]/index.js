import { useCallback, useEffect, useState } from 'react';
import {useRouter} from 'next/router'
import NextLink from 'next/link';
import Head from 'next/head';
import { Avatar, Box, Chip, Container, Link, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { groupApi } from '../../../api/group-api';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { GroupEditForm } from '../../../components/group/group-edit-form';
import { useMounted } from '../../../hooks/use-mounted';
import { gtm } from '../../../lib/gtm';
import { AuthGuard } from '../../../components/authentication/auth-guard';

const Group = (props) => {
  const isMounted = useMounted();
  const [group, setGroup] = useState(null);
  const {groupId} = props
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);


  const getGroup = useCallback(async () => {
    try {
      const data = await groupApi.getGroup(groupId);
      // call API to set the requested activity
      
      if (isMounted()) {
        setGroup(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, groupId]);

  useEffect(() => {
      getGroup(groupId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  if (!group) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          Dashboard: Grupo de actividades | Modificar
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
              href="/groups"
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
                  Grupos de actividades
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
                {group.name}
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
                  label={group.id}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </div>
          </Box>
          <Box mt={3}>
            <GroupEditForm group={group} />
          </Box>
        </Container>
      </Box>
    </>
  );
};

Group.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default Group;

export async function getServerSideProps(ctx) {
  const { groupId } = ctx.query;
  return {
    props: {
      groupId,
    },
  };
}