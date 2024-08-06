import React, { useState } from 'react';
import { useRouter } from 'next/router';
// import { Form, FormGroup, Label, Input, Button } from 'reactstrap';

import { clientApi } from "../../../api/client-api"; // Import the client-api.js file, which fetches client data

// Esto importa el archivo con la API que me deja agarrar TODOS los datos del Gimnasio seleccionado
import { gymApiAllData } from "../../../api/gym-api-all-data";

import axios from 'axios';

// Esto importa los Formularios de Formik
import { useFormik } from 'formik';

// Esto me mostrará mensajes de error si el usuario no llena los campos del formulario
import * as Yup from 'yup';

// Esto me deja crear Formularios con los Estilos de Material-UI para los formularios Formik
import {Card, CardContent, Grid, Typography, TextField, Button, Divider, Box, Container,} from '@mui/material';
import NextLink from "next/link";

// Esto me agrega la Disposición con el Navbar (tanto el de arriba como el de la izquierda)
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';

// Esto creo que es para evitar que alguien entre aquí sin haberse autenticado / logueado
import { AuthGuard } from '../../../components/authentication/auth-guard';
import Head from "next/head";

// Esto me dejará imprimir mensajes flash de confirmación y de error como se hacen en el resto de la web app de React
import toast from 'react-hot-toast';

/* Página para Subir Documentos si eres un Administrador. Puedes entrar a esta página desde esta URL:
* /documents/upload-documents .
*
* Awesome. Now, I want this React page to have a formset (or its equivalent in React), so that users can upload multiple
* documents within this form. So, tell me how to modify this form field so that users can upload files, and so that, if
* the useer wants to upload more than one file, create a "+" button in which, if users click on it, another input field
* will show up to let users upload an additional file. So, if the user wants to upload 5 files, the user will have to
* click 4 times in the "+" button, so that 4 new input fields show up.
*
* To achieve this, you can use the concept of React state to manage an array of file inputs. You can start with a single
* file input and a "+" button. When the "+" button is clicked, you can add a new file input to the array.
*
* First, initialize a state variable to hold the file inputs. You can use the `useState` hook for this.
*
* Next, create a function to handle the "+" button click. This function should add a new element to the `fileInputs`
* array.
*
* Then, in your JSX, map over the `fileInputs` array to render a file input for each element in the array. Also, render
* a "+" button that calls the `addFileInput` function when clicked.
*
* This will create a new file input each time the "+" button is clicked. Note that each file input is given a unique
* `key` prop to satisfy React's requirement for rendering lists of elements.
* */

const Index = () => {
  const router = useRouter();
  // const { id } = router.query; // This is the client ID from the URL

  const { clientId } = router.query; // This gets the client ID from the URL

  // // Esta es la variable en donde se meterá el email del cliente. Inicialmente es nula.
  // const [clientEmail, setClientEmail] = useState(null);

  // // Aquí meteré el email del Gimnasio del model ode Gimnasio a la API de Django para enviar emails por Mailrelay
  // const [gymEmail, setGymEmail] = useState(null);

  // // Esto coge el nombre del Gimnasio del modelo de Gimnasio
  // const [gymName, setGymName] = useState(null);

  // // Esto coge el nombre del Cliente del modelo de Account (del Usuario)
  // const [clientName, setClientName] = useState(null);

  // // Esto coge el nombre de usuario del Cliente del modelo de Account (del Usuario)
  // const [clientUsername, setClientUsername] = useState(null);

  // Array que me permitirá crear Formset para Subir múltiples documentos
  const [fileInputs, setFileInputs] = useState([0]);

  // Función que, al clicar el botón del "+", agregará una Casilla adicional al Formset para subir archivos
  const addFileInput = () => {
    setFileInputs([...fileInputs, fileInputs.length]);
  };

  // Initialize state variables for document type name and files

  // Esta variable almacenará el nombre del Tipo de Documento que haya escrito el usuario en el Formulario
  const [documentTypeName, setDocumentTypeName] = useState('');

  // Esta variable almacenará cada uno de los archivos subidos en el formset del Formulario
  const [files, setFiles] = useState([]);

  // Update state variables when form fields change
  const handleDocumentTypeNameChange = (e) => {
    setDocumentTypeName(e.target.value);
  };

  /* Función que mete cada archivo subido en el formset del formulario en una variable permanente.
  *
  * Esta función es llamada cada vez que el usuario suba un archivo en las casillas para subir archivos, es decir,
  * con un onChange en el input que detecta si subiste un archivo.
  *
  * Esto es lo que me corrigió el bug que no me dejaba enviar archivos a la web app de Django, y el bug que me
  * imprimía un mensaje toast de error cuando enviaba el formulario al clicar en "Registrar".
  *
  * To create a `handleFileChange` function in your `index.js` file, you'll want to follow these steps in pseudocode:
  *
  * 1. Define the `handleFileChange` function. This function should take an event parameter since it will be triggered
  * by an input change event.
  *
  * 2. Inside the function, check if files were uploaded by accessing `event.target.files`. This is an array-like object
  * of all the files uploaded.
  *
  * 3. You might want to store these files in your component's state so you can access them later (e.g., when
  * submitting a form). Use a state hook like `useState` to create a state variable for storing the files.
  *
  * 4. Update the state with the files from `event.target.files`. If you're allowing multiple files, you might want to
  * spread the existing files and the new files into a new array. If only a single file is allowed, just set the state
  * to the first file in `event.target.files`.
  *
  * This code snippet includes a state variable `files` to store the uploaded files and a `handleFileChange` function
  * that updates this state whenever new files are selected. The `multiple` attribute on the `<input>` tag allows
  * multiple files to be selected. If you only want to allow a single file, remove the `multiple` attribute and
  * uncomment the line in `handleFileChange` that sets the state to the first file only.
  * */
  const handleFileChange = (e) => {

    // If allowing multiple files, concatenate the new files with any existing ones
    const uploadedFiles = event.target.files;
    setFiles(currentFiles => [...currentFiles, ...uploadedFiles]);

    // If only a single file is allowed, just set the state to the first file
    // setFiles(event.target.files[0]);


    // setFiles(e.target.files);
  };

  // /* This fetches the Client data when the component mounts.
  // *
  // * I will concatenate the name and last_name fields with a space in between and assign the result to the
  // * clientName state variable.
  // */
  // React.useEffect(() => {
  //   const fetchClientData = async () => {
  //     if (!clientId) {
  //       return; // Si el ID del cliente es nula /undefined, no hagas nada para evitar mensajes de error en la consola
  //     }
  //
  //     // Si el ID del cliente no es nula, entonces llama a la API de Django para obtener los datos del cliente
  //     try {
  //       const client = await clientApi.getClient(clientId);
  //
  //       setClientEmail(client.email); // Esto mete en la variable clientEmail el email del cliente para usarla después
  //
  //       // Esto me coge el nombre completo del cliente concatenando el nombre y apellido
  //       setClientName(client.first_name + " " + client.last_name);
  //
  //       // Esto me coge el nombre de usuario del cliente
  //       setClientUsername(client.username);
  //
  //       // console.log(client.email); // Log the client's email to the console
  //     } catch (error) {
  //       console.error('Error fetching client data:', error);
  //     }
  //   };
  //
  //   fetchClientData();
  // }, [clientId]); // Re-run this effect if clientId changes

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

        // setGymEmail(gym.email); // Esto mete en la variable gymEmail el email del Gimnasio del JSON para usarlo después
        // setGymName(gym.name); // Esto mete en la variable gymName el nombre del Gimnasio del JSON para usarlo después

        // console.log(gym.email); // DEBUGGEO. BORRAR. Log the gym's email to the console

        // // DEBUGGEO. BORRAR. Esto imprime todos los datos del Gimnasio seleccionado en la consola.
        // // BUG: esto solo me está agarrando la Clave de Stripe. No agarra nada más
        // console.log(gym);
      } catch (error) {
        console.error('Error fetching gym data:', error);
      }
    };

    // fetchGymData();
  }, []); // Emopty dependency array as gym ID is hard-coded

  // console.log(clientId); // DEBUG: This correctly logs the client ID to the console

  // console.log(id); // Log the client ID to the console. It's printing "undefined".


  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   console.log(emailBody);
  //   // Here you would send the email
  // };

  /* API para Subir los Documentos a la API de Django cuando el usuario clica en el botón de "Registrar."
  *
  * Tengo que coger la ID del gimnasio aquí, porque necesito meter una instancia de alguno de los gimnasios en el
  * modelo de "Tipo de Documento". Sino, me saldrá un mensaje de error.
  *
  * COMO POR LOS MOMENTOS SOLO ESTOY TRABAJANDO CON UN GIMNASIO, VOY A PONER LA ID DEL GIMNASIO HARD-CODED. ESTO
  * LO DEBO CAMBIAR DESPUÉS.
  *
  * Necesito agarrar el Nombre del Tipo de Documento y los Archivos que se subirán del Formulario de esta página, y
  * luego, pasaré esos datos a la llamada de la API usando Axios para mandar esos datos como un POST request a la API
  * de Django. Creo que, al enviar datos usando un POST request, NO SE ENVÍAN los datos usando JSON.
  *
  * Lo que haré será que, al clicar en el botón “Registrar”, llamaré a una función JS aunque llama a una API. Esa API
  * tiene que llamar a un view de Django. Ese view será una API que aceptará codigo JSON que aceptará código de la web
  * app de React. Tendré que usar axios desde la web app de React.
  *
  * Pues, también tengo que crear una API en mi web app de Django, la cual tomará codigo JSON, y me dará una
  * respuesta JSON. Lo que debe hacer este view de Django es primero meter el nombre del Tipo de Documento en el
  * modelo de Tipo de Documentos, y luego meter el/los archivos subidos por el formset al modelo de Archivos
  * Individuales.
  *
  * Luego, cuando se haga todo esto, se debe dar una respuesta de JSON que diga algo como “HTTP 200: success” a la
  * web app de React de Administradores. Cuando esto ocurra, debo redirigir al usuario con un Toast message de
  * Confirmación a otra página. Idealmente, esta página debería ser la Lista de Documentos subidos. Pero, como no he
  * creado esa página, voy a redirigir al usuario al Home Page de la web app de React de Administradores.
  *
  * PERO, si sale un error (por ejemplo, el usuario subio tipos de archivos que no debió o algo parecido), debo mostrar
  * un mensaje de error con un mensaje Toast, y debo mantener al usuario en la página de subir archivos.
  *
  * Based on your code, it seems like you're missing the state variables for `documentTypeName` and `files`. You need
  * to define these state variables and update them when the form fields change.
  *
  * In this code, I've added state variables `documentTypeName` and `files` to hold the values of the document type
  * name field and the file input field, respectively. I've also added change handlers `handleDocumentTypeNameChange`
  * and `handleFileChange` to update these state variables when the form fields change. These state variables and
  * change handlers are used in the form fields and the `handleSubmit` function.
  *
  * */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Si se Suben los Documentos correctamente
    try {

      // Prepare the form data
      const formData = new FormData();

      // Replace 'documentTypeName' with the actual document type name
      formData.append('document_type_name', documentTypeName);

      // Meteré la ID del Gimnasio de manera hard-coded como "1" por los momentos.
      // CORREGIR DESPUES con la verdadera ID del Gimnasio seleccionado.
      formData.append('gym_id', "1");

      // Append the files to the form data
      // files.forEach((file, index) => {
      //   formData.append(`file${index + 1}`, file); // Replace 'file' with the actual file object
      // });

      // Esto mete los archivos del Formset en el FormData.
      // ACTIVAR DESPUES
      // Append each file under the 'documents' key
      for (let i = 0; i < files.length; i++) {
        formData.append('documents', files[i]);
      }

      // for (let i = 0; i < files.length; i++) {
      //   formData.append(`file${i + 1}`, files[i]);
      // }

      // // Esto imprime en la consola los datos del formulario. DEBUGGEO. BORRAR DESPUES.
      // console.log('Form data:', formData);

      // Make the POST request to the Django API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/upload_documents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/mailrelay-email/`);

      // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/mailrelay-email/`, {
      //   emailBody: emailBody, // Esto envía el cuerpo del email a la API de Django
      //   emailTitle: emailTitle, // Esto envía el título del email a la API de Django
      //   clientEmail: clientEmail, // Dirección de email del cliente, el cual fue tomado anteriormente
      //   gymEmail: gymEmail, // Dirección de email del Gimnasio, el cual fue tomado anteriormente
      //   gymName: gymName, // Nombre del Gimnasio
      //   clientName: clientName, // Nombre Completo del Cliente
      //   // Include any other data you want to send here
      // });

      // // DEBUGGEO. BORRAR DESPUES.
      // console.log('Email sent successfully:', response.data);

      // Quiero mostrarle un mensaje flash de confirmación al usuario de que el email se envió correctamente.
      // Display a success toast message
      toast.success('Se han registrado correctamente los documentos.');


      // Voy a redirigir al usuario a la lista de clientes después de que se suban los documentos.
      // CORREGIR para redirigir al usuario a la página de "Documentos Subidos" después de que se suban los documentos.
      router.push('/dashboard');


    // Esto imprime un mensaje de error si no se pudo enviar el email
    } catch (error) {

      // Display an error toast message
      toast.error('Error: No se pudieron enviar los documentos.');

      // Dejaré el mensaje de error de debuggeo en el inspector para saber cual fue el error
      console.error('Error. No se pudieron registrar los documentos:', error);
    }
  };  // Fin de la función handleSubmit que llama a la API para Subir los Documentos

  return (
      /* HTML del Formulario para Subir Documentos.
      *
      * Le asigné en el "value" y en el "name" de los 2 campos de este formulario unos nombres de variable que
      * van a ser luego llamados por la API que voy a llamar con Axios para subir los documentos.
      *
      * Cuando suba cada archivo en el formset, le voy a asignar un "name" único a cada archivo. Esto lo hago
      * para que, cuando se suban los archivos, la API de Django pueda agarrar cada archivo por su nombre único. Sino,
      * no me detecta ni un solo archivo. Para agregarle un nombre único usando un "name", usaré la variable
      * "{index}", para así generarle un número único y concatenarle ese número único al nombre del archivo.
      *
      * Para subir los archivos, usaré una función de JS llamada handleFileChange() cada, y el atributo "multiple".
      * La función handleFileChange() la definí arrriba, y la voy a llamar cada vez que suba un archivo usando un
      * onChange como event listener.
      *
      *
      * */
      <>
        {/* Texto que saldrá en la Pestaña del Navegador */}
        <Head>
          <title>
            Formulario Para Subir Documentos
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
                {/* Título de la Página. */}
                <Grid item>
                  <Typography variant="h4">
                    Subir Documentos
                  </Typography>
                </Grid>
              </Grid>
            </Box> {/* Fin del contenedor probablemente solo para el título */}
            <form onSubmit={handleSubmit}>
              <Card sx={{mt: 3}}>
                <CardContent>

                  {/* Título del Formulario. Mostraré el email del cliente */}
                  <Typography variant="h6">
                    Datos del Documento:
                      {/*{clientEmail}*/}
                  </Typography>

                  {/* Grid de 1x3 para el Formulario en sí. Esto hará más angosto los campos de Título y Mensaje. */}
                  <Grid container spacing={3}>

                    {/* Columna 1: Espacio vacío a la izquierda de la página */}
                    <Grid item md={4} xs={12}>
                        {/* Espacio vacío a la izquierda de la página */}
                    </Grid>

                    {/* Columna 2: Campos del Formulario */}
                    <Grid item md={8} xs={12}>

                      {/* El <Box> me permitirá agregar padding vertical entre cada Campo */}
                      {/* Nombre del Documento */}
                      <Box sx={{ mt: 4 }}>
                          <TextField
                              // id="documentTitle"
                              label="Nombre del Documento"
                              // value={emailTitle}
                              // onChange={(e) => setEmailTitle(e.target.value)}
                              id="documentTypeName"
                              name="documentTypeName"
                              value={documentTypeName}
                              onChange={handleDocumentTypeNameChange}
                              // onChange={(e) => setDocumentTypeName(e.target.value)}
                              fullWidth
                              required // Esto hace que el campo sea obligatorio
                          />
                      </Box>

                      {/* Formset para agregar Uno o Más Documentos */}

                      {/* Título del Formset para Subir uno o más Archivos */}
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">Documento(s) a subir</Typography>
                      </Box>
                      {/* Campo tipo "file "para Subir un Documento usando un Formset */}
                      {/* Render file inputs with unique names and handle changes individually */}
                      {fileInputs.map((input, index) => (
                          <Box key={index} sx={{mt: 4}}>
                            {/*<input type="file" name={`documentFile${index}`} />*/}
                            {/*<input type="file" name="documentFile" onChange={handleFileChange} multiple/>*/}

                            <input
                                type="file"
                                name={`documentFile${index}`}
                                onChange={(event) => handleFileChange(index, event)}
                                multiple
                            />
                          </Box>
                      ))}

                      {/* Botón del "+" para agregar una nueva casilla tipo "file" para subir archivos */}
                      <Button onClick={addFileInput}>+</Button>

                      {/* Fin del Formset para agregar uno o más documentos */}

                      {/* El <Box> me permitirá agregar padding vertical entre cada campo */}
                      <Box sx={{ mt: 4 }}>




                        {/*<TextField*/}
                        {/*    id="emailBody"*/}
                        {/*    label="Mensaje"*/}
                        {/*    value={emailBody}*/}
                        {/*    onChange={(e) => setEmailBody(e.target.value)}*/}
                        {/*    fullWidth*/}
                        {/*    multiline*/}
                        {/*    required  // Esto hace que el campo sea obligatorio*/}
                        {/*/>*/}
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

                {/* Botón para Registrar el Documento */}
                <Button
                  sx={{ m: 1 }}
                  type="submit"
                  variant="contained"
                >
                  Registrar
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

/* Esto me agrega la Disposición con el Navbar (tanto el de arriba como el de la izquierda) a esta página.
*
* Y, al parecer, solo puedes verlo si estás autenticado, logueado.
*
* To add the side navbar to this page, you need to wrap the main content of the page with the
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

// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import Head from 'next/head';
// import NextLink from "next/link";
//
// // Esto me deja crear Formularios con los Estilos de Material-UI para los formularios Formik
// import {
//   Box,
//   Button,
//   Card,
//   Container,
//   Divider,
//   Grid,
//   InputAdornment,
//   Tab,
//   Tabs,
//   TextField,
//   Typography,
//   CardContent
// } from '@mui/material';
// import { DateTimePicker } from '@mui/x-date-pickers';
// import { clientApi } from '../../../api/client-api';
//
// // Esto me agrega la Disposición con el Navbar (tanto el de arriba como el de la izquierda)
// import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
// // import { ClientListTable } from '../../../components/client/client-list-for-uploading-documents';
// import { useMounted } from '../../../hooks/use-mounted';
// import { Download as DownloadIcon } from '../../../icons/download';
// import { Plus as PlusIcon } from '../../../icons/plus';
// import { Search as SearchIcon } from '../../../icons/search';
// import { Upload as UploadIcon } from '../../../icons/upload';
// import { gtm } from '../../../lib/gtm';
//
// // Esto creo que es para evitar que alguien entre aquí sin haberse autenticado / logueado
// import { AuthGuard } from '../../../components/authentication/auth-guard';
// import { productApi } from '../../../api/product-api';
// import { subscriptionApi } from '../../../api/subscription-api';
// import { voucherApi } from '../../../api/voucher-api';
// import { serviceApi } from '../../../api/service-api';
//
//
// import { useRouter } from 'next/router';
// // import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
//
// // Esto importa el archivo con la API que me deja agarrar TODOS los datos del Gimnasio seleccionado
// import { gymApiAllData } from "../../../api/gym-api-all-data";
//
// import axios from 'axios';
//
// // Esto importa los Formularios de Formik
// import { useFormik } from 'formik';
//
// // Esto me mostrará mensajes de error si el usuario no llena los campos del formulario
// import * as Yup from 'yup';
//
// // Esto me dejará ver la lista de Clientes junto con el filtro que me deja buscarlos rápidamente
// import { CustomerListTable } from '../../../components/dashboard/customer/customer-list-table';
//
// // Esto me dejará imprimir mensajes flash de confirmación y de error como se hacen en el resto de la web app de React
// import toast from 'react-hot-toast';
//
// /* Página para Subir Documentos si eres un Administrador. Puedes entrar a esta página desde esta URL:
// * /documents/upload-documents .
// *
// * Awesome. Now, I want this React page to have a formset (or its equivalent in React), so that users can upload multiple
// * documents within this form. So, tell me how to modify this form field so that users can upload files, and so that, if
// * the useer wants to upload more than one file, create a "+" button in which, if users click on it, another input field
// * will show up to let users upload an additional file. So, if the user wants to upload 5 files, the user will have to
// * click 4 times in the "+" button, so that 4 new input fields show up.
// *
// * To achieve this, you can use the concept of React state to manage an array of file inputs. You can start with a single
// * file input and a "+" button. When the "+" button is clicked, you can add a new file input to the array.
// *
// * First, initialize a state variable to hold the file inputs. You can use the `useState` hook for this.
// *
// * Next, create a function to handle the "+" button click. This function should add a new element to the `fileInputs`
// * array.
// *
// * Then, in your JSX, map over the `fileInputs` array to render a file input for each element in the array. Also, render
// * a "+" button that calls the `addFileInput` function when clicked.
// *
// * This will create a new file input each time the "+" button is clicked. Note that each file input is given a unique
// * `key` prop to satisfy React's requirement for rendering lists of elements.
// * */
//
// /* Esto muestra la Lista de Clientes en la URL /clients.
// *
// * Voy a agregar una funcionalidad aquí para poder enviar emails por Mailrelay usando una API que tengo en la web app
// * en Django.
// * */
//
// // const tabs = [
// //   {
// //     label: 'All',
// //     value: 'all'
// //   },
// // ];
// //
// // const sortOptions = [
// //   {
// //     label: 'Date joined (newest)',
// //     value: 'date_joined|desc'
// //   },
// //   {
// //     label: 'Date joined (oldest)',
// //     value: 'date_joined|asc'
// //   },
// //   {
// //     label: 'Username (A-Z)',
// //     value: 'username|desc'
// //   },
// //   {
// //     label: 'Username (Z-A)',
// //     value: 'username|asc'
// //   }
// // ];
// //
// // const genreOptions = [
// //   {
// //     label: 'Todos',
// //     value: 'Todos'
// //   },
// //   {
// //     label: 'Masculino',
// //     value: 'M'
// //   },
// //   {
// //     label: 'Femenino',
// //     value: 'F'
// //   },
// //   {
// //     label: 'Otro',
// //     value: 'X'
// //   }
// //
// // ];
// //
// // const estadoOptions = [
// //   {
// //     label: 'Todos',
// //     value: 'Todos'
// //   },
// //   {
// //     label: 'Activos',
// //     value: '1'
// //   },
// //   {
// //     label: 'De Baja',
// //     value: '0'
// //   },
// //   {
// //     label: 'De Excedencia',
// //     value: '2'
// //   }
// //
// // ];
// //
// // const applyFilters = (customers, filters) => customers.filter((customer) => {
// //   if (filters.query) {
// //     let queryMatched = false;
// //     const properties = ['username','email'];
// //
// //     properties.forEach((property) => {
// //       if ((customer[property]).toLowerCase().includes(filters.query.toLowerCase())) {
// //         queryMatched = true;
// //       }
// //     });
// //
// //     if (!queryMatched) {
// //       return false;
// //     }
// //   }
// //
// //   if (filters.hasAcceptedMarketing && !customer.hasAcceptedMarketing) {
// //     return false;
// //   }
// //
// //   if (filters.isProspect && !customer.isProspect) {
// //     return false;
// //   }
// //
// //   if (filters.isReturning && !customer.isReturning) {
// //     return false;
// //   }
// //
// //   if(filters.genre!=='Todos' && customer.genre!==filters.genre){
// //     return false
// //   }
// //
// //   if(filters.postal_code!=='Todos' && customer.postal_code!==filters.postal_code){
// //     return false
// //   }
// //
// //   if(filters.estado!=='Todos' && (filters.estado!==customer.subscription_status && filters.estado!==customer.voucher_status)){
// //     return false
// //   }
// //   if(filters.product!=='Todos' && !customer.products?.includes(parseInt(filters.product))){
// //     return false
// //   }
// //   if(filters.voucher!=='Todos' && !customer.vouchers?.includes(parseInt(filters.voucher))){
// //     return false
// //   }
// //   if(filters.service!=='Todos' && !customer.services?.includes(parseInt(filters.service))){
// //     return false
// //   }
// //   return !(filters.subscription !== 'Todos' && !customer.subscriptions?.includes(parseInt(filters.subscription)));
// //
// // });
// //
// // const descendingComparator = (a, b, sortBy) => {
// //   // When compared to something undefined, always returns false.
// //   // This means that if a field does not exist from either element ('a' or 'b') the return will be 0.
// //
// //   if (b[sortBy] < a[sortBy]) {
// //     return -1;
// //   }
// //
// //   if (b[sortBy] > a[sortBy]) {
// //     return 1;
// //   }
// //
// //   return 0;
// // };
// //
// // const getComparator = (sortDir, sortBy) => (sortDir === 'desc'
// //   ? (a, b) => descendingComparator(a, b, sortBy)
// //   : (a, b) => -descendingComparator(a, b, sortBy));
// //
// // const applySort = (customers, sort) => {
// //   const [sortBy, sortDir] = sort.split('|');
// //   const comparator = getComparator(sortDir, sortBy);
// //   const stabilizedThis = customers.map((el, index) => [el, index]);
// //
// //   stabilizedThis.sort((a, b) => {
// //     const newOrder = comparator(a[0], b[0]);
// //
// //     if (newOrder !== 0) {
// //       return newOrder;
// //     }
// //
// //     return a[1] - b[1];
// //   });
// //   return stabilizedThis.map((el) => el[0]);
// // };
// //
// // const applyPagination = (customers, page, rowsPerPage) => customers.slice(page * rowsPerPage,
// //   page * rowsPerPage + rowsPerPage);
//
// /* Esto crea la página usando React.
// *
// * */
// // const ClientList = () => {
// const Index = () => {
//   const isMounted = useMounted();
//   const queryRef = useRef(null);
//   // const [clients, setClients] = useState([])
//   // const [currentTab, setCurrentTab] = useState('all');
//   // const [page, setPage] = useState(0);
//   // const [rowsPerPage, setRowsPerPage] = useState(10);
//   // const [sort, setSort] = useState(sortOptions[0].value);
//   // const [genre, setGenre] = useState(genreOptions[0].value);
//   // const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
//   // const [endDate, setEndDate] = useState( new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
//   // const [filters, setFilters] = useState({
//   //   query: '',
//   //   hasAcceptedMarketing: undefined,
//   //   isProspect: undefined,
//   //   isReturning: undefined,
//   //   genre:'Todos',
//   //   postal_code:'Todos',
//   //   estado: 'Todos',
//   //   product:'Todos',
//   //   subscription:'Todos',
//   //   voucher:'Todos',
//   //   service:'Todos'
//   // });
//   // const [search, setSearch] = useState('')
//   // const [postalCodesOptions, setPostalCodesOptions] = useState(['Todos'])
//   // const [products,setProducts ] = useState([])
//   // const [services,setServices ] = useState([])
//   // const [vouchers,setVouchers ] = useState([])
//   // const [subscriptions,setSubscriptions ] = useState([])
//
//   // Array que me permitirá crear Formset para Subir múltiples documentos
//   const [fileInputs, setFileInputs] = useState([0]);
//
//   // Función que, al clicar el botón del "+", agregará una Casilla adicional al Formset para subir archivos
//   const addFileInput = () => {
//     setFileInputs([...fileInputs, fileInputs.length]);
//   };
//
//   useEffect(() => {
//     gtm.push({ event: 'page_view' });
//   }, []);
//
//   // const getClients = useCallback(async () => {
//   //   try {
//   //     const data = await clientApi.getClients();
//   //     if (isMounted()) {
//   //       setClients(data);
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //   }
//   // }, [isMounted]);
//   // const getProducts = useCallback(async () => {
//   //   try {
//   //     const data = await productApi.getProducts();
//   //     if (isMounted()) {
//   //       setProducts(data.filter(producto => producto.is_active));
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //   }
//   // }, [isMounted]);
//   // const getSubscriptions= useCallback(async () => {
//   //   try {
//   //     const data = await subscriptionApi.getSubscriptions();
//   //     if (isMounted()) {
//   //       setSubscriptions(data.filter(e=>e.price_id_stripe!==null && e.is_active));
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //   }
//   // }, [isMounted]);
//   // const getVouchers= useCallback(async () => {
//   //   try {
//   //     const data = await voucherApi.getVouchers();
//   //     if (isMounted()) {
//   //       setVouchers(data.filter(voucher => voucher.is_active));
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //   }
//   // }, [isMounted]);
//   // const getServices = useCallback(async () => {
//   //   try {
//   //     const data = await serviceApi.getServices();
//   //     if (isMounted()) {
//   //       setServices(data.filter(service => service.is_active));
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //   }
//   // }, [isMounted]);
//   //
//   // useEffect(() => {
//   //   getClients();
//   //   getProducts();
//   //   getSubscriptions();
//   //   getVouchers()
//   //   getServices()
//   // },
//   // []);
//
//
//
//
//   // useEffect(() => {
//   //     if(clients.length){
//   //       let pcs =['Todos'];
//   //       clients.map(e=>{
//   //         if(e && e.postal_code && !pcs.includes(e.postal_code)) pcs.push(e.postal_code)
//   //       })
//   //     setPostalCodesOptions(pcs)
//   //     }
//   //   },[clients]);
//
//   // const handleTabsChange = (event, value) => {
//   //   const updatedFilters = {
//   //     ...filters,
//   //     hasAcceptedMarketing: undefined,
//   //     isProspect: undefined,
//   //     isReturning: undefined
//   //   };
//   //
//   //   if (value !== 'all') {
//   //     updatedFilters[value] = true;
//   //   }
//   //
//   //   setFilters(updatedFilters);
//   //   setCurrentTab(value);
//   // };
//   //
//   // const handleQueryChange = (event) => {
//   //   event.preventDefault();
//   //   setFilters((prevState) => ({
//   //     ...prevState,
//   //     query: search,
//   //   }));
//   // };
//   //
//   // const handleGenreChange = (event) => {
//   //   setGenre(event.target.value);
//   //   setFilters((prevState) => ({
//   //     ...prevState,
//   //     genre: event.target.value,
//   //   }));
//   // };
//   // const handleEstadoChange = (event) => {
//   //   setFilters((prevState) => ({
//   //     ...prevState,
//   //     estado: event.target.value,
//   //   }));
//   //   };
//   // const handlePostalCodeChange = (event) => {
//   //   setFilters((prevState) => ({
//   //     ...prevState,
//   //     postal_code: event.target.value,
//   //   }));
//   // };
//   //
//   // const handleSortChange = (event) => {
//   //   setSort(event.target.value);
//   // };
//   //
//   // const handleSearchChange = (e)=>{
//   //   setSearch(e.target.value)
//   // }
//
//   // const handlePageChange = (event, newPage) => {
//   //   setPage(newPage);
//   // };
//
//   // const handleRowsPerPageChange = (event) => {
//   //   setRowsPerPage(parseInt(event.target.value, 10));
//   // };
//
//   // Usually query is done on backend with indexing solutions
//
//   // const filteredCustomers = applyFilters(clients, filters);
//   // const sortedCustomers = applySort(filteredCustomers, sort);
//   // const paginatedCustomers = applyPagination(sortedCustomers, page, rowsPerPage);
//
//   const handleSubmit = (event) => {
//     event.preventDefault();
//     console.log("Handle submit function is being called.");
//     // Here you would send the email
//   };
//
//
//   return (
//     <>
//       {/*<Head>*/}
//       {/*  <title>*/}
//       {/*    Dashboard: Listado de clientes*/}
//       {/*  </title>*/}
//       {/*</Head>*/}
//
//       {/* Texto que saldrá en la Pestaña del Navegador */}
//       <Head>
//         <title>
//           Formulario Para Subir Documentos
//         </title>
//       </Head>
//
//
//       {/*<Box*/}
//       {/*  component="main"*/}
//       {/*  sx={{*/}
//       {/*    flexGrow: 1,*/}
//       {/*    py: 8*/}
//       {/*  }}*/}
//       {/*>*/}
//       {/*  <Container maxWidth="xl">*/}
//       {/*    <Box sx={{ mb: 4 }}>*/}
//       {/*      <Grid*/}
//       {/*        container*/}
//       {/*        justifyContent="space-between"*/}
//       {/*        spacing={3}*/}
//       {/*      >*/}
//
//               {/* Título de la Página. */}
//               <Grid item>
//                 <Typography variant="h4">
//                   Subir Documentos
//                 </Typography>
//               </Grid>
//
//       {/*      </Grid>*/}
//       {/*      <Box*/}
//       {/*        sx={{*/}
//       {/*          m: -1,*/}
//       {/*          mt: 3*/}
//       {/*        }}*/}
//       {/*      >*/}
//
//       {/*      </Box>*/}
//       {/*    </Box>*/}
//       {/*    <Card>*/}
//       {/*      <Tabs*/}
//       {/*        indicatorColor="primary"*/}
//       {/*        onChange={handleTabsChange}*/}
//       {/*        scrollButtons="auto"*/}
//       {/*        sx={{ px: 3 }}*/}
//       {/*        textColor="primary"*/}
//       {/*        value={currentTab}*/}
//       {/*        variant="scrollable"*/}
//       {/*      >*/}
//       {/*        {tabs.map((tab) => (*/}
//       {/*          <Tab*/}
//       {/*            key={tab.value}*/}
//       {/*            label={tab.label}*/}
//       {/*            value={tab.value}*/}
//       {/*          />*/}
//       {/*        ))}*/}
//       {/*      </Tabs>*/}
//       {/*      <Divider />*/}
//       {/*      <Box*/}
//       {/*        sx={{*/}
//       {/*          alignItems: 'center',*/}
//       {/*          display: 'flex',*/}
//       {/*          flexWrap: 'wrap',*/}
//       {/*          m: '-1.5 1.5 0 1.5',*/}
//       {/*          p: '3 3 0 3'*/}
//       {/*        }}*/}
//       {/*      >*/}
//       {/*        <Box*/}
//       {/*          component="form"*/}
//       {/*          onSubmit={handleQueryChange}*/}
//       {/*          sx={{*/}
//       {/*            flexGrow: 1,*/}
//       {/*            m: 1.5*/}
//       {/*          }}*/}
//       {/*        >*/}
//       {/*          <TextField*/}
//       {/*            defaultValue=""*/}
//       {/*            fullWidth*/}
//       {/*            inputProps={{ ref: queryRef }}*/}
//       {/*            InputProps={{*/}
//       {/*              startAdornment: (*/}
//       {/*                <InputAdornment position="start">*/}
//       {/*                  <SearchIcon fontSize="small" />*/}
//       {/*                </InputAdornment>*/}
//       {/*              )*/}
//       {/*            }}*/}
//       {/*            onChange={handleSearchChange}*/}
//       {/*            placeholder="Buscar clientes"*/}
//       {/*          />*/}
//       {/*        </Box>*/}
//       {/*        <TextField*/}
//       {/*          label="Sort By"*/}
//       {/*          name="sort"*/}
//       {/*          onChange={handleSortChange}*/}
//       {/*          select*/}
//       {/*          SelectProps={{ native: true }}*/}
//       {/*          sx={{ m: 1.5 }}*/}
//       {/*          value={sort}*/}
//       {/*        >*/}
//       {/*          {sortOptions.map((option) => (*/}
//       {/*            <option*/}
//       {/*              key={option.value}*/}
//       {/*              value={option.value}*/}
//       {/*            >*/}
//       {/*              {option.label}*/}
//       {/*            </option>*/}
//       {/*          ))}*/}
//       {/*        </TextField>*/}
//
//       {/*      </Box>*/}
//       {/*      <Grid*/}
//       {/*        container*/}
//       {/*        sx={{*/}
//       {/*          m: '-2.5 -1.5 0 1.5',*/}
//       {/*          p: '0 3 1 3'*/}
//       {/*        }}*/}
//       {/*        spacing={3}*/}
//       {/*      >*/}
//       {/*        <Grid*/}
//       {/*          item*/}
//       {/*          md={2}*/}
//       {/*          xs={12}*/}
//       {/*        >*/}
//       {/*           <TextField*/}
//       {/*            label="Género"*/}
//       {/*            name="genre"*/}
//       {/*            onChange={handleGenreChange}*/}
//       {/*            select*/}
//       {/*            SelectProps={{ native: true }}*/}
//       {/*            sx={{ m: 1.5, width:'100%' }}*/}
//       {/*            value={genre}*/}
//       {/*          >*/}
//       {/*            {genreOptions.map((option) => (*/}
//       {/*              <option*/}
//       {/*                key={option.value}*/}
//       {/*                value={option.value}*/}
//       {/*              >*/}
//       {/*                {option.label}*/}
//       {/*              </option>*/}
//       {/*            ))}*/}
//       {/*          </TextField>*/}
//       {/*        </Grid>*/}
//       {/*        <Grid*/}
//       {/*          item*/}
//       {/*          md={2}*/}
//       {/*          xs={12}*/}
//       {/*        >*/}
//       {/*          <TextField*/}
//       {/*            label="Código postal"*/}
//       {/*            name="postal_code"*/}
//       {/*            onChange={handlePostalCodeChange}*/}
//       {/*            select*/}
//       {/*            SelectProps={{ native: true }}*/}
//       {/*            sx={{ m: 1.5,width:'100%' }}*/}
//       {/*            //value={genre}*/}
//       {/*          >*/}
//       {/*            {postalCodesOptions.map((option) => (*/}
//       {/*              <option*/}
//       {/*                key={option}*/}
//       {/*                value={option}*/}
//       {/*              >*/}
//       {/*                {option}*/}
//       {/*              </option>*/}
//       {/*            ))}*/}
//       {/*          </TextField>*/}
//       {/*        </Grid>*/}
//       {/*        <Grid*/}
//       {/*          item*/}
//       {/*          md={2}*/}
//       {/*          xs={12}*/}
//       {/*        >*/}
//       {/*          <TextField*/}
//       {/*            label="Estado"*/}
//       {/*            name="postal_code"*/}
//       {/*            onChange={handleEstadoChange}*/}
//       {/*            select*/}
//       {/*            SelectProps={{ native: true }}*/}
//       {/*            sx={{ m: 1.5,width:'100%' }}*/}
//       {/*            //value={genre}*/}
//       {/*          >*/}
//       {/*            {estadoOptions.map((option) => (*/}
//       {/*              <option*/}
//       {/*                key={option.value}*/}
//       {/*                value={option.value}*/}
//       {/*              >*/}
//       {/*                {option.label}*/}
//       {/*              </option>*/}
//       {/*            ))}*/}
//       {/*          </TextField>*/}
//
//       {/*        </Grid>*/}
//       {/*        <Grid*/}
//       {/*          item*/}
//       {/*          md={2}*/}
//       {/*          xs={12}*/}
//       {/*        >*/}
//       {/*          <DateTimePicker*/}
//       {/*            label="Fecha desde"*/}
//       {/*            onChange={(e) => { setStartDate(e.target.value)}}*/}
//       {/*            renderInput={(inputProps) => (*/}
//       {/*              <TextField*/}
//       {/*                fullWidth*/}
//       {/*                sx={{ m: 1.5,width:'100%' }}*/}
//       {/*                {...inputProps} />*/}
//       {/*            )}*/}
//
//       {/*            value={startDate}*/}
//       {/*          />*/}
//       {/*        </Grid>*/}
//       {/*        <Grid*/}
//       {/*          item*/}
//       {/*          md={2}*/}
//       {/*          xs={12}*/}
//       {/*        >*/}
//       {/*          <DateTimePicker*/}
//       {/*            label="Fecha hasta"*/}
//       {/*            onChange={(e) => {setEndDate(e.target.value) }}*/}
//       {/*            renderInput={(inputProps) => (*/}
//       {/*              <TextField*/}
//       {/*                fullWidth*/}
//       {/*                sx={{ m: 1.5,width:'100%' }}*/}
//       {/*                {...inputProps} />*/}
//       {/*            )}*/}
//
//       {/*            value={endDate}*/}
//       {/*          />*/}
//       {/*        </Grid>*/}
//       {/*      </Grid>*/}
//       {/*        /!* ROW 2 *!/*/}
//       {/*        <Grid*/}
//       {/*          container*/}
//       {/*          sx={{*/}
//       {/*            m: '-2.5 -1.5 0 1.5',*/}
//       {/*            p: '0 3 1 3'*/}
//       {/*          }}*/}
//       {/*          spacing={3}*/}
//       {/*        >*/}
//
//       {/*        <Grid*/}
//       {/*          item*/}
//       {/*          md={3}*/}
//       {/*          xs={12}*/}
//
//       {/*        >*/}
//       {/*          <TextField*/}
//       {/*            label="Tipo de producto"*/}
//       {/*            name="product"*/}
//       {/*            onChange={(e) => setFilters({ ...filters, product: e.target.value })}*/}
//       {/*            select*/}
//       {/*            SelectProps={{ native: true }}*/}
//       {/*            sx={{ my: 1.5,width:'100%',px:1.5}}*/}
//       {/*          >*/}
//       {/*            <option>Todos</option>*/}
//       {/*            {products.map((option) => (*/}
//       {/*              <option*/}
//       {/*                key={option.id}*/}
//       {/*                value={option.id}*/}
//       {/*              >*/}
//       {/*                {option.name}*/}
//       {/*              </option>*/}
//       {/*            ))}*/}
//       {/*          </TextField>*/}
//       {/*        </Grid>*/}
//       {/*        <Grid*/}
//       {/*          item*/}
//       {/*          md={3}*/}
//       {/*          xs={12}*/}
//       {/*        >*/}
//       {/*          <TextField*/}
//       {/*            label="Tipo de bono"*/}
//       {/*            name="postal_code"*/}
//       {/*            onChange={(e) => setFilters({ ...filters, voucher: e.target.value })}*/}
//       {/*            select*/}
//       {/*            SelectProps={{ native: true }}*/}
//       {/*            sx={{ my: 1.5,width:'100%' ,px:1.5}}*/}
//       {/*          >*/}
//       {/*            <option>Todos</option>*/}
//       {/*            {vouchers.map((option) => (*/}
//       {/*              <option*/}
//       {/*                key={option.id}*/}
//       {/*                value={option.id}*/}
//       {/*              >*/}
//       {/*                {option.name}*/}
//       {/*              </option>*/}
//       {/*            ))}*/}
//       {/*          </TextField>*/}
//       {/*        </Grid>*/}
//       {/*        <Grid*/}
//       {/*          item*/}
//       {/*          md={3}*/}
//       {/*          xs={12}*/}
//       {/*        >*/}
//       {/*          <TextField*/}
//       {/*            label="Tipo de cuota"*/}
//       {/*            name="subscription"*/}
//       {/*            onChange={(e) => setFilters({ ...filters, subscription: e.target.value })}*/}
//       {/*            select*/}
//       {/*            SelectProps={{ native: true }}*/}
//       {/*            sx={{ my: 1.5,width:'100%',px:1.5 }}*/}
//       {/*          >*/}
//       {/*            <option>Todos</option>*/}
//       {/*            {subscriptions.map((option) => (*/}
//       {/*              <option*/}
//       {/*                key={option.id}*/}
//       {/*                value={option.id}*/}
//       {/*              >*/}
//       {/*                {option.name}*/}
//       {/*              </option>*/}
//       {/*            ))}*/}
//       {/*          </TextField>*/}
//       {/*        </Grid>*/}
//       {/*        <Grid*/}
//       {/*          item*/}
//       {/*          md={3}*/}
//       {/*          xs={12}*/}
//       {/*        >*/}
//       {/*          <TextField*/}
//       {/*            label="Tipo de servicio"*/}
//       {/*            name="service"*/}
//       {/*            onChange={(e) => setFilters({ ...filters, service: e.target.value })}*/}
//       {/*            select*/}
//       {/*            SelectProps={{ native: true }}*/}
//       {/*            sx={{ my: 1.5,width:'100%',px:1.5 }}*/}
//       {/*          >*/}
//       {/*            <option>Todos</option>*/}
//       {/*            {services.map((option) => (*/}
//       {/*              <option*/}
//       {/*                key={option.id}*/}
//       {/*                value={option.id}*/}
//       {/*              >*/}
//       {/*                {option.name}*/}
//       {/*              </option>*/}
//       {/*            ))}*/}
//       {/*          </TextField>*/}
//       {/*        </Grid>*/}
//       {/*      </Grid>*/}
//       {/*        /!*<ClientListTable*!/*/}
//       {/*        /!*  customers={paginatedCustomers}*!/*/}
//       {/*        /!*  customersCount={filteredCustomers.length}*!/*/}
//       {/*        /!*  onPageChange={handlePageChange}*!/*/}
//       {/*        /!*  onRowsPerPageChange={handleRowsPerPageChange}*!/*/}
//       {/*        /!*  rowsPerPage={rowsPerPage}*!/*/}
//       {/*        /!*  page={page}*!/*/}
//       {/*        /!* />*!/*/}
//       {/*    </Card>*/}
//       {/*  </Container>*/}
//       {/*</Box>*/}
//
//
//
//
//
//          {/* Esto va a encerrar todo el Formulario en un contenedor tipo "Card" */}
//          <Box
//           component="main"
//           sx={{
//             flexGrow: 1,
//             py: 8
//           }}
//         >
//           {/* Otro tipo de Contenedor para hacer que el Formulario se vea bonito */}
//           <Container maxWidth="xl">
//
//             {/* Contenedor que es probablemente solo para el título */}
//             <Box sx={{ mb: 4 }}>
//
//               {/* Grid de 1x3 (1 fila y 3 columnas) para poner el Título de la página */}
//               <Grid
//                 container
//                 justifyContent="space-between"
//                 spacing={3}
//               >
//
//               </Grid>
//             </Box> {/* Fin del contenedor probablemente solo para el título */}
//             <form onSubmit={handleSubmit}>
//               <Card sx={{mt: 3}}>
//                 <CardContent>
//
//                   {/* Título del Formulario. Mostraré el email del cliente */}
//                   <Typography variant="h6">
//                     Datos del Documento:
//                       {/*{clientEmail}*/}
//                   </Typography>
//
//                   {/* Grid de 1x3 para el Formulario en sí. Esto hará más angosto los campos de Título y Mensaje. */}
//                   <Grid container spacing={3}>
//
//                     {/* Columna 1: Espacio vacío a la izquierda de la página */}
//                     <Grid item md={4} xs={12}>
//                         {/* Espacio vacío a la izquierda de la página */}
//                     </Grid>
//
//                     {/* Columna 2: Campos del Formulario */}
//                     <Grid item md={8} xs={12}>
//
//                       {/* El <Box> me permitirá agregar padding vertical entre cada Campo */}
//                       {/* Nombre del Documento */}
//                       <Box sx={{ mt: 4 }}>
//                           <TextField
//                               id="documentTitle"
//                               label="Nombre del Documento"
//                               // value={emailTitle}
//                               // onChange={(e) => setEmailTitle(e.target.value)}
//                               fullWidth
//                               required // Esto hace que el campo sea obligatorio
//                           />
//                       </Box>
//
//                       {/* Formset para agregar Uno o Más Documentos */}
//
//                       {/* Título del Formset para Subir uno o más Archivos */}
//                       <Box sx={{ mt: 4 }}>
//                         <Typography variant="h6">Documento(s) a subir</Typography>
//                       </Box>
//                       {/* Campo tipo "file "para Subir un Documento usando un Formset */}
//                       {fileInputs.map((input, index) => (
//                         <Box key={index} sx={{ mt: 4 }}>
//                           <input type="file" />
//                         </Box>
//                       ))}
//
//                       {/* Botón del "+" para agregar una nueva casilla tipo "file" para subir archivos */}
//                       <Button onClick={addFileInput}>+</Button>
//
//                       {/* Fin del Formset para agregar uno o más documentos */}
//
//                       {/* El <Box> me permitirá agregar padding vertical entre cada campo */}
//                       <Box sx={{ mt: 4 }}>
//
//
//
//
//                         {/*<TextField*/}
//                         {/*    id="emailBody"*/}
//                         {/*    label="Mensaje"*/}
//                         {/*    value={emailBody}*/}
//                         {/*    onChange={(e) => setEmailBody(e.target.value)}*/}
//                         {/*    fullWidth*/}
//                         {/*    multiline*/}
//                         {/*    required  // Esto hace que el campo sea obligatorio*/}
//                         {/*/>*/}
//                       </Box>
//                     </Grid> {/* Fin de la Columna 2: Título y Mensaje del Email */}
//                   </Grid> {/* Fin del Grid de 1x3 para el Formulario en sí. */}
//                 </CardContent>
//               </Card> {/* Fin del contenedor tipo "Card" con el color Azul Marino */}
//
//               {/*Botón viejo para Enviar el Formulario. NO USAR*/}
//               {/*<Button type="submit">Enviar Email</Button>*/}
//
//               {/* Línea divisoria estilo "hr" */}
//               {/*<Divider sx={{ my: 3 }} />*/}
//
//             {/*  /!* Componente con la Lista de Clientes y el Filtro de Clientes *!/*/}
//             {/*  <CustomerListTable*/}
//             {/*  customers={paginatedCustomers}*/}
//             {/*  customersCount={filteredCustomers.length}*/}
//             {/*  onPageChange={handlePageChange}*/}
//             {/*  onRowsPerPageChange={handleRowsPerPageChange}*/}
//             {/*  rowsPerPage={rowsPerPage}*/}
//             {/*  page={page}*/}
//             {/*  currentTab={currentTab}*/}
//             {/*  onSelectedCustomersChange={handleSelectedCustomersChange} // Pass the function to handle selected customers change*/}
//             {/*  onSignup={handleSignup}*/}
//             {/*  onSignout={handleSignout}*/}
//             {/*  onCustomerAssist={handleCustomerAssist}*/}
//             {/*  onRemoveCustomerAssist={handleRemoveCustomerAssist}*/}
//             {/*  onCustomerLateCancel={handleCustomerLateCancel}*/}
//             {/*  onRemoveCustomerLateCancel={handleRemoveCustomerLateCancel}*/}
//             {/*  selCustomers={selCustomers}*/}
//             {/*  currentEvent={currentEvent}*/}
//             {/*  onCurrentEventChange={handleCurrentEventChange}*/}
//             {/*/>*/}
//
//               {/* Fin del Componente con la Lista de Clientes */}
//
//               {/* Botones de Update y Cancel. */}
//               <Box
//                 sx={{
//                   display: 'flex',
//                   flexWrap: 'wrap',
//                   // justifyContent: 'right',
//                   justifyContent: 'center', // Changed from 'right' to 'center'
//                   mx: -1,
//                   mb: -1,
//                   mt: 3
//                 }}
//               >
//                  {/* Botón de "Cancel" / "Cancelar". Esto de devuelve a la lista de Clientes */}
//                 <NextLink href='/clients'>
//                 <Button
//                   sx={{ m: 1 }}
//                   variant="outlined"
//                 >
//                   Cancelar
//                 </Button>
//                 </NextLink>
//
//                 {/* Botón para Registrar el Documento */}
//                 <Button
//                   sx={{ m: 1 }}
//                   type="submit"
//                   variant="contained"
//                 >
//                   Registrar
//                 </Button>
//               </Box>
//               {/* Fin de los Botones de Update y Cancel. */}
//             </form>
//             </Container> {/* Fin del contenedor tipo "Container" */}
//         </Box>  {/* Fin del contenedor tipo "Card" */}
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//     </>
//   );
// };
//
// // ClientList.getLayout = (page) => (
//
// /* Esto le da el "Layout" o la Disposición a la Página.
// *
// * */
// Index.getLayout = (page) => (
//   <AuthGuard>
//     <DashboardLayout>
//       {page}
//     </DashboardLayout>
//   </AuthGuard>
// );
//
// export default Index;
// // export default ClientList;
//
//
//
//
//
//
// //   const router = useRouter();
// //   // const { id } = router.query; // This is the client ID from the URL
// //
// //   const { clientId } = router.query; // This gets the client ID from the URL
// //
// //   // Esta es la variable en donde se meterá el email del cliente. Inicialmente es nula.
// //   const [clientEmail, setClientEmail] = useState(null);
// //
// //   // Aquí meteré el email del Gimnasio del model ode Gimnasio a la API de Django para enviar emails por Mailrelay
// //   const [gymEmail, setGymEmail] = useState(null);
// //
// //   // Esto coge el nombre del Gimnasio del modelo de Gimnasio
// //   const [gymName, setGymName] = useState(null);
// //
// //   // Esto coge el nombre del Cliente del modelo de Account (del Usuario)
// //   const [clientName, setClientName] = useState(null);
// //
// //   // Esto coge el nombre de usuario del Cliente del modelo de Account (del Usuario)
// //   const [clientUsername, setClientUsername] = useState(null);
// //
//
// //
// //   // Necesito esto para poder hacer funcionar el componente de "Customer List Table"
// //   const [paginatedCustomers, setPaginatedCustomers] = useState([]);
// //
// //
//
// //
// //
// //   /* Función useEffect() que me permitirá hacer funcionar el componente de "Customer List Table"
// //   * In this code, the useEffect hook updates paginatedCustomers whenever customers, filters, sort, page, or rowsPerPage
// //   * changes. The CustomerListTable component receives paginatedCustomers as a prop. If paginatedCustomers is undefined,
// //   * an empty array is passed instead to prevent errors.
// //   * */
// //   useEffect(() => {
// //     const filtered = applyFilters(customers, filters);
// //     const sorted = applySort(filtered, sort);
// //     const paginated = applyPagination(sorted, page, rowsPerPage);
// //
// //     setFilteredCustomers(sorted);
// //     setPaginatedCustomers(paginated);
// //   }, [customers, filters, sort, page, rowsPerPage]);
// //
// //
// //
// //   /* This fetches the Client data when the component mounts.
// //   *
// //   * I will concatenate the name and last_name fields with a space in between and assign the result to the
// //   * clientName state variable.
// //   */
// //   React.useEffect(() => {
// //     const fetchClientData = async () => {
// //       if (!clientId) {
// //         return; // Si el ID del cliente es nula /undefined, no hagas nada para evitar mensajes de error en la consola
// //       }
// //
// //       // Si el ID del cliente no es nula, entonces llama a la API de Django para obtener los datos del cliente
// //       try {
// //         const client = await clientApi.getClient(clientId);
// //
// //         setClientEmail(client.email); // Esto mete en la variable clientEmail el email del cliente para usarla después
// //
// //         // Esto me coge el nombre completo del cliente concatenando el nombre y apellido
// //         setClientName(client.first_name + " " + client.last_name);
// //
// //         // Esto me coge el nombre de usuario del cliente
// //         setClientUsername(client.username);
// //
// //         // console.log(client.email); // Log the client's email to the console
// //       } catch (error) {
// //         console.error('Error fetching client data:', error);
// //       }
// //     };
// //
// //     fetchClientData();
// //   }, [clientId]); // Re-run this effect if clientId changes
// //
// //   // Esto mete el cuerpo del email en una variable permanente despues de agarrarlo de la llamada a la API del Cliente.
// //   // Necesito crear esto, o el Formulario del Email NO se renderizará.
// //   const [emailBody, setEmailBody] = useState('');
// //
// //   // Esto mete el Título del email en una variable permanente.
// //   // Necesito crear esto, o el Formulario del Email NO se renderizará.
// //   const [emailTitle, setEmailTitle] = useState('');
// //
// //   /* Funcion que agarra los datos del Gimnasio seleccionado. Por los momentos, voy a poner "hard-coded" que el gimnasio
// //   * seleccionado sea el Gimnasio con ID 1.
// //   *
// //   * Cuando sepa como meter varios gimnasios, quitaré el "1" de la ID del Gimnasio que ahorita está hard-coded, y
// //   * veré como coger la ID del Gimnasio seleccionado sin usar una ID hard-coded.
// //   * */
// //   React.useEffect(() => {
// //     const fetchGymData = async () => {
// //       try {
// //
// //         // Esto llama a la API para agarrar el Gimnasio, y me da la clae de Stripe del Gimnasio seleccionado.
// //         // YO NO QUIERO ESO. Yo quiero todos los datos del Gimnasio seleccionado.
// //
// //         const gym = await gymApiAllData.getGym("1"); // Meteré la ID del gimnasio hard-coded por los momentos
// //
// //         setGymEmail(gym.email); // Esto mete en la variable gymEmail el email del Gimnasio del JSON para usarlo después
// //         setGymName(gym.name); // Esto mete en la variable gymName el nombre del Gimnasio del JSON para usarlo después
// //
// //         // console.log(gym.email); // DEBUGGEO. BORRAR. Log the gym's email to the console
// //
// //         // // DEBUGGEO. BORRAR. Esto imprime todos los datos del Gimnasio seleccionado en la consola.
// //         // // BUG: esto solo me está agarrando la Clave de Stripe. No agarra nada más
// //         // console.log(gym);
// //       } catch (error) {
// //         console.error('Error fetching gym data:', error);
// //       }
// //     };
// //
// //     fetchGymData();
// //   }, []); // Empty dependency array as gym ID is hard-coded
// //
// //   // console.log(clientId); // DEBUG: This correctly logs the client ID to the console
// //
// //   // console.log(id); // Log the client ID to the console. It's printing "undefined".
// //
// //
//
// //
// //   /* Esto llama la API de Mailrelay de la web app de Django para enviar el email al cliente seleccionado.
// //   *
// //   * In this code, I've replaced the console.log(emailBody) line with an axios.post call to send the email body to your
// //   * API. The URL of the API is ${process.env.NEXT_PUBLIC_API_ROOT}/api/mailrelay-email/, as you specified. The data
// //   * sent to the API is an object with emailBody as a property. If the API call is successful, a confirmation message is
// //   * printed to the console with the response data from the API. If there's an error, it's printed to the console with
// //   * console.error.
// //   *
// //   * To include the client's email address in the API call, you can modify the handleSubmit function to include a new
// //   * property in the data object that's sent to the API. You can fetch the client's email address in the useEffect hook
// //   * where you're already fetching the client data, and store it in a state variable. Then, you can use this state
// //   * variable in the handleSubmit function. In this code, I've added a new state variable clientEmail to store the
// //   * client's email address. This email address is fetched in the useEffect hook where the client data is fetched, and
// //   * it's set with setClientEmail(client.email). Then, in the handleSubmit function, clientEmail is included in the data
// //   * object that's sent to the API.
// //   *
// //   * También voy a meter el Email del Gimnasio del modelo de Gimnasio aquí para enviar emails por Mailrelay. El email
// //   * desde el que se va enviar el correo NO se va a tomar del .env, sino que se tomará del email que esté guardado en el
// //   * gimnasio del modelo de Gimnasio.
// //   *
// //   * Cogeré también el nombre del Cliente, y lo pondré en el Email enviado por Mailrelay.
// //   *
// //   * The selected code snippet already contains the logic to redirect the user to the /clients page after a successful
// //   * email send operation. The line router.push('/clients'); is responsible for this redirection.  However, if you're
// //   * experiencing issues with the redirection, it might be due to the router object not being defined in the current
// //   * scope. Make sure you have defined the router object using the useRouter hook from next/router at the beginning of
// //   * your component.
// //   *
// //   * In this code, toast.success('Email sent successfully') will display a success message when the email is sent
// //   * successfully, and toast.error('Error sending email') will display an error message if there's an error sending the
// //   * email.
// //   * */
// //   const handleSubmit = async (event) => {
// //     event.preventDefault();
// //
// //     // Si el email se envía correctamente
// //     try {
// //       // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/mailrelay-email/`);
// //
// //       const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/mailrelay-email/`, {
// //         emailBody: emailBody, // Esto envía el cuerpo del email a la API de Django
// //         emailTitle: emailTitle, // Esto envía el título del email a la API de Django
// //         clientEmail: clientEmail, // Dirección de email del cliente, el cual fue tomado anteriormente
// //         gymEmail: gymEmail, // Dirección de email del Gimnasio, el cual fue tomado anteriormente
// //         gymName: gymName, // Nombre del Gimnasio
// //         clientName: clientName, // Nombre Completo del Cliente
// //         // Include any other data you want to send here
// //       });
// //
// //       // // DEBUGGEO. BORRAR DESPUES.
// //       // console.log('Email sent successfully:', response.data);
// //
// //       // Quiero mostrarle un mensaje flash de confirmación al usuario de que el email se envió correctamente.
// //       // Display a success toast message
// //       toast.success('Se ha enviado correctamente el email.');
// //
// //
// //       // Voy a redirigir al usuario a la lista de clientes después de que se envíe el email
// //       router.push('/clients');
// //
// //
// //     // Esto imprime un mensaje de error si no se pudo enviar el email
// //     } catch (error) {
// //
// //       // Display an error toast message
// //       toast.error('Error: No se pudo enviar el email.');
// //
// //       // Dejaré el mensaje de error de debuggeo en el inspector para saber cual fue el error
// //       console.error('Error sending email:', error);
// //     }
// //   };  // Fin de la función handleSubmit que llama a la API de Mailrelay
// //
// //   return (
// //       /* HTML con el Formulario para Enviar el Email.
// //       *
// //       * I've added a new FormGroup for the email title above the existing one for the email body. The Input component in
// //       * this new FormGroup has type="text" to create a text input field. The name and id props are set to "emailTitle",
// //       * and the value prop is set to the emailTitle state variable. The onChange prop is set to a function that updates
// //       * the emailTitle state variable whenever the input field's value changes.
// //       *
// //       * Please note that you'll need to declare
// //       * the emailTitle state variable using the useState hook at the beginning of your component. You need to declare a
// //       * new state variable emailTitle and a function setEmailTitle to update it. The initial value of emailTitle is an
// //       * empty string.
// //       *
// //       * Le voy a agregar los estilos de Material-UI de los formularios Formik como el de la página para Editar a los
// //       * Clientes a esta página.
// //       *
// //       * Para que haya espacio entre los campos "Título" y "Mensaje", es decir, para agregarle padding vertical
// //       * entre esos 2 campos, usaré las etiquetas "<Box>".
// //       *
// //       * To create a textarea field in Material-UI, you can use the TextField component with the multiline prop set to
// //       * true. You can also use the rows prop to specify the number of rows the textarea should have. the multiline prop
// //       * allows the TextField to accept multiple lines of input, effectively turning it into a textarea. The rows prop
// //       * sets the number of rows in the textarea, which determines its height. You can adjust the number of rows as
// //       * needed.
// //       *
// //       * Para centrar horizontalmente los botones de "Enviar Email" y "Cancelar", usaré "justifyContent: center" en
// //       * lugar de "justifyContent: right".
// //       *
// //       * El título del Formulario dentro del "Card", el cual tiene el email del usuario, estára fuera del Grid 1x3.
// //       * Así, ocupará todo el ancho de la pantalla, si fuera necesario. Y así, el email no se va a ir a la línea por
// //       * debajo de "Email para:". Luego, habrá un espacio vacío a la izquierda de los campos de Título y Mensaje, el
// //       * cual ocupará 1/3 del ancho de la pantalla. El resto de los 2/3 de la pagina los ocuparán los campos de Título
// //       * y Mensaje.
// //       *
// //       * I've added the required attribute to the TextField components for the email title and body. This will prevent
// //       * the form from being submitted if these fields are empty.
// //       * */
//
// //
// //
// //
// //       // <Form onSubmit={handleSubmit}>
// //       //
// //       //   {/* Título del Email */}
// //       //   <FormGroup>
// //       //     <Label for="emailTitle">Título del Mensaje</Label>
// //       //     <Input
// //       //       type="text"
// //       //       name="emailTitle"
// //       //       id="emailTitle"
// //       //       value={emailTitle}
// //       //       onChange={(e) => setEmailTitle(e.target.value)}
// //       //     />
// //       //   </FormGroup>
// //       //
// //       //   {/* Mensaje o Cuerpo del Email */}
// //       //   <FormGroup>
// //       //     <Label for="emailBody">Mensaje</Label>
// //       //     <Input
// //       //       type="textarea"
// //       //       name="emailBody"
// //       //       id="emailBody"
// //       //       value={emailBody}
// //       //       onChange={(e) => setEmailBody(e.target.value)}
// //       //     />
// //       //   </FormGroup>
// //       //   <Button type="submit">Enviar Email</Button>
// //       // </Form>
// //   );
// // };
// //
// // /* Esto me agrega la Disposición con el Navbar (tanto el de arriba como el de la izquierda) a esta página.
// // *
// // * Y, al parecer, solo puedes verlo si estás autenticado, logueado.
// // *
// // * To add the side navbar to this page, you need to wrap the main content of the page with the
// // * DashboardLayout component, similar to how it's done in the clients/index.js file. In this code, the DashboardLayout
// // * and AuthGuard components are imported at the top of the file. Then, a getLayout function is added to the Index
// // * component. This function takes the page (which is the Index component itself) as an argument and returns a new
// // * component with the page wrapped inside the DashboardLayout and AuthGuard components. This will add the side navbar to
// // * the send-email\index.js page.
// // * */
// // Index.getLayout = (page) => (
// //   <AuthGuard>
// //     <DashboardLayout>
// //       {page}
// //     </DashboardLayout>
// //   </AuthGuard>
// // );
// //
