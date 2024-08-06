import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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

import Axios from 'axios';

// Esto me deja crear Tablas con los Estilos de Material-UI
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

/* Página para ver la Lista de Documentos Subidos si eres un Administrador. Puedes entrar a esta página desde esta URL:
* /documents.
*
* Aquí también podrás clicar en un botón para poder enviarle los documentos a los clientes. Simplemente, tendrás que
* clicar en un botón al lado de ese documento para poder seleccionar a los clientes a los que quieres enviarles
* esos documentos.
*
* */

const Index = () => {
  const router = useRouter();
  // const { id } = router.query; // This is the client ID from the URL

  const { clientId } = router.query; // This gets the client ID from the URL

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

  // Variable que almacenará los Tipos de Documentos que se agarrarán de la API de Django
  const [documentsForMembers, setDocumentsForMembers] = useState([]);

  // const [documentTypes, setDocumentTypes] = useState([]);

  /* API para agarrar los Tipos de Documentos de la web app de Django.
  *
  * Django enviará los Documentos en un JSON, y esta página de React los recibirá. Para ello, usaré Axios para
  * llamar a la API de Django que me dará los Tipos de Documentos. La función de Axios() llamará a la URL de la vista
  * con la API de Django que exporta los Documentos como un JSON.
  *
  * To display the timestamp in the desired format ("day-month-year hour-minute") in your React web app, you can modify
  * the timestamp directly in the JavaScript code after receiving the data from the API call. This approach allows you
  * to keep the backend logic unchanged and provides flexibility in formatting dates on the frontend, which can be
  * especially useful if different parts of your application require different date formats.
  *
  * Here's how you can do it using JavaScript's `Date` object and `toLocaleString` method for formatting:

  1. After receiving the data from the API, iterate over each item in the dataset.
  2. Convert the `signed_at` timestamp to a `Date` object.
  3. Use `toLocaleString` to format the date according to your requirements.
  4. Replace the original `signed_at` value with the formatted date string.

  * Below is an example of how you might implement this in your React component, assuming you store the API response in
  * a state variable named `documents`.
  *
  * This code snippet assumes you're manipulating the data after fetching it from the API and before rendering it in
  * your component. The `'en-GB'` locale is used to achieve the "day-month-year" format, and `hour12: false` specifies
  * 24-hour time format. Adjust the locale and options as needed to match your exact formatting requirements.
  *
  * To address the issue where the `signed_at` timestamp defaults to January 1, 1970, when it's empty, and to ensure it remains blank if the document is not signed (`is_it_signed` is `false`), you can modify the React code snippet. This approach checks the `is_it_signed` field and only formats the `signed_at` date if the document is signed. If `is_it_signed` is `false`, it leaves the `signed_at` field blank.
  *
  * I modified my code so that the `signed_at` field is formatted only for documents that are signed (`is_it_signed`
  * is `true`). For unsigned documents (`is_it_signed` is `false`), it sets the `signed_at` field to an empty string,
  * avoiding the default 1970 timestamp.
  * */
  useEffect(() => {
    Axios.get(`${process.env.NEXT_PUBLIC_API_ROOT}/api/documents-for-members/`)
      .then(response => {

        // Esto me arreglará el formato del Timestamp a dia/mes/año hora:minutos.
        const documents = response.data;

        // Esto cambia el formato del Timestamp del Documento Firmado a dia/mes/año hora:minutos.
        documents.forEach(doc => {

          // Si el documento está firmado, mostrar el Timestamp
          if (doc.is_it_signed) {
            const date = new Date(doc.signed_at);
            const formattedDate = date.toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            doc.signed_at = formattedDate;
          } else {
            // Dejar el Timestamp en blanco si no está firmado el documento
            doc.signed_at = '';
          }
      });

        setDocumentsForMembers(documents);
        // setDocumentsForMembers(response.data);

        // DEBUGGEO. BORRAR DESPUES. Esto imprime en la consola los Tipos de Documentos que se agarraron de la API.
        console.log(response.data);

      })
      .catch(error => console.error('There was an error fetching the documents:', error));
  }, []);

  // /* Función que mete cada archivo subido en el formset del formulario en una variable permanente.
  //
  // * */
  // const handleFileChange = (e) => {
  //
  //   // If allowing multiple files, concatenate the new files with any existing ones
  //   const uploadedFiles = event.target.files;
  //   setFiles(currentFiles => [...currentFiles, ...uploadedFiles]);
  //
  //   // If only a single file is allowed, just set the state to the first file
  //   // setFiles(event.target.files[0]);
  //
  //
  //   // setFiles(e.target.files);
  // };

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
      /* HTML del Formulario para Lista de Documentos.
      *
      * I created a "nextlink" component here to redirect the user to the following URL: /documents/upload-documents.
      * That is, create a link in here which users will be able to click so that they can go to the
      * /documents/upload-documents URL.
      *
      * Modify your React component to include the API call and display the data in a table.
      *
      * I want to edit the 3rd cell in the table body of my table so that, instead of "(meter enlace aquí)", you put an
      * icon or a button that says "Send to client" or something like that. Then, assign a link to that button so that,
      * if the user clicks on that button they will be sent to the following URL:
      * /documents/send-to-client/document_id . For the document ID, you need to insert the ID of the document that is
      * inserted in that table cell. That is, if the first document type is in the first cell, then you need to insert
      * the ID of that document type in the tail end of the /documents/send-to-client/document_id URL. You can access
      * the document type ID by using the "docType.id" variable from the selected snippet.
      *
      * To achieve this, you can use a Button component from Material-UI and dynamically set its href attribute using
      * the docType.id for each document type. You'll wrap the Button with NextLink from Next.js to handle client-side
      * navigation. Here's how you can modify the third TableCell in each row of your TableBody.
      *
      * Tengo que usar la notación "campo__otro-campo" para poder acceder a los campos de las FK del modelo de
      * Documentos para el Cliente y del Tipo de Documento.
      * */
      <>
        {/* Título que saldrá en la Pestaña del Navegador */}
        <Head>
          <title>
            Documentos Para los Clientes
          </title>
        </Head>

        {/* Esto va a encerrar toda la Página en un contenedor tipo "Card" */}
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
                    Lista de Documentos Para los Clientes
                  </Typography>
                </Grid>

                {/*/!* Botón para ir a la página de "Subir Documentos" *!/*/}
                {/*<Grid item>*/}
                {/*  <NextLink href="/documents/upload-documents" passHref>*/}
                {/*    <Button component="a" variant="contained" color="primary">*/}
                {/*      Subir Documentos*/}
                {/*    </Button>*/}
                {/*  </NextLink>*/}
                {/*</Grid>*/}

              </Grid>
            </Box> {/* Fin del contenedor del título */}

            {/* Tabla con la Lista de Documentos */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: 'white' }}>ID</TableCell>
                  <TableCell style={{ color: 'white' }}>Documento</TableCell>

                  {/* Título de la columna con el nombre de usuario del Cliente */}
                  <TableCell style={{ color: 'white' }}>Cliente</TableCell>

                  {/*/!* Adjust based on your DocumentType model fields *!/*/}
                  {/*<TableCell style={{ color: 'white' }}>Enviar a un Cliente</TableCell>*/}

                  {/* Título de la columna con el Timestamp de cuando fue firmado */}
                  <TableCell style={{ color: 'white' }}>Fecha de Firma</TableCell>
                </TableRow>
              </TableHead>

              {/* El "map" mete los datos de los Documentos cogidos, y los mete en la tabla */}
              <TableBody>
                {documentsForMembers.map((docFromMember) => (
                  <TableRow key={docFromMember.id}>

                    {/* Aquí se imprimirá el ID del Documento del Cliente, NO del Tipo de Documento */}
                    <TableCell style={{ color: 'white' }}>{docFromMember.id}</TableCell>

                    {/* Aquí se imprimirá el nombre del Tipo de Documento tomado como FK */}
                    <TableCell style={{ color: 'white' }}>{docFromMember.document_type__name}</TableCell>

                    {/* Aqui se imprimirá el nombre de usuario del cliente al que le pertenece el documento */}
                    <TableCell style={{ color: 'white' }}>{docFromMember.member__username}</TableCell>

                    {/* Aqui se imprimirá el timestamp de cuando fue firmado el documento */}
                    <TableCell style={{ color: 'white' }}>{docFromMember.signed_at}</TableCell>

                    {/*/!* Botón para enviar el documento seleccionado a un cliente *!/*/}
                    {/*<TableCell style={{ color: 'white' }}>*/}
                    {/*  <NextLink href={`/documents/send-to-client/${docType.id}`} passHref>*/}
                    {/*    <Button variant="contained" color="primary">*/}
                    {/*      Enviar a Cliente*/}
                    {/*    </Button>*/}
                    {/*  </NextLink>*/}
                    {/*</TableCell>*/}
                  </TableRow>
                ))}
              </TableBody>
            </Table>


            </Container> {/* Fin del contenedor tipo "Container" */}
        </Box>  {/* Fin del contenedor tipo "Card" */}
      </>


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
