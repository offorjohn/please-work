import { useCallback, useEffect, useState } from 'react';
import {useRouter} from 'next/router'
import NextLink from 'next/link';
import Head from 'next/head';
import { Avatar, Box, Chip, Container, Link, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { RoomEditForm } from '../../../components/rooms/room-edit-form';
import { useMounted } from '../../../hooks/use-mounted';
import { gtm } from '../../../lib/gtm';
import { useDispatch, useSelector } from 'react-redux';
import { roomApi } from '../../../api/room-api';
import { getRoom } from '../../../slices/gym';
import { AuthGuard } from '../../../components/authentication/auth-guard';

const Room = (props) => {
  const isMounted = useMounted();
  const [room, setRoom] = useState(null)
  // const dispatch = useDispatch();
  // const {room} = useSelector((state) => state.gym);
  const {roomId} = props
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);


  const getRoom = useCallback(async () => {
    try {
      const data = await roomApi.getRoom(roomId);

      if (isMounted()) {
        setRoom(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, roomId]);

  useEffect(() => {
      getRoom();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);


  if (!room) {
    console.log("no rooms fetched")
    return null;
  }

  return (
    <>
      <Head>
        <title>
          Dashboard: Espacios y salas | Modificar
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
              href="/rooms"
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
                  Espacios y salas
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
                {room.name}
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
                  label={room.id}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </div>
          </Box>
          <Box mt={3}>
            <RoomEditForm room={room} />
          </Box>
        </Container>
      </Box>
    </>
  );
};

Room.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default Room;

export async function getServerSideProps(ctx) {
  const { roomId } = ctx.query;
  return {
    props: {
      roomId,
    },
  };
}