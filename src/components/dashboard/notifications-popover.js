// Esto me deja usar React, por lo que me deja usar useState y useEffect.
import React from 'react';

import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

// Esto me arregla el formato de la fecha y hora en las Notificaciones.
import { format, subDays, subHours } from 'date-fns';

// Esto me traduce el nombre del mes al español para la fecha de creación de las Notificaciones.
import { es } from 'date-fns/locale';

import {
  Avatar,
  Box,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Tooltip,
  Typography
} from '@mui/material';
import { ChatAlt as ChatAltIcon } from '../../icons/chat-alt';
import { MailOpen as MailOpenIcon } from '../../icons/mail-open';
import { X as XIcon } from '../../icons/x';
import { UserCircle as UserCircleIcon } from '../../icons/user-circle';
import { Scrollbar } from '../scrollbar';



// Importo Axios para poder llamar a la API de las Notificaciones.
import axios from 'axios';

// // Esto me dejará programar que se revise todos los días a las 9 am si mañana el cliente tiene clase
// NO LO USARE POR LOS MOMENTOS
// import cron from 'node-cron';

const now = new Date();

/* Datos JSON de las Notificaciones de Prueba.
*
* DEBO MODIFICAR ESTO para que muestre las notificaciones del modelo de Notifications de la base de datos.
*
* Las notificaciones que quiero meter las sacaré de la web app de Django usando una API.
*
* You can add a condition inside the default case of your switch statement to check if notification.read is false. If it
* is, then the notification will be printed. In this code, if (!notification.read) checks if notification.read is false.
* If it is, then the notification is printed. If notification.read is true, then nothing is returned and the
* notification is not printed.
* */



// const data = [
//   {
//     id: '0',
//     message: 'Notificación de prueba 1',
//     createdAt: subHours(now, 2).getTime(),
//     read: true,
//
//   },
//   {
//     id: '1',
//     message: 'Notificacion de prueba 2',
//     createdAt: subHours(now, 2).getTime(),
//     read: false,
//   },
// ];
//


// const data = [
//   {
//     id: '5e8883f1b51cc1956a5a1ec0',
//     author: 'Jie Yang Song',
//     avatar: '/static/mock-images/avatars/avatar-jie_yan_song.png',
//     createdAt: subHours(now, 2).getTime(),
//     job: 'Remote React / React Native Developer',
//     read: true,
//     type: 'job_add'
//   },
//   {
//     id: 'bfb21a370c017acc416757c7',
//     author: 'Jie Yang Song',
//     avatar: '/static/mock-images/avatars/avatar-jie_yan_song.png',
//     createdAt: subHours(now, 2).getTime(),
//     job: 'Senior Golang Backend Engineer',
//     read: false,
//     type: 'job_add'
//   },
//   {
//     id: '20d9df4f23fff19668d7031c',
//     createdAt: subDays(now, 1).getTime(),
//     description: 'Logistics management is now available',
//     read: true,
//     type: 'new_feature'
//   },
//   {
//     id: '5e8883fca0e8612044248ecf',
//     author: 'Jie Yang Song',
//     avatar: '/static/mock-images/avatars/avatar-jie_yan_song.png',
//     company: 'Augmastic Inc',
//     createdAt: subHours(now, 2).getTime(),
//     read: false,
//     type: 'company_created'
//   }
// ];

/* Esto crea el HTML para las Notificaciones que se meterán en el menú de la campana en la barra de navegación.
*
* Use a date formatting library to format the date in a more user-friendly way. In JavaScript, you can use libraries
* like date-fns or moment.js to format dates.
*
* Modifiqué el formato de la fecha para que sea en español (día, mes, y año). Pongo el mes como "MMM" para decir
* que solo quiero imprimir las primeras del mes. Pongo "h:mm a" para que me imprima la hora en formato de 12 horas.
* Puse "locale: es" para que me imprima el mes en español.
* */
const getNotificationContent = (notification) => {

  // Switch / case. LO ELIMINARE MAS TARDE.
  switch (notification.type) {
    // case 'job_add':
    //   return (
    //     <>
    //       <ListItemAvatar sx={{ mt: 0.5 }}>
    //         <Avatar src={notification.avatar}>
    //           <UserCircleIcon fontSize="small" />
    //         </Avatar>
    //       </ListItemAvatar>
    //       <ListItemText
    //         primary={(
    //           <Box
    //             sx={{
    //               alignItems: 'center',
    //               display: 'flex',
    //               flexWrap: 'wrap'
    //             }}
    //           >
    //             <Typography
    //               sx={{ mr: 0.5 }}
    //               variant="subtitle2"
    //             >
    //               {notification.message}
    //             </Typography>
    //
    //             {/*Autor del Post de las notificaciones de Material UI. BORRAR.*/}
    //             {/*<Typography*/}
    //             {/*  sx={{ mr: 0.5 }}*/}
    //             {/*  variant="subtitle2"*/}
    //             {/*>*/}
    //             {/*  {notification.author}*/}
    //             {/*</Typography>*/}
    //
    //             {/* Esto elimina el texto "added a new job" de las Notificaciones de Prueba del Material UI */}
    //             {/*<Typography*/}
    //             {/*  sx={{ mr: 0.5 }}*/}
    //             {/*  variant="body2"*/}
    //             {/*>*/}
    //             {/*  added a new job*/}
    //             {/*</Typography>*/}
    //
    //             {/*Esto me pone enlaces a trabajos de la URL /dashboard/jobs. DEBO QUITAR ESTO.*/}
    //             {/*<Link*/}
    //             {/*  href="/dashboard/jobs"*/}
    //             {/*  underline="always"*/}
    //             {/*  variant="body2"*/}
    //             {/*>*/}
    //             {/*  {notification.job}*/}
    //             {/*</Link>*/}
    //           </Box>
    //         )}
    //         // Esto imprime la fecha en que fue creada la notificación.
    //         // secondary={(
    //         //   <Typography
    //         //     color="textSecondary"
    //         //     variant="caption"
    //         //   >
    //         //     {/*{format(notification.createdAt, 'MMM dd, h:mm a')}*/}
    //         //     {format(new Date(notification.createdAt * 1000), 'MMM dd, h:mm a')}
    //         //   </Typography>
    //         // )}
    //         sx={{ my: 0 }}
    //       />
    //     </>
    //   );
    //
    //
    // case 'new_feature':
    //   return (
    //     <>
    //       <ListItemAvatar sx={{ mt: 0.5 }}>
    //         <Avatar>
    //           <ChatAltIcon fontSize="small" />
    //         </Avatar>
    //       </ListItemAvatar>
    //       <ListItemText
    //         primary={(
    //           <Box
    //             sx={{
    //               alignItems: 'center',
    //               display: 'flex',
    //               flexWrap: 'wrap'
    //             }}
    //           >
    //             <Typography
    //               variant="subtitle2"
    //               sx={{ mr: 0.5 }}
    //             >
    //               New feature!
    //             </Typography>
    //             <Typography variant="body2">
    //               {notification.description}
    //             </Typography>
    //           </Box>
    //         )}
    //         // secondary={(
    //         //   <Typography
    //         //     color="textSecondary"
    //         //     variant="caption"
    //         //   >
    //         //                     {/*{format(notification.createdAt, 'MMM dd, h:mm a')}*/}
    //         //     {format(new Date(notification.createdAt * 1000), 'MMM dd, h:mm a')}
    //         //   </Typography>
    //         // )}
    //         sx={{ my: 0 }}
    //       />
    //     </>
    //   );
    // case 'company_created':
    //   return (
    //     <>
    //       <ListItemAvatar sx={{ mt: 0.5 }}>
    //         <Avatar src={notification.avatar}>
    //           <UserCircleIcon fontSize="small" />
    //         </Avatar>
    //       </ListItemAvatar>
    //       <ListItemText
    //         primary={(
    //           <Box
    //             sx={{
    //               alignItems: 'center',
    //               display: 'flex',
    //               flexWrap: 'wrap',
    //               m: 0
    //             }}
    //           >
    //             <Typography
    //               sx={{ mr: 0.5 }}
    //               variant="subtitle2"
    //             >
    //               {notification.author}
    //             </Typography>
    //             <Typography
    //               variant="body2"
    //               sx={{ mr: 0.5 }}
    //             >
    //               created
    //             </Typography>
    //
    //             {/*Otro enlace a /dashboard/jobs. DEBO QUITAR ESTO.*/}
    //             {/*<Link*/}
    //             {/*  href="/dashboard/jobs"*/}
    //             {/*  underline="always"*/}
    //             {/*  variant="body2"*/}
    //             {/*>*/}
    //             {/*  {notification.company}*/}
    //             {/*</Link>*/}
    //           </Box>
    //         )}
    //         // secondary={(
    //         //   <Typography
    //         //     color="textSecondary"
    //         //     variant="caption"
    //         //   >
    //         //                     {/*{format(notification.createdAt, 'MMM dd, h:mm a')}*/}
    //         //     {format(new Date(notification.createdAt * 1000), 'MMM dd, h:mm a')}
    //         //   </Typography>
    //         // )}
    //         sx={{ my: 0 }}
    //       />
    //     </>
    //   );

    // Tengo un switch / case. Eliminaré los casos anteriores. Todas mis propias notificaciones las meteré aquí.
      default:

      // Esto solo imprime las notificaciones que NO hayan sido leídas.
      if (!notification.read) {
          return (
            <>
              <ListItemAvatar sx={{ mt: 0.5 }}>
                <Avatar src={notification.avatar}>
                  <UserCircleIcon fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={(
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      flexWrap: 'wrap'
                    }}
                  >
                    {/* Esto imprime el mensaje de la notificación. */}
                    <Typography
                      sx={{ mr: 0.5 }}
                      variant="subtitle2"
                    >
                      {notification.message}
                    </Typography>

                    {/*Autor del Post de las notificaciones de Material UI. BORRAR.*/}
                    {/*<Typography*/}
                    {/*  sx={{ mr: 0.5 }}*/}
                    {/*  variant="subtitle2"*/}
                    {/*>*/}
                    {/*  {notification.author}*/}
                    {/*</Typography>*/}

                    {/* Esto elimina el texto "added a new job" de las Notificaciones de Prueba del Material UI */}
                    {/*<Typography*/}
                    {/*  sx={{ mr: 0.5 }}*/}
                    {/*  variant="body2"*/}
                    {/*>*/}
                    {/*  added a new job*/}
                    {/*</Typography>*/}

                    {/*Esto me pone enlaces a trabajos de la URL /dashboard/jobs. DEBO QUITAR ESTO.*/}
                    {/*<Link*/}
                    {/*  href="/dashboard/jobs"*/}
                    {/*  underline="always"*/}
                    {/*  variant="body2"*/}
                    {/*>*/}
                    {/*  {notification.job}*/}
                    {/*</Link>*/}
                  </Box>
                )}
                secondary={(

                  // Esto imprime la fecha en que fue creada la notificación.
                  <Typography
                    color="textSecondary"
                    variant="caption"
                  >
                    {/*{format(notification.createdAt, 'MMM dd, h:mm a')}*/}
                    {/*{format(new Date(notification.createdAt * 1000), 'MMM dd, h:mm a')}*/}

                    {/*{format(notification.created_at, 'MMM dd, h:mm a')}*/}
                    {/*{format(new Date(notification.created_at * 1000), 'MMM dd, h:mm a')}*/}

                    {/* Esto me imprime la fecha, pero con el formato de Timestamp, el cual es incorrecto */}
                    {/*{notification.created_at}*/}

                    {/* Esto me imprime la fecha y hora en un formato más legible. */}
                    {format(new Date(notification.created_at), 'dd MMM, yyyy h:mm a', { locale: es })}
                  </Typography>
                )}
                sx={{ my: 0 }}
              />
            </>
          );
      }
      // Fin del snippet que imprime mis propias Notificaciones
      // return null;
  }
};


/* Componente NotificationsPopover de React, el cual va a imprimir las Notificaciones sin Leer. Va revisar cada 5
* segundos la base de datos para buscar la mayoría de las notificaciones, pero revisará solo una vez al día las
* notificaciones que le recuerdan a los Clientes si tienen una clase el día siguiente. Esto es lo que renderiza el menú
* de notificaciones dentro del icono de la campana de las notificaciones de la barra de navegación.
*
* Para las notificaciones con los recordatorios que el día siguiente los Clientes tienen una clase, voy primero a
* revisar cada Clase, y revisaré el día actual. Si el día actual es un día antes de la fecha de la Clase, entonces
* crearé una notificación para todos los clientes que sean participantes de esa clase, y se los enviaré a esos
* clientes.
*
* 	La URL “1/events/send-class-reminders/” CREA las notificaciones, NO las busca en la base de datos. La API que busca
* las notificaciones sin leer en la base de datos es la que se ejecuta cada 5 segundos. Esa buscara si hay
* notificaciones de que mañana tienes clase. PERO, la API que se llamará una ve al día va a CREAR las notificaciones de
* que mañana tienes una clase.
*
* Aquí están los datos JSON de las Notificaciones de Prueba, los cuales tuve que borrar
*
* DEBO MODIFICAR ESTO para que muestre las notificaciones del modelo de Notifications de la base de datos.
*
* Las notificaciones que quiero meter las sacaré de la web app de Django usando una API.
*
* You can add a condition inside the default case of your switch statement to check if notification.read is false. If it
* is, then the notification will be printed. In this code, if (!notification.read) checks if notification.read is false.
* If it is, then the notification is printed. If notification.read is true, then nothing is returned and the
* notification is not printed.
*
* The issue you're facing is due to the fact that useState only initializes the state once, and it doesn't keep track of
* the changes in the data variable.  To solve this, you can directly use the data state variable instead of creating a
* new notifications state variable. In this code, data is used directly instead of creating a new notifications state
* variable. The setData function is used to update the data state when marking all notifications as read or removing a
* notification.
*
* The setInterval function allows you to execute a function repeatedly, starting after the interval of time, then
* repeating continuously at that interval. setInterval(fetchData, 5000); sets up an interval that calls fetchData every
* 5 seconds. The interval ID returned by setInterval is stored in intervalId. When the component unmounts, the interval
* is cleared by calling clearInterval(intervalId). This is important to prevent memory leaks.
*
* Here's a step-by-step algorithm to mark the notifications as read in the database by calling an API:
*
* 1) Create an API endpoint in Django: You need to create an API endpoint in your Django application that will receive
* the notification ID and the new read status. This endpoint should be able to handle both individual and all
* notifications.
*
* 2) Update the Notification model in Django: When the API endpoint is hit, it should update the read field of the
* Notification model in the Django application. If the notification ID received is 'all', then it should update all
* notifications.
*
* 3) Call the API from the Next.js application: In your Next.js application, you need to call this API endpoint whenever
*  a user clicks on the button to remove a specific notification or calls the handleMarkAllAsRead function. You can use
* the fetch function or any HTTP client like axios to do this.
* */
export const NotificationsPopover = (props) => {
  const { anchorEl, onClose, onUpdateUnread, open, ...other } = props;

  // Snippet que llama a la API de las Notificaciones de la web app de Django.
  const [data, setData] = useState([]);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ROOT}/api/notifications/`);

          // // DEBUGGEO. BORRAR DESPUES. Esto me imprime los datos JSON agarrados por la API de Notificaciones.
          // console.log("Fetched data:", response.data); // This line prints the fetched data to the console

          setData(response.data);
        } catch (error) {
          console.error("Error fetching data", error);
        }
      };

      fetchData();
      // fetchData().then(r => console.log("Data fetched"));

      // Esto llama a la API de las Notificaciones de la web app de Django cada 5 segundos.
      const intervalId = setInterval(fetchData, 5000); // 5000 ms = 5 s

      // Don't forget to clear the interval when the component unmounts
      return () => clearInterval(intervalId);
  }, []);


  // Fin del snippet que llama a la API de las Notificaciones de la web app de Django.

  // const [notifications, setNotifications] = useState(data);
  // const unread = useMemo(() => notifications.reduce((acc, notification) => acc + (notification.read
  //   ? 0
  //   : 1), 0), [notifications]);

  const unread = useMemo(() => data.reduce((acc, notification) => acc + (notification.read ? 0 : 1), 0), [data]);


  useEffect(() => {
    onUpdateUnread?.(unread);
  }, [onUpdateUnread, unread]);

  /* API que me genera un Token CSRF.
  *
  * Por motivos de ciberseguridad, Django requiere que se envíe un token CSRF con cada solicitud POST. Este token se
  * utiliza para proteger contra ataques de falsificación de solicitudes entre sitios (CSRF). Puedes obtener el token
  * CSRF de las cookies del navegador y enviarlo en el encabezado de la solicitud POST. Sin embargo, esta web
  * app hecha en React NO está generando ningun token de CSRF, ya que eso solo se genera con una web app de Django,
  * y esta web app de React no está conectada directamente a Django.
  *
  * El problema es que, para las notificaciones, necesito un Token CSRF para poder marcar las notificaciones como leídas
  * en la base de datos de Django. Sin embargo, no puedo obtener un Token CSRF de las cookies del navegador, ya que
  * esta web app de React no está conectada directamente a Django.
  *
  * Entonces, para solucionar eso, usaré esta API, la cual se conectará a Django para generarme un Token CSRF. Después
  * de eso, podré usar ese Token CSRF para marcar las notificaciones como leídas en la base de datos de Django.
  *
  * */
  // const getCsrfToken = async () => {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/csrf/`);
  //     const data = await response.json();
  //
  //     // // DEBUGGEO. BORRAR DESPUES. Esto me imprime el Token CSRF generado por la API.
  //     //   console.log("CSRF Token:", data.csrfToken); // This line prints the CSRF token to the console
  //
  //     return data.csrfToken;
  // }

  // // Funcion original que me marca todas las notificaciones como leídas. DESACTIVAR DESPUES.
  // const handleMarkAllAsRead = () => {
  //   // setNotifications((prevState) => prevState.map((notification) => ({
  //   //   ...notification,
  //   //   read: true
  //   // })));
  //
  //   // // Update the state locally.
  //   // // BUG: Esto hace que las notificaciones se conviertan en contenedores vacíos con el icono de la "x", en lugar de
  //   // // desaparecer.  // CORREGIR.
  //   // setData((prevState) => prevState.map((notification) => ({
  //   //   ...notification,
  //   //   read: true
  //   // })));
  //
  //   // Esto debería eliminar todas las notificaciones de manera similar a como se hace en handleRemoveOne().
  //   // TIENE QUE sear "read === true" en lugar de "read === false", ya que quiero eliminar las notificaciones leídas.
  //   // FUNCIONA.
  //   setData((prevState) => prevState.filter((notification) => notification.read === true));
  //
  // };

  /* Función que Marca Todas las Notificaciones como Leídas, el cual es llamada cuando clicas en el Icono del Sobre
  * Abierto.
  *
  * Le agregué una API para que me marque todas las notificaciones como leídas en el modelo de Notificaciones de la
  * base de datos en la web app de Django.
  *
  * Modify the handleMarkAllAsRead function to filter out the read notifications from the state, similar to how the
  * handleRemoveOne function works. This will remove the notifications from the state immediately, causing them to
  * disappear from the UI. In the modified version, I've replaced the map function with the filter function. This will
  * create a new array that includes only the notifications that have not been read. As a result, all read notifications
  * will be removed from the state, causing them to disappear from the UI immediately.
  */
  // const handleMarkAllAsRead = () => {
  const handleMarkAllAsRead = async () => {

    // Esto debería eliminar todas las notificaciones de manera similar a como se hace en handleRemoveOne().
    // TIENE QUE sear "read === true" en lugar de "read === false", ya que quiero eliminar las notificaciones leídas.
    setData((prevState) => prevState.filter((notification) => notification.read === true));

    // // Update the state locally
    // setData((prevState) => prevState.map((notification) => ({
    //   ...notification,
    //   read: true
    // })));

    // Get CSRF token from cookies
    // const csrftoken = document.cookie.split('; ').find(row => row.startsWith('csrftoken')).split('=')[1];
    // const csrftoken = document.cookie.split('; ').find((row, index, array) => row.startsWith('csrftoken'))?.split('=')[1];
    // const csrftoken = document.cookie.split('; ').find(row => row.startsWith('csrftoken'))?.split('=')[1];

    // // Get CSRF token from the backend
    // const csrftoken = await getCsrfToken();

    // Call the API to update the state in the backend
    // await fetch('http://localhost:8000/api/mark_as_read/', {
    await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/mark_as_read/`, {
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        // body: JSON.stringify({
        //   id: 'all',
        //   read: true
        // }),
          id: 'all',     // Esto selecciona todas las Notificaciones de la base de datos
          read: true    // Esto marca todas las Notificaciones seleccionadas como leídas
        }, {
          headers: {
            'Content-Type': 'application/json'
            // 'X-CSRFToken': csrftoken
          }
          // withCredentials: true     // Esto me permite enviar el Token CSRF con las cookies
        });
  }; // Fin de la función handleMarkAllAsRead

  // const handleRemoveOne = (notificationId) => {
  //   setNotifications((prevState) => prevState.filter((notification) => notification.id
  //     !== notificationId));
  // };

  /* Función para Eliminar Una Notificación si le clicas su respectivo botón con el icono de la "X". Si clicas la "x"
  * que está al lado de una Notificación del menú de Notificaciones, esto marcará esa notificación como leída, y la
  * eliminará.
  *
  * Le agregué una API para que me marque esa respectiva notificación como leída en el modelo de Notificaciones de la
  * base de datos en la web app de Django. es básicamente lo mismo que la función handleMarkAllAsRead, pero solo
  * marca la notificación seleccionada como leída.
  *
  * Tengo que decir específicamente que "read" debe cambiarse a "true". Así, podré modificar esta
  * notificación específica en la base de datos para que salga como leída.
  * */
  // const handleRemoveOne = (notificationId) => {
  const handleRemoveOne = async (id) => {
      // setData((prevState) => prevState.filter((notification) => notification.id !== notificationId));

      // Update the state locally
      setData((prevState) => prevState.filter((notification) => notification.id !== id));

      // Call the API to update the state in the backend
      // await fetch('http://localhost:8000/api/mark_as_read/', {
      await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/mark_as_read/`, {
        // method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        // body: JSON.stringify({
        //   id: id,
        //   read: true
        // }),

          id: id,   // Esto selecciona la ID de la Notificación que se va a marcar como leída.
          read: true    // Esto marca la Notificación seleccionada como leída.
        }, {
              headers: {
                'Content-Type': 'application/json',
              }
        } // Fin del "config"
        );
  };

  /* Esto renderiza el Icono de la Campana, y el menú de notificaciones dentro del icono de la campana de las
  * notificaciones de la barra de navegación.
  *
  * The selected code snippet is a part of a React component in your Next.js application that renders a Popover
  * component, which is essentially a small overlay of content that appears over the main content. This popover is used
  * to display notifications in your application.
  *
  *  The `Popover` component from Material-UI is used to create the overlay. It takes several props:
  *
  *  - `anchorEl` is the HTML element that the popover is positioned relative to.
  *  - `anchorOrigin` is an object that defines the origin point for the popover.
  *  - `onClose` is a function that is called when the popover is requested to be closed.
  *  - `open` is a boolean that controls whether the popover is open or not.
  *  - `PaperProps` is an object that contains props to be passed to the Paper component used to render the popover.
  *  - `transitionDuration` is the duration for the transition, in milliseconds.
  *
  *  Inside the `Popover`, there is a `Box` component that contains a title and a button to mark all notifications as
  * read. The `Typography` component is used to display the title "Notifications", and the `IconButton` component is
  * used to create the button. When the button is clicked, the `handleMarkAllAsRead` function is called.
  *
  *  Below the title and button, the code checks if there are any notifications to display. If the `data` array is empty
  * (i.e., there are no notifications), it displays a message saying "There are no notifications". If there are
  * notifications, it maps over the `data` array and creates a `ListItem` for each notification.
  *
  * Each `ListItem` displays the content of a notification, which is generated by the `getNotificationContent` function.
  * It also includes a button to remove the notification. When this button is clicked, the `handleRemoveOne` function is
  * called with the ID of the notification.
  *
  * You should replace 'notifications' with 'data' because 'data' is the state variable where you are storing the
  * fetched notifications.
  * */
  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom'
      }}
      onClose={onClose}
      open={!!open}
      PaperProps={{ sx: { width: 380 } }}
      transitionDuration={0}
      {...other}>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          px: 3,
          py: 2
        }}
      >
        {/* Esto es lo que me imprime el título de "Notifications" / Notificaciones en el menú de notificaciones. */}
        <Typography
          color="inherit"
          variant="h6"
        >
          {/*Notifications*/}
          Notificaciones
        </Typography>
        <Tooltip title="Mark all as read">
          <IconButton
            onClick={handleMarkAllAsRead}
            size="small"
            sx={{ color: 'inherit' }}
          >
            <MailOpenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {/*{notifications.length === 0*/}
      {data.length === 0
        ? (
          // Mensaje que imprime "No hay notificaciones"
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2">
              {/*There are no notifications*/}
              No hay notificaciones nuevas
            </Typography>
          </Box>
        )
        : (
          <Scrollbar sx={{ maxHeight: 400 }}>
            <List disablePadding>
              {/*{notifications.map((notification) => (*/}
              {data.map((notification) => (
                <ListItem
                  divider
                  key={notification.id}
                  sx={{
                    alignItems: 'flex-start',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    },
                    '& .MuiListItemSecondaryAction-root': {
                      top: '24%'
                    }
                  }}
                  secondaryAction={(
                    <Tooltip title="Remove">
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveOne(notification.id)}
                        size="small"
                      >
                        <XIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                >
                  {getNotificationContent(notification)}
                </ListItem>
              ))}
            </List>
          </Scrollbar>
        )}
    </Popover>
  );
};

NotificationsPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  onUpdateUnread: PropTypes.func,
  open: PropTypes.bool
};
