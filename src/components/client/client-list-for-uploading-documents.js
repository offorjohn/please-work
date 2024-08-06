import { useEffect, useState } from "react";
import NextLink from "next/link";
import numeral from "numeral";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import { getInitials } from "../../utils/get-initials";
import { Scrollbar } from "../scrollbar";
import { SeverityPill } from "../severity-pill";
// import { MailOutline as MailOutlineIcon } from '@mui/icons-material';

import { useRouter } from 'next/router';
import axios from "axios";
import toast from "react-hot-toast";
import {router} from "next/client";


/* Este es el archivo que renderiza la Lista de Clientes para la Página para Enviarles los Documentos a los Clientes,
* el cual actualmente se encuentra en la URL /documents/send-to-client/id_del_cliente.
*
* En esta versión editada de la Lista de Clientes, no podrás ni editar ni enviarle emails al cliente, ni tampoco
* te saldrán las opciones "Edit" ni "Delete" al seleccionar a un cliente. Adicionalmente, TAMPOCO podrás selccionar
* a varios clientes a la vez.
*
* The file `client-list-for-uploading-documents.js` is part of a web application made with React, a JavaScript library
* for building user interfaces. This file specifically deals with showing a list of clients on a webpage. It uses
* components from Material-UI, a library of React components that implement Google's Material Design, to make the table
* look nice and work well.
*
* Here's a breakdown of what happens in the file:
*
* 1. **State Initialization**: At the start, it sets up some "states" using `useState`. States in React are used to
* keep track of information that can change over time. In this case, it tracks which clients are selected
* (`selectedCustomers`) and the list of all clients (`clients`).
*
* 2. **Effect Hooks**: It uses `useEffect` to perform actions at specific times. For example, it clears the list of
* selected clients when the list of clients changes. This is like setting up automatic tasks that run based on certain
* conditions.
*
* 3. **Selecting Clients**: The code allows users to select clients from the list using checkboxes. There are functions
* to handle selecting all clients at once or selecting them individually.
*
* 4. **Displaying Clients**: The main part of the file is where it creates a table to show each client's information.
* It maps over the `clients` state to create a row for each client. Each row shows the client's name, email, phone
* number, and some actions (though the actions are commented out and not used here).
*
* 5. **Pagination**: At the bottom of the table, there's a component for pagination. This lets users go through the
* list of clients a few at a time, rather than loading all clients at once, which can be overwhelming if there are
* many clients.
*
* 6. **Bulk Actions**: There's a section for "bulk actions" like deleting or editing multiple clients at once, but it's
* only shown if at least one client is selected. This part is not fully implemented in the provided code.
*
* In summary, this file creates a webpage section where users can see a list of clients, select one or more clients,
* and navigate through the list page by page. The actual actions like sending emails or editing client information are
* hinted at but not included in this code snippet.
*
* To fix the export const ClientListTable snippet so that it accepts the documentId prop, you need to include
* documentId in the destructuring of props within the function parameters. This will allow the component to receive
* documentId as a prop from its parent component. Here's how you can modify the component to accept and use the
* documentId prop.
*
* This modification allows ClientListTable to accept documentId as a prop and use it within the component, such as
* logging it to the console or using it in any function or JSX element inside the component.
*
* Con tan solo poner la variable documentId (con la ID del Documento, el cual fue tomado de la URL) centro del
* "export const ClientListTable = (props) => {", ya puedo acceder a la ID del Documento al clicar en el botón
* de "Enviar Documento" sin que me salgan bugs. Con poner la variable documentId en el ClientListTable, ya puedo
* aceptar la variable documentId que estoy enviando desde el index.js de la página
* /documents/send-to-client/id_del_documento.
 */

// ESTO ME DA UN ERRO que me daña el return().
// export const ClientListTable = (props) => {
//   const {
//     customers,
//     customersCount,
//     onPageChange,
//     onRowsPerPageChange,
//     page,
//     rowsPerPage,
//     documentId, // Add documentId to the destructured props
//     ...other
//   } = props;
//
//   // Now you can use documentId within this component, for example:
//   console.log("Received documentId:", documentId);
//
//   // Rest of your component code...
// };

export const ClientListTable = (props) => {
  const {
    customers,
    customersCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    documentId, // Agregué la variable documentId para cogerla del index.js de la página de documentos de clientes
    ...other
  } = props;

  // Array que meterá a todos los Clientes seleccionados (cuando le hacemos click al checkbox)
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [clients, setClients] = useState([]);

  // Reset selected customers when customers change
  useEffect(() => {
      if (selectedCustomers.length) {
        setSelectedCustomers([]);
      }
    },[]
  );
  useEffect(() => {
    setClients(customers)
    },[customers]
  );

  /* The selected code snippet is a function named `handleSelectAllCustomers` from a React component. This function is
  * designed to manage the selection state of all customers displayed in a table. When a user interacts with a checkbox
  * (presumably a "Select All" checkbox), this function is triggered.
  *
  * The function takes an event object as its parameter, which represents the event that occurred. Inside the function,
  * `setSelectedCustomers` is called, which is a setter function from the React `useState` hook used to update the
  * state of `selectedCustomers`. This state likely holds the IDs of all selected customers.
  *
  * The logic within `setSelectedCustomers` uses a ternary operator to check the `checked` property of the event's
  * target (the checkbox). If the checkbox is checked (`event.target.checked` is `true`), it maps over the `customers`
  * array to create a new array containing the IDs of all customers. This new array is then set as the new state for
  * `selectedCustomers`, effectively selecting all customers. If the checkbox is not checked, an empty array is set as
  * the new state, deselecting all customers.
  *
  * This functionality is crucial for implementing bulk actions in the UI, allowing a user to select or deselect all
  * customers with a single action.
  *
  * */
  const handleSelectAllCustomers = (event) => {
    setSelectedCustomers(
      event.target.checked ? customers.map((customer) => customer.id) : []
    );
  };

  /* The function `handleSelectOneCustomer` is designed to manage the selection state of individual customers in a list.
  * It plays a crucial role in a user interface where users can select or deselect clients from a displayed list,
  * typically for performing actions like editing or deleting.
  *
  * When a user interacts with a checkbox associated with a specific customer, this function is triggered. It receives
  * two parameters: the event triggered by interacting with the checkbox and the unique ID (`customerId`) of the
  * customer related to the checkbox.
  *
  * The core logic of the function checks if the `customerId` is already present in the `selectedCustomers` array,
  * which tracks all selected customers. This is done using the `includes` method.
  *
  * - If the `customerId` is not in the `selectedCustomers` array (meaning the customer was not previously selected),
  * the function adds this `customerId` to the array. This is achieved by creating a new array that includes all
  * previously selected customer IDs along with the new `customerId`, and then updating the `selectedCustomers` state
  * with this new array.
  *
  * - Conversely, if the `customerId` is already in the `selectedCustomers` array (indicating the customer was
  * previously selected and is now being deselected), the function removes this `customerId` from the array. It filters
  * out the `customerId` from the `selectedCustomers` array, creating a new array without this ID, and updates the
  * `selectedCustomers` state with it.
  * This functionality allows for a dynamic and interactive user experience, enabling users to select and deselect
  * customers individually, which can be essential for actions like bulk operations or detailed customer management
  * within the application.
  *
  * */
  const handleSelectOneCustomer = (event, customerId) => {
    if (!selectedCustomers.includes(customerId)) {
      setSelectedCustomers((prevSelected) => [...prevSelected, customerId]);
    } else {
      setSelectedCustomers((prevSelected) =>
        prevSelected.filter((id) => id !== customerId)
      );
    }
  };


  // TODO: Entender como se pueden realizar las modificaciones / borrado masivo con los BulkActions
  const enableBulkActions = selectedCustomers.length > 0;
  const selectedSomeCustomers =
    selectedCustomers.length > 0 && selectedCustomers.length < customers.length;
  const selectedAllCustomers = selectedCustomers.length === customers.length;

  /* Función que se va a llamar cada vez que el usuario clique en el botón "Enviar".
  *
  * Esta función debe enviar el documento seleccionado a los clientes seleccionados de la tabla de Clientes.
  *
  * ¿Porque no creo el botón “Enviar Documento” desde el client-list-for-uploading-documents.js? Así, cuando clique el
  * botón, podré llamar a una función que imprima todos los clientes seleccionados en el array selectedCustomers{}.
  *
  * Tengo que seleccionar PRIMERO a los clientes ANTES de clicar el botón “Enviar Documento”, para así
  * poder imprimir todos los clientes seleccionados en el navegador web.
  *
  * Pues, con lo que ya tengo, ya puedo crear la API para enviar tanto la ID del documento seleccionado como las IDs de
  * los clientes seleccionados desde la web app de React. Pues, le diré a Copilot que cree una API call con axios en la
  * web app de React para que envíe tanto la ID del documento como la ID de los clientes seleccionados, y lo envíe a
  * Django. Luego, crearé la web app de Django para que agarre la ID de ese documento y la ID de esos clientes
  * seleccionados, y luego haga Query Sets para que agarre el tipo de documento que tenga esa ID de documento, y otro
  * Query Set para agarrar las instancias de los Accounts con las IDs de los clientes. Luego, en el modelo de
  * Documentos para clientes, crearé registros que tengan como Tipo de Documento el tipo de documento seleccionado, y
  * como clientes a los clientes seleccionados.
  *
  * To implement the functionality described in your algorithm, you'll need to follow these steps:
Create an Axios API call in your React web app: This call will send the selected document ID and the selected customer IDs to your Django web app.
Handle the request in your Django web app: Upon receiving the request, your Django app will need to extract the document ID and customer IDs from the request, perform query sets to fetch the corresponding document type and customer instances, and then create records in the Customer Documents model with the selected document type and customers.
*
* Then, modify the enviarDocumentoAClientesSeleccionados function in your React component to include the Axios API call. Replace YOUR_DJANGO_ENDPOINT with the actual endpoint URL of your Django web app where you'll handle this request.
*
* Después de enviarle el documento a los Clientes, quiero redirigir al usuario a la Lista de Documentos. Anteriormente,
* solo podía redirigir al usuario a la página de Dashboard, pero ahora quiero redirigir al usuario a la página de
* Lista de Documentos.
  * */
  const enviarDocumentoAClientesSeleccionados = (documentId, event) => {
    event.preventDefault();

    // // DEBUGGEO. BORRAR. Esto imprime en la consola del navegador web la ID del Documento
    // console.log("Document ID at the end of the URL:", documentId);

    // // DEBUGGEO. BORRAR. Esto imprime en la consola del navegador web los clientes seleccionados
    // selectedCustomers.forEach(customerId => console.log(customerId));

    // Esto agarra el ID del Documento y las IDs de los Clientes seleccionados para poder enviarlos al back-end
    const dataToSend = {
      documentId: documentId,
      customerIds: selectedCustomers
    };

    // API que envía el ID del Documento y los IDs de los Clientes seleccionados a la web app de Django
    axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/send-document-to-members/`, dataToSend)
      .then(response => {
        // console.log('Success:', response.data);

        // Mensaje Flash de Confirmación si se envía correctamente el documento a los Clientes
        toast.success("Documento enviado a los clientes seleccionados.");

        // Esto redirige al usuario a la página con la Lista de Documentos.
        // router.push('/dashboard');
        router.push('/documents');

      })
      .catch(error => {
        console.error('Error:', error);

        // Mensaje Flash de Error
        toast.error("Error al enviar el documento a los clientes seleccionados.");
      });
  };


  // const enviarDocumentoAClientesSeleccionados = (event) => {
  //   event.preventDefault();
  //
  //
  //   // console.log("Handle submit function is being called.");
  //
  //   // DEBUGGEO. BORRAR. Esto imprime en la consola del navegador web los clientes seleccionados
  //   selectedCustomers.forEach(customerId => console.log(customerId));
  //
  //   console.log("Document ID at the end of the URL:", documentId);
  //   // // Esto agarra la ID que está como el último parámetro de la URL de esta página
  //   // const router = useRouter();
  //   // // Assuming the dynamic segment of the URL is named `document_id`
  //   // const documentId = router.query.document_id;
  //   //
  //   // console.log("Document ID at the end of the URL:", documentId);
  //
  // };







  /* Codigo HTML de la Tabla con la lista de clientes, renderizado usando JS.
  *
  * */
  return (
    <div {...other}>
      <Box
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
          display: enableBulkActions ? "block" : "none",
          px: 2,
          py: 0.5,
        }}
      >
        <Checkbox
          checked={selectedAllCustomers}
          indeterminate={selectedSomeCustomers}
          onChange={handleSelectAllCustomers}
        />

        {/* No debo poner los botones ni de "Edit" ni de "Delete" */}
        {/*<Button size="small"*/}
        {/*sx={{ ml: 2 }}>*/}
        {/*  Delete*/}
        {/*</Button>*/}
        {/*<Button size="small"*/}
        {/*sx={{ ml: 2 }}>*/}
        {/*  Edit*/}
        {/*</Button>*/}
      </Box>
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead
            sx={{ visibility: enableBulkActions ? "collapse" : "visible" }}
          >

            {/* Estos son los títulos de la cabecera de la tabla con la lista de clientes */}
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAllCustomers}
                  indeterminate={selectedSomeCustomers}
                  onChange={handleSelectAllCustomers}
                />
              </TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              {/*<TableCell align="right">Actions</TableCell>*/}
            </TableRow> {/* Fin de los títulos de la cabecera de la tabla con la lista de clientes */}
          </TableHead>
          <TableBody>
            {clients?.map((customer) => {
              const isCustomerSelected = selectedCustomers.includes(
                customer.id
              );

              return (
                <TableRow hover
                key={customer.id}
                selected={isCustomerSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isCustomerSelected}
                      onChange={(event) =>
                        handleSelectOneCustomer(event, customer.id)
                      }
                      value={isCustomerSelected}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: "center",
                        display: "flex",
                      }}
                    >
                      <Box sx={{ ml: 1 }}>
                        <NextLink href={`/clients/${customer.id}`}
                        passHref>
                          <Link
                          color="inherit"
                          variant="subtitle2">
                            {customer.first_name} {customer.last_name}
                          </Link>
                        </NextLink>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography color="success.main"
                    variant="subtitle2">
                      {`${customer.email}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="success.main"
                      variant="subtitle2">
                        {`${customer.phone}`}
                      </Typography>
                  </TableCell>
                  {/* Esto renderiza la celda los iconos del Lápiz para editar y el de la Flecha de "Actions" */}
                  {/*<TableCell align="right">*/}

                  {/*  /!* Icono del Sobre / Carta para enviar Emails. Te redirige al enlace  *!/*/}
                  {/*  /!* /clients/client_id/send-email *!/*/}
                  {/*  /!*<IconButton component="a" href={`mailto:${customer.email}`}>*!/*/}
                  {/*  /!*<NextLink href={`/clients/${customer.id}/send-email`}*!/*/}
                  {/*  /!*passHref>*!/*/}
                  {/*  /!*  <IconButton component="a" href={`#`}>*!/*/}
                  {/*  /!*    <MailOutlineIcon fontSize="small" />*!/*/}
                  {/*  /!*  </IconButton>*!/*/}
                  {/*  /!*</NextLink>*!/*/}


                  {/*  /!*<NextLink href={`/clients/${customer.id}`}*!/*/}
                  {/*  /!*passHref>*!/*/}
                  {/*  /!*  <IconButton component="a">*!/*/}
                  {/*  /!*    <PencilAltIcon fontSize="small" />*!/*/}
                  {/*  /!*  </IconButton>*!/*/}
                  {/*  /!*</NextLink>*!/*/}


                  {/*  /!*<NextLink href="/dashboard/customers/1"*!/*/}
                  {/*  /!*passHref>*!/*/}
                  {/*  /!*  <IconButton component="a">*!/*/}
                  {/*  /!*    <ArrowRightIcon fontSize="small" />*!/*/}
                  {/*  /!*  </IconButton>*!/*/}
                  {/*  /!*</NextLink>*!/*/}
                  {/*</TableCell>*/}
                  {/* Fin de la celda los iconos del Lápiz para editar y el de la Flecha de "Actions" */}

                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={customersCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Botón para enviar el Documento a los Clientes */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        {/*<Button variant="contained" color="primary" onClick={handleSubmit}>*/}
        {/*<Button variant="contained" color="primary" onClick={() => selectedCustomers.forEach(customerId => console.log(customerId))}>*/}
        {/*<Button variant="contained" color="primary" onClick={enviarDocumentoAClientesSeleccionados}>*/}
        {/*  Enviar Documento*/}
        {/*</Button>*/}

        {/* Modifiqué el botón para que acepte la ID del Documento de la URL como parámetro */}
        <Button variant="contained" color="primary" onClick={(event) => enviarDocumentoAClientesSeleccionados(documentId, event)}>
          Enviar Documento
        </Button>
      </Box>  {/* Fin del Botón para enviar el Documento a los Clientes */}
    </div>

  );
};

ClientListTable.propTypes = {
  customers: PropTypes.array.isRequired,
  customersCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
