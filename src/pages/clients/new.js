import { useCallback, useEffect, useState } from 'react';
import {useRouter} from 'next/router'
import NextLink from 'next/link';
import Head from 'next/head';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container, Divider, FormHelperText,
    Grid,
    Link,
    TextField,
    Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { useMounted } from '../../hooks/use-mounted';
import { gtm } from '../../lib/gtm';
import { getInitials } from '../../utils/get-initials';
import { AuthGuard } from '../../components/authentication/auth-guard';
import { ClientProfile } from '../../components/client/client-profile';
import { clientApi } from '../../api/client-api';
import { ClientCobrar } from '../../components/client/client-cobrar';
import { stripeApi } from '../../api/stripe-api';

// Necesito esto para renderizar los formularios de Formik.
import * as Yup from 'yup';

// Esto me deja usar los formularios de Formik
import { useFormik } from 'formik';

// Aquí está el archivo con el Formulario Formik para Crear a un Nuevo Cliente (create-new-client.js).
import { CreateNewClient } from '../../components/client/create-new-client';
import {v4 as uuidv4} from "uuid";

// Este archivo te permite Crear a un Nuevo Cliente en el enlace /clients/new.

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


  /* Formulario para Crear a un Nuevo Cliente en el Dashboard de la web app.
  *
  * This will be similar to the existing Formik instance, but it will call the createClient() function instead of
  * updateClient().
  *
  * Aquí también tengo que meter todos los campos para crear a un nuevo cliente en la web app de Django.
  *
  * Campos que necesito meter:
  *   username,
      first_name, X
      last_name,  X
      email,  X
      phone,  X
      birth_date='2000-01-01',  X
      notes,  X
      picture,  X
      type='CUSTOMER', (SIEMPRE DEBE SER CUSTOMER)  X
      token_for_qr_code,  X
      password, X
  *
  * "Validation schema" es para decir cuales campos son obligatorios, para forzar al usuario que ponga esos campos.
  * */
  // const formikCreate = useFormik({
  //   initialValues: {
  //     first_name: '',
  //     last_name: '',
  //     phone: '',
  //     email: '',
  //     username: '',
  //     password: '',
  //     type: 'CUSTOMER',
  //     picture: null,
  //     notes: '',
  //     birth_date: '2000-01-01',
  //     token_for_qr_code: '',
  //   },
  //   validationSchema: Yup.object({
  //     first_name: Yup.string().min(5).required(),
  //     last_name: Yup.string().min(5).required(),
  //     username: Yup.string().min(5).required(),
  //     password: Yup.string().min(5).required(),
  //     email: Yup.string().min(5).required()
  //   }),
  //   onSubmit: async (values, helpers) => {
  //     try {
  //       // NOTE: Make API request
  //       await clientApi.createClient({
  //         first_name: values.first_name,
  //         email: values.email,
  //         phone: values.phone,
  //         last_name: values.last_name,
  //         username: values.username,
  //         password: values.password,
  //         token_for_qr_code: values.token_for_qr_code
  //       })
  //       helpers.setStatus({ success: true });
  //       helpers.setSubmitting(false);
  //       toast.success('Cliente creado!');
  //       Router.push('/clients').catch(console.error);
  //     } catch (err) {
  //       console.error(err);
  //       toast.error('Error en la creación, el cliente no se ha creado');
  //       helpers.setStatus({ success: false });
  //       helpers.setErrors({ submit: err.message });
  //       helpers.setSubmitting(false);
  //     }
  //   }
  // });


  /* Si no estoy modificando a ningún cliente, es decir, si la URL no tiene la ID de ningun cliente existente */
  if (!client) {
    // return null;
    return (
      // Esto empieza a renderizar el Código HTML
      <>
        {/*<p>Hola Mundo</p>*/}

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
      {/*    <Box*/}
      {/*      sx={{*/}
      {/*        alignItems: 'center',*/}
      {/*        display: 'flex',*/}
      {/*        overflow: 'hidden'*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      <Box sx={{width:'100%'}}>*/}
      {/*        <Typography*/}
      {/*          noWrap*/}
      {/*          variant="h4"*/}
      {/*        >*/}
      {/*          /!*{client.username}*!/*/}
      {/*        </Typography>*/}
      {/*        <ClientCobrar client={client} />*/}
      {/*        <Box*/}
      {/*          sx={{*/}
      {/*            alignItems: 'center',*/}
      {/*            display: 'flex',*/}
      {/*            overflow: 'hidden',*/}
      {/*            textOverflow: 'ellipsis',*/}
      {/*            whiteSpace: 'nowrap'*/}
      {/*    }}*/}
      {/*        >*/}
      {/*          <Typography variant="subtitle2">*/}
      {/*            id:*/}
      {/*          </Typography>*/}
      {/*          <Chip*/}
      {/*            // label={client.id}*/}
      {/*            size="small"*/}
      {/*            sx={{ ml: 1 }}*/}
      {/*          />*/}
      {/*        </Box>*/}
      {/*      </Box>*/}
      {/*    </Box>*/}
      {/*    <Box mt={3}>*/}
      {/*      ESTA ES LA LINEA DE CODIGO QUE ME DA EL BUG "Cannot call a class as a function"*/}
            <CreateNewClient />

      {/*    </Box>*/}

            {/* Formulario de Formik para Crear a un Nuevo Cliente en el Dashboard de la web app. */}
      {/*  <form*/}
      {/*      onSubmit={formikCreate.handleSubmit}*/}
      {/*      {...other}>*/}
      {/*    <Card sx={{mt: 3}}>*/}
      {/*      <CardContent>*/}
      {/*        <Grid*/}
      {/*            container*/}
      {/*            spacing={3}*/}
      {/*        >*/}
      {/*          <Grid*/}
      {/*              item*/}
      {/*              md={4}*/}
      {/*              xs={12}*/}
      {/*          >*/}
      {/*            <Typography variant="h6">*/}
      {/*              Datos generales*/}
      {/*            </Typography>*/}
      {/*          </Grid>*/}
      {/*          <Grid*/}
      {/*              item*/}
      {/*              md={8}*/}
      {/*              xs={12}*/}
      {/*          >*/}
      {/*            <Box sx={{mt: 4}}>*/}
      {/*              <TextField*/}
      {/*                  error={Boolean(formikCreate.touched.first_name && formikCreate.errors.first_name)}*/}
      {/*                  fullWidth*/}
      {/*                  helperText={formikCreate.touched.first_name && formikCreate.errors.first_name}*/}
      {/*                  label="Nombre"*/}
      {/*                  name="first_name"*/}
      {/*                  onBlur={formikCreate.handleBlur}*/}
      {/*                  onChange={formikCreate.handleChange}*/}
      {/*                  value={formikCreate.values.first_name}*/}
      {/*              />*/}
      {/*            </Box>*/}
      {/*            {Boolean(formikCreate.touched.first_name && formikCreate.errors.first_name) && (*/}
      {/*                <Box sx={{mt: 2}}>*/}
      {/*                  <FormHelperText error>*/}
      {/*                    {formikCreate.errors.first_name}*/}
      {/*                  </FormHelperText>*/}
      {/*                </Box>*/}
      {/*            )}*/}
      {/*            <Box sx={{mt: 4}}>*/}
      {/*              <TextField*/}
      {/*                  error={Boolean(formikCreate.touched.last_name && formikCreate.errors.last_name)}*/}
      {/*                  fullWidth*/}
      {/*                  helperText={formikCreate.touched.last_name && formikCreate.errors.last_name}*/}
      {/*                  label="Apellido"*/}
      {/*                  name="last_name"*/}
      {/*                  onBlur={formikCreate.handleBlur}*/}
      {/*                  onChange={formikCreate.handleChange}*/}
      {/*                  value={formikCreate.values.last_name}*/}
      {/*              />*/}
      {/*            </Box>*/}

      {/*            /!* Nombre de Usuario *!/*/}
      {/*            <Box sx={{mt: 4}}>*/}
      {/*              <TextField*/}
      {/*                  error={Boolean(formikCreate.touched.username && formikCreate.errors.username)}*/}
      {/*                  fullWidth*/}
      {/*                  helperText={formikCreate.touched.username && formikCreate.errors.username}*/}
      {/*                  label="Username"*/}
      {/*                  name="username"*/}
      {/*                  onBlur={formikCreate.handleBlur}*/}
      {/*                  onChange={formikCreate.handleChange}*/}
      {/*                  value={formikCreate.values.username}*/}
      {/*              />*/}
      {/*            </Box>*/}

      {/*            /!* Contraseña *!/*/}
      {/*            <Box sx={{mt: 4}}>*/}
      {/*              <TextField*/}
      {/*                  error={Boolean(formikCreate.touched.username && formikCreate.errors.username)}*/}
      {/*                  fullWidth*/}
      {/*                  helperText={formikCreate.touched.password && formikCreate.errors.password}*/}
      {/*                  label="Contraseña"*/}
      {/*                  name="password"*/}
      {/*                  onBlur={formikCreate.handleBlur}*/}
      {/*                  onChange={formikCreate.handleChange}*/}
      {/*                  value={formikCreate.values.password}*/}
      {/*                  type="password" // Esto va a ocultar la contraseña cuando la escribas*/}
      {/*              />*/}
      {/*            </Box>*/}
      {/*            <Box sx={{mt: 2}}>*/}
      {/*              <TextField*/}
      {/*                  error={Boolean(formikCreate.touched.email && formikCreate.errors.email)}*/}
      {/*                  fullWidth*/}
      {/*                  helperText={formikCreate.touched.email && formikCreate.errors.email}*/}
      {/*                  label="Correo electrónico"*/}
      {/*                  name="email"*/}
      {/*                  onBlur={formikCreate.handleBlur}*/}
      {/*                  onChange={formikCreate.handleChange}*/}
      {/*                  value={formikCreate.values.email}*/}
      {/*              />*/}
      {/*            </Box>*/}

      {/*            /!* Campo de "Teléfono" *!/*/}
      {/*            <Box sx={{mt: 4}}>*/}
      {/*              <TextField*/}
      {/*                  error={Boolean(formikCreate.touched.phone && formikCreate.errors.phone)}*/}
      {/*                  fullWidth*/}
      {/*                  helperText={formikCreate.touched.phone && formikCreate.errors.phone}*/}
      {/*                  label="Teléfono"*/}
      {/*                  name="phone"*/}
      {/*                  onBlur={formikCreate.handleBlur}*/}
      {/*                  onChange={formikCreate.handleChange}*/}
      {/*                  value={formikCreate.values.phone}*/}
      {/*              />*/}
      {/*            </Box>*/}

      {/*            /!*Campo de "Descripción"*!/*/}
      {/*            <Box sx={{mt: 4}}>*/}
      {/*                <TextField*/}
      {/*                    error={Boolean(formikCreate.touched.notes && formikCreate.errors.notes)}*/}
      {/*                    fullWidth*/}
      {/*                    helperText={formikCreate.touched.notes && formikCreate.errors.notes}*/}
      {/*                    label="Descripción"*/}
      {/*                    name="notes"*/}
      {/*                    onBlur={formikCreate.handleBlur}*/}
      {/*                    onChange={formikCreate.handleChange}*/}
      {/*                    value={formikCreate.values.notes}*/}
      {/*                />*/}
      {/*            </Box>*/}


      {/*            /!* Campo de "Token para el Código QR". *!/*/}
      {/*            /!* ESTO SE DEBE GENERAR AUTOMÁTICAMENTE. EL USUARIO NO DEBE PODER ESCRIBIR ESTO MANUALMENTE. *!/*/}
      {/*            /!* Puedo dejar que este campo sea de solo lectura únicamente para ver el Token que se enviará a la web *!/*/}
      {/*            /!* app de Django para insertarlo en el QR. *!/*/}
      {/*            <Box sx={{mt: 4}}>*/}
      {/*              <TextField*/}
      {/*                  error={Boolean(formikCreate.touched.token_for_qr_code && formikCreate.errors.token_for_qr_code)}*/}
      {/*                  fullWidth*/}
      {/*                  helperText={formikCreate.touched.token_for_qr_code && formikCreate.errors.token_for_qr_code}*/}
      {/*                  label="Token para el Código QR"*/}
      {/*                  name="token_for_qr_code"*/}
      {/*                  onBlur={formikCreate.handleBlur}*/}
      {/*                  onChange={formikCreate.handleChange}*/}
      {/*                  value={formikCreate.values.token_for_qr_code}*/}
      {/*                  InputProps={{*/}
      {/*                    readOnly: true, // Esto hace que el campo sea de solo lectura.*/}
      {/*                  }}*/}
      {/*              />*/}

      {/*            </Box>*/}

      {/*            /!* Botón para Generar el Token para el Código QR *!/*/}
      {/*            /!* Lo pongo en un <Box> por separado para que haya espacio entre el campo que te muestra el Token *!/*/}
      {/*            /!* generado, y este botón. *!/*/}
      {/*            <Box sx={{mt: 4}}>*/}
      {/*              <Button*/}
      {/*                  variant="contained"*/}
      {/*                  color="primary"*/}
      {/*                  onClick={() => {*/}
      {/*                    formikCreate.setFieldValue('token_for_qr_code', uuidv4());*/}
      {/*                  }}*/}
      {/*              >*/}
      {/*                Generate QR Token*/}
      {/*              </Button>*/}
      {/*            </Box>*/}
      {/*            <Divider sx={{my: 3}}/>*/}
      {/*            <Box*/}
      {/*                sx={{*/}
      {/*                  display: 'flex',*/}
      {/*                  flexWrap: 'wrap',*/}
      {/*                  justifyContent: 'right',*/}
      {/*                  mx: -1,*/}
      {/*                  mb: -1,*/}
      {/*                  mt: 3*/}
      {/*                }}*/}
      {/*            >*/}
      {/*              <NextLink href='/clients'>*/}

      {/*                /!* Botón de "Cancel" / "Cancelar" *!/*/}
      {/*                <Button*/}
      {/*                    sx={{m: 1}}*/}
      {/*                    variant="outlined"*/}
      {/*                >*/}
      {/*                  Cancel*/}
      {/*                </Button>*/}
      {/*              </NextLink>*/}

      {/*              /!* Botón de "Update" para Editar al Cliente Seleccionado. *!/*/}
      {/*              /!* ESTE BOTON SOLO DEBE SER VISIBLE EN /clients/id_del_cliente . *!/*/}
      {/*              <Button*/}
      {/*                  sx={{m: 1}}*/}
      {/*                  type="submit"*/}
      {/*                  variant="contained"*/}
      {/*              >*/}
      {/*                Create*/}
      {/*              </Button>*/}
      {/*            </Box>*/}

      {/*          </Grid>*/}
      {/*        </Grid>*/}
      {/*      </CardContent>*/}
      {/*    </Card>*/}
      {/*</form> /!* Fin del formulario para Crear a un nuevo cliente. *!/*/}


        </Container>
      </Box>




      </>   // Fin de notacion que renderiza el código HTML
        ); // Fin del "return"


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
            <CreateNewClient client={client}/>
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

  // If clientId is undefined, don't include it in the returned props.
  // Yo aquí no voy a meter el ID del cliente, ya que NO estoy editando a un cliente existente. Por lo tanto, no
  // debo poner el ID del cliente aquí. Sino, esta página NUNCA se renderiza.
  return {
    props: {
      props: clientId ? { clientId } : {},
    },
  };
}