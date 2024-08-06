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


/* So, this file is responsible for displaying the profile of a specific client, not the entire list of clients. The
* list of clients would likely be displayed by a different file, possibly newGymFrontend/src/pages/clients/index.js or
* similar.
* */


const Client = (props) => {
  const isMounted = useMounted();
  const [client, setClient] = useState(null);
  const {clientId} = props
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);


  const getClient = useCallback(async () => {
    try {
      const data = await clientApi.getClient(clientId);
      // call API to set the requested activity

      if (isMounted()) {
        setClient(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, clientId]);

  useEffect(() => {
      getClient(clientId);
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
              href="/clients"
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
                  Clientes
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
  const { clientId } = ctx.query;
  return {
    props: {
      clientId,
    },
  };
}

// import { useCallback, useEffect, useState } from 'react';
// import {useRouter} from 'next/router'
// import NextLink from 'next/link';
// import Head from 'next/head';
// import { Avatar, Box, Button, Chip, Container, Link, Typography } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
// import { useMounted } from '../../../hooks/use-mounted';
// import { gtm } from '../../../lib/gtm';
// import { getInitials } from '../../../utils/get-initials';
// import { AuthGuard } from '../../../components/authentication/auth-guard';
// import { ClientProfile } from '../../../components/client/client-profile';
// import { clientApi } from '../../../api/client-api';
// import { ClientCobrar } from '../../../components/client/client-cobrar';
// import { stripeApi } from '../../../api/stripe-api';
//
// const Client = (props) => {
//   const isMounted = useMounted();
//   const [client, setClient] = useState(null);
//   const {clientId} = props
//   useEffect(() => {
//     gtm.push({ event: 'page_view' });
//   }, []);
//
//
//   const getClient = useCallback(async () => {
//     try {
//       const data = await clientApi.getClient(clientId);
//       // call API to set the requested activity
//
//       if (isMounted()) {
//         setClient(data);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }, [isMounted, clientId]);
//
//   useEffect(() => {
//       getClient(clientId);
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   []);
//
//
//   if (!client) {
//     return null;
//   }
//
//
//
//   return (
//     <>
//       <Head>
//         <title>
//           Dashboard: Cliente | Perfil
//         </title>
//       </Head>
//       <Box
//         component="main"
//         sx={{
//           backgroundColor: 'background.default',
//           flexGrow: 1,
//           py: 8
//         }}
//       >
//         <Container maxWidth="md">
//           <Box sx={{ mb: 4 }}>
//             <NextLink
//               href="/clients"
//               passHref
//             >
//               <Link
//                 color="textPrimary"
//                 component="a"
//                 sx={{
//                   alignItems: 'center',
//                   display: 'flex'
//                 }}
//               >
//                 <ArrowBackIcon
//                   fontSize="small"
//                   sx={{ mr: 1 }}
//                 />
//                 <Typography variant="subtitle2">
//                   Clientes
//                 </Typography>
//               </Link>
//             </NextLink>
//           </Box>
//           <Box
//             sx={{
//               alignItems: 'center',
//               display: 'flex',
//               overflow: 'hidden'
//             }}
//           >
//             <Box sx={{width:'100%'}}>
//               <Typography
//                 noWrap
//                 variant="h4"
//               >
//                 {client.username}
//               </Typography>
//               <ClientCobrar client={client} />
//               <Box
//                 sx={{
//                   alignItems: 'center',
//                   display: 'flex',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis',
//                   whiteSpace: 'nowrap'
//           }}
//               >
//                 <Typography variant="subtitle2">
//                   id:
//                 </Typography>
//                 <Chip
//                   label={client.id}
//                   size="small"
//                   sx={{ ml: 1 }}
//                 />
//               </Box>
//             </Box>
//           </Box>
//           <Box mt={3}>
//             <ClientProfile client={client}/>
//           </Box>
//         </Container>
//       </Box>
//     </>
//   );
// };
//
// Client.getLayout = (page) => (
//   <AuthGuard>
//     <DashboardLayout>
//       {page}
//     </DashboardLayout>
//   </AuthGuard>
// );
//
// export default Client;
//
// export async function getServerSideProps(ctx) {
//   const { clientId } = ctx.query;
//   return {
//     props: {
//       clientId,
//     },
//   };
// }