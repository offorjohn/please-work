import React, { useState } from 'react';
import { useRouter } from 'next/router';
// import { Form, FormGroup, Label, Input, Button } from 'reactstrap';

import { clientApi } from "../../../../api/client-api"; // Import the client-api.js file, which fetches client data

// Esto importa el archivo con la API que me deja agarrar TODOS los datos del Gimnasio seleccionado
import { gymApiAllData } from "../../../../api/gym-api-all-data";

import axios from 'axios';

// Esto importa los Formularios de Formik
import { useFormik } from 'formik';

// Esto me mostrará mensajes de error si el usuario no llena los campos del formulario
import * as Yup from 'yup';

// Esto me deja crear Formularios con los Estilos de Material-UI para los formularios Formik
import {Card, CardContent, Grid, Typography, TextField, Button, Divider, Box, Container,} from '@mui/material';
import NextLink from "next/link";

// Esto me agrega la Disposición con el Navbar (tanto el de arriba como el de la izquierda)
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';

// Esto creo que es para evitar que alguien entre aquí sin haberse autenticado / logueado
import { AuthGuard } from '../../../../components/authentication/auth-guard';
import Head from "next/head";

// Esto me dejará imprimir mensajes flash de confirmación y de error como se hacen en el resto de la web app de React
import toast from 'react-hot-toast';

/* Página para Enviar Emails Individuales al Cliente Seleccionado usando Mailrelay. Esta página está disponible en la
* URL /clients/client_id/send-email.
*
* Este archivo obligatoriamente se debe llamar index.js. Si le pongo otro nombre, no se renderiza la página.
*
* Sure, here's a step-by-step algorithm to create a new page in your React web app with a form for sending an email:
*
* 1. Create a new file in the `/src/pages` directory. Let's call it `EmailForm.js`.
*
* 2. In `EmailForm.js`, import the necessary modules from React and other libraries. You'll need `React` and `useState`
* from react, `useRouter` from next/router (to access the client ID from the URL), and any components you'll use to
* build the form (like `Form`, `FormGroup`, `Label`, `Input`, and `Button` from reactstrap or similar).
*
* 3. Define a new functional component called `EmailForm`.
*
* 4. Inside `EmailForm`, use the `useRouter` hook to get access to the router object, and then get the client ID from
* the URL parameters.
*
* 5. Declare a state variable for the email body using the `useState` hook.
*
* 6. Create a `handleSubmit` function that will be called when the form is submitted. This function should prevent the
* default form submission behavior, and then it should send the email. For now, it can just log the email body to the
* console.
*
* 7. In the `return` statement of `EmailForm`, render a form with an input field for the email body and a submit button.
* The input field should be controlled by the email body state variable, and the form should call `handleSubmit` when
* submitted.
*
* 8. Finally, export the `EmailForm` component as the default export of the module.
*
* Here's how the code might look:
*
* This is a basic implementation. You would need to replace the `console.log` in `handleSubmit` with actual code to
* send the email. You might also want to add more fields to the form, add validation to the input, handle loading and
* error states, etc.
*
* In your React component, you can use the useRouter hook from next/router to access the router object, which contains
* the URL parameters. The client ID is then retrieved from these parameters and logged to the console.
*
* In this code, useRouter() returns the router object, and router.query is an object that contains the URL parameters.
* The client ID is stored in the clientId property of this object. This ID is then logged to the console.
*
* You can fetch the client data by calling the getClient() function with the clientId as the argument. After fetching
* the data, you can log the client's email address to the console. In this code, React.useEffect() is used to run the
* fetchClientData() function when the component mounts. The fetchClientData() function calls
* clientApi.getClient(clientId) to fetch the client data, and then logs the client's email to the console. If there's
* an error fetching the client data, it's logged to the console with console.error().
*
* The error messages indicate that the clientId is initially undefined, which leads to a failed API request when
* getClient() is called with undefined as the argument. This happens because the useEffect hook is run immediately
* after the component mounts, at which point the clientId from the URL parameters may not be available yet. To fix this,
* you can add a check inside the useEffect hook to ensure that clientId is defined before calling getClient(). If
* clientId is undefined, the function should return immediately to prevent the API request from being made. With this
* change, the getClient() function will only be called when clientId is defined, which should prevent the error
* messages from being printed to the console.
*
* Para coger el nombre del gimnasio: así como agarré el email del gimnasio, ahora agarraré el nombre del gimnasio, lo
* pondré en una nueva variable usando algo como “const setNameOfGym”, y lo enviaré por JSON usando una API a la API de
* Mailrelay en la web app de Django.
* */

const Index = () => {
  const router = useRouter();
  // const { id } = router.query; // This is the client ID from the URL

  const { clientId } = router.query; // This gets the client ID from the URL

  // Esta es la variable en donde se meterá el email del cliente. Inicialmente es nula.
  const [clientEmail, setClientEmail] = useState(null);

  // Aquí meteré el email del Gimnasio del model ode Gimnasio a la API de Django para enviar emails por Mailrelay
  const [gymEmail, setGymEmail] = useState(null);

  // Esto coge el nombre del Gimnasio del modelo de Gimnasio
  const [gymName, setGymName] = useState(null);

  // Esto coge el nombre del Cliente del modelo de Account (del Usuario)
  const [clientName, setClientName] = useState(null);

  // Esto coge el nombre de usuario del Cliente del modelo de Account (del Usuario)
  const [clientUsername, setClientUsername] = useState(null);

  /* This fetches the Client data when the component mounts.
  *
  * I will concatenate the name and last_name fields with a space in between and assign the result to the
  * clientName state variable.
  */
  React.useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId) {
        return; // Si el ID del cliente es nula /undefined, no hagas nada para evitar mensajes de error en la consola
      }

      // Si el ID del cliente no es nula, entonces llama a la API de Django para obtener los datos del cliente
      try {
        const client = await clientApi.getClient(clientId);

        setClientEmail(client.email); // Esto mete en la variable clientEmail el email del cliente para usarla después

        // Esto me coge el nombre completo del cliente concatenando el nombre y apellido
        setClientName(client.first_name + " " + client.last_name);

        // Esto me coge el nombre de usuario del cliente
        setClientUsername(client.username);

        // // DEBUGGEO. BORRAR. Esto imprime el nombre del Cliente seleccionado en la consola.
        // console.log(client.first_name + " " + client.last_name);

        // console.log(client.email); // Log the client's email to the console
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    fetchClientData();
  }, [clientId]); // Re-run this effect if clientId changes

  // Esto mete el cuerpo del email en una variable permanente despues de agarrarlo de la llamada a la API del Cliente.
  // Necesito crear esto, o el Formulario del Email NO se renderizará.
  const [emailBody, setEmailBody] = useState('');

  // Esto mete el Título del email en una variable permanente.
  // Necesito crear esto, o el Formulario del Email NO se renderizará.
  const [emailTitle, setEmailTitle] = useState('');

  /* Funcion que agarra los datos del Gimnasio seleccionado. Por los momentos, voy a poner "hard-coded" que el gimnasio
  * seleccionado sea el Gimnasio con ID 1.
  *
  * Cuando sepa como meter varios gimnasios, quitaré el "1" de la ID del Gimnasio que ahorita está hard-coded, y
  * veré como coger la ID del Gimnasio seleccionado sin usar una ID hard-coded.
  * */
  React.useEffect(() => {
    const fetchGymData = async () => {
      try {

        // Esto llama a la API para agarrar el Gimnasio, y me da la clae de Stripe del Gimnasio seleccionado.
        // YO NO QUIERO ESO. Yo quiero todos los datos del Gimnasio seleccionado.

        const gym = await gymApiAllData.getGym("1"); // Meteré la ID del gimnasio hard-coded por los momentos

        setGymEmail(gym.email); // Esto mete en la variable gymEmail el email del Gimnasio del JSON para usarlo después
        setGymName(gym.name); // Esto mete en la variable gymName el nombre del Gimnasio del JSON para usarlo después

        // console.log(gym.email); // DEBUGGEO. BORRAR. Log the gym's email to the console

        // // DEBUGGEO. BORRAR. Esto imprime todos los datos del Gimnasio seleccionado en la consola.
        // // BUG: esto solo me está agarrando la Clave de Stripe. No agarra nada más
        // console.log(gym);
      } catch (error) {
        console.error('Error fetching gym data:', error);
      }
    };

    fetchGymData();
  }, []); // Empty dependency array as gym ID is hard-coded

  // console.log(clientId); // DEBUG: This correctly logs the client ID to the console

  // console.log(id); // Log the client ID to the console. It's printing "undefined".


  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   console.log(emailBody);
  //   // Here you would send the email
  // };

  /* Esto llama la API de Mailrelay de la web app de Django para enviar el email al cliente seleccionado.
  *
  * In this code, I've replaced the console.log(emailBody) line with an axios.post call to send the email body to your
  * API. The URL of the API is ${process.env.NEXT_PUBLIC_API_ROOT}/api/mailrelay-email/, as you specified. The data
  * sent to the API is an object with emailBody as a property. If the API call is successful, a confirmation message is
  * printed to the console with the response data from the API. If there's an error, it's printed to the console with
  * console.error.
  *
  * To include the client's email address in the API call, you can modify the handleSubmit function to include a new
  * property in the data object that's sent to the API. You can fetch the client's email address in the useEffect hook
  * where you're already fetching the client data, and store it in a state variable. Then, you can use this state
  * variable in the handleSubmit function. In this code, I've added a new state variable clientEmail to store the
  * client's email address. This email address is fetched in the useEffect hook where the client data is fetched, and
  * it's set with setClientEmail(client.email). Then, in the handleSubmit function, clientEmail is included in the data
  * object that's sent to the API.
  *
  * También voy a meter el Email del Gimnasio del modelo de Gimnasio aquí para enviar emails por Mailrelay. El email
  * desde el que se va enviar el correo NO se va a tomar del .env, sino que se tomará del email que esté guardado en el
  * gimnasio del modelo de Gimnasio.
  *
  * Cogeré también el nombre del Cliente, y lo pondré en el Email enviado por Mailrelay.
  *
  * The selected code snippet already contains the logic to redirect the user to the /clients page after a successful
  * email send operation. The line router.push('/clients'); is responsible for this redirection.  However, if you're
  * experiencing issues with the redirection, it might be due to the router object not being defined in the current
  * scope. Make sure you have defined the router object using the useRouter hook from next/router at the beginning of
  * your component.
  *
  * In this code, toast.success('Email sent successfully') will display a success message when the email is sent
  * successfully, and toast.error('Error sending email') will display an error message if there's an error sending the
  * email.
  * */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Si el email se envía correctamente
    try {
      // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/mailrelay-email/`);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/mailrelay-email/`, {
        emailBody: emailBody, // Esto envía el cuerpo del email a la API de Django
        emailTitle: emailTitle, // Esto envía el título del email a la API de Django
        clientEmail: clientEmail, // Dirección de email del cliente, el cual fue tomado anteriormente
        gymEmail: gymEmail, // Dirección de email del Gimnasio, el cual fue tomado anteriormente
        gymName: gymName, // Nombre del Gimnasio
        clientName: clientName, // Nombre Completo del Cliente
        // Include any other data you want to send here
      });

      // // DEBUGGEO. BORRAR DESPUES.
      // console.log('Email sent successfully:', response.data);

      // Quiero mostrarle un mensaje flash de confirmación al usuario de que el email se envió correctamente.
      // Display a success toast message
      toast.success('Se ha enviado correctamente el email.');


      // Voy a redirigir al usuario a la lista de clientes después de que se envíe el email
      router.push('/clients');


    // Esto imprime un mensaje de error si no se pudo enviar el email
    } catch (error) {

      // Display an error toast message
      toast.error('Error: No se pudo enviar el email.');

      // Dejaré el mensaje de error de debuggeo en el inspector para saber cual fue el error
      console.error('Error sending email:', error);
    }
  };  // Fin de la función handleSubmit que llama a la API de Mailrelay

  return (
      /* HTML con el Formulario para Enviar el Email.
      *
      * I've added a new FormGroup for the email title above the existing one for the email body. The Input component in
      * this new FormGroup has type="text" to create a text input field. The name and id props are set to "emailTitle",
      * and the value prop is set to the emailTitle state variable. The onChange prop is set to a function that updates
      * the emailTitle state variable whenever the input field's value changes.
      *
      * Please note that you'll need to declare
      * the emailTitle state variable using the useState hook at the beginning of your component. You need to declare a
      * new state variable emailTitle and a function setEmailTitle to update it. The initial value of emailTitle is an
      * empty string.
      *
      * Le voy a agregar los estilos de Material-UI de los formularios Formik como el de la página para Editar a los
      * Clientes a esta página.
      *
      * Para que haya espacio entre los campos "Título" y "Mensaje", es decir, para agregarle padding vertical
      * entre esos 2 campos, usaré las etiquetas "<Box>".
      *
      * To create a textarea field in Material-UI, you can use the TextField component with the multiline prop set to
      * true. You can also use the rows prop to specify the number of rows the textarea should have. the multiline prop
      * allows the TextField to accept multiple lines of input, effectively turning it into a textarea. The rows prop
      * sets the number of rows in the textarea, which determines its height. You can adjust the number of rows as
      * needed.
      *
      * Para centrar horizontalmente los botones de "Enviar Email" y "Cancelar", usaré "justifyContent: center" en
      * lugar de "justifyContent: right".
      *
      * El título del Formulario dentro del "Card", el cual tiene el email del usuario, estára fuera del Grid 1x3.
      * Así, ocupará todo el ancho de la pantalla, si fuera necesario. Y así, el email no se va a ir a la línea por
      * debajo de "Email para:". Luego, habrá un espacio vacío a la izquierda de los campos de Título y Mensaje, el
      * cual ocupará 1/3 del ancho de la pantalla. El resto de los 2/3 de la pagina los ocuparán los campos de Título
      * y Mensaje.
      *
      * I've added the required attribute to the TextField components for the email title and body. This will prevent
      * the form from being submitted if these fields are empty.
      * */
      <>
        {/* Texto que saldrá en la Pestaña del Navegador */}
        <Head>
          <title>
            Formulario de Email
          </title>
        </Head>

        {/* Esto va a encerrar todo el Formulario en un contenedor tipo "Card" */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8
          }}
        >
          {/* Otro tipo de Contenedor para hacer que el Formulario se vea bonito */}
          <Container maxWidth="xl">

            {/* Contenedor que es probablemente solo para el título */}
            <Box sx={{ mb: 4 }}>

              {/* Grid de 1x3 (1 fila y 3 columnas) para poner el Título de la página */}
              <Grid
                container
                justifyContent="space-between"
                spacing={3}
              >
                {/* Título de la Página. Incluiré el nombre de Usuario del Cliente. */}
                <Grid item>
                  <Typography variant="h4">
                    Contactar por Email a {clientUsername}
                  </Typography>
                </Grid>
              </Grid>
            </Box> {/* Fin del contenedor probablemente solo para el título */}
            <form onSubmit={handleSubmit}>
              <Card sx={{mt: 3}}>
                <CardContent>

                  {/* Título del Formulario. Mostraré el email del cliente */}
                  <Typography variant="h6">
                    Email para: {clientEmail}
                  </Typography>

                  {/* Grid de 1x3 para el Formulario en sí. Esto hará más angosto los campos de Título y Mensaje. */}
                  <Grid container spacing={3}>

                    {/* Columna 1: Espacio vacío a la izquierda de la página */}
                    <Grid item md={4} xs={12}>
                        {/* Espacio vacío a la izquierda de la página */}
                    </Grid>

                    {/* Columna 2: Título y Mensaje del Email */}
                    <Grid item md={8} xs={12}>

                      {/* El <Box> me permitirá agregar padding vertical entre el Campo "Titulo" y "Mensaje" */}
                      {/* Título del Email */}
                      <Box sx={{ mt: 4 }}>
                          <TextField
                              id="emailTitle"
                              label="Título del Mensaje"
                              value={emailTitle}
                              onChange={(e) => setEmailTitle(e.target.value)}
                              fullWidth
                              required // Esto hace que el campo sea obligatorio
                          />
                      </Box>

                      {/* Mensaje o Cuerpo del Email. Es un <textarea>. */}
                      {/* El <Box> me permitirá agregar padding vertical entre el Campo "Titulo" y "Mensaje" */}
                      <Box sx={{ mt: 4 }}>
                        <TextField
                            id="emailBody"
                            label="Mensaje"
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            fullWidth
                            multiline
                            rows={10} // Modificar esto para hacer que este campo sea más alto
                            required  // Esto hace que el campo sea obligatorio
                        />
                      </Box>
                    </Grid> {/* Fin de la Columna 2: Título y Mensaje del Email */}
                  </Grid> {/* Fin del Grid de 1x3 para el Formulario en sí. */}
                </CardContent>
              </Card> {/* Fin del contenedor tipo "Card" con el color Azul Marino */}

              {/*Botón viejo para Enviar el Formulario. NO USAR*/}
              {/*<Button type="submit">Enviar Email</Button>*/}

              {/* Línea divisoria estilo "hr" */}
              {/*<Divider sx={{ my: 3 }} />*/}

              {/* Botones de Update y Cancel. */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  // justifyContent: 'right',
                  justifyContent: 'center', // Changed from 'right' to 'center'
                  mx: -1,
                  mb: -1,
                  mt: 3
                }}
              >
                 {/* Botón de "Cancel" / "Cancelar". Esto de devuelve a la lista de Clientes */}
                <NextLink href='/clients'>
                <Button
                  sx={{ m: 1 }}
                  variant="outlined"
                >
                  Cancelar
                </Button>
                </NextLink>

                {/* Botón para Enviar el Email */}
                <Button
                  sx={{ m: 1 }}
                  type="submit"
                  variant="contained"
                >
                  Enviar Email
                </Button>
              </Box>
              {/* Fin de los Botones de Update y Cancel. */}
            </form>
            </Container> {/* Fin del contenedor tipo "Container" */}
        </Box>  {/* Fin del contenedor tipo "Card" */}
      </>



      // <Form onSubmit={handleSubmit}>
      //
      //   {/* Título del Email */}
      //   <FormGroup>
      //     <Label for="emailTitle">Título del Mensaje</Label>
      //     <Input
      //       type="text"
      //       name="emailTitle"
      //       id="emailTitle"
      //       value={emailTitle}
      //       onChange={(e) => setEmailTitle(e.target.value)}
      //     />
      //   </FormGroup>
      //
      //   {/* Mensaje o Cuerpo del Email */}
      //   <FormGroup>
      //     <Label for="emailBody">Mensaje</Label>
      //     <Input
      //       type="textarea"
      //       name="emailBody"
      //       id="emailBody"
      //       value={emailBody}
      //       onChange={(e) => setEmailBody(e.target.value)}
      //     />
      //   </FormGroup>
      //   <Button type="submit">Enviar Email</Button>
      // </Form>
  );
};

/* Esto me agrega la Disposición con el Navbar (tanto el de arriba como el de la izquierda) a la página de Enviar
* Emails.
*
* Y, al parecer, solo puedes verlo si estás autenticado, logueado.
*
* To add the side navbar to the send-email\index.js file, you need to wrap the main content of the page with the
* DashboardLayout component, similar to how it's done in the clients/index.js file. In this code, the DashboardLayout
* and AuthGuard components are imported at the top of the file. Then, a getLayout function is added to the Index
* component. This function takes the page (which is the Index component itself) as an argument and returns a new
* component with the page wrapped inside the DashboardLayout and AuthGuard components. This will add the side navbar to
* the send-email\index.js page.
* */
Index.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default Index;