import React, { useEffect, useState } from 'react'; // Necesito esto para usar useEffect()
import Head from 'next/head';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from
        '@mui/material';    // Necesito esto para usar los componentes de Material-UI
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';

import axios from 'axios'; // Esto me deja usar Axios para llamar las APIs.


/* Página que te muestra la Lista de Campañas de Marketing por Email creadas desde el sitio web de Mailrelay.
*
* Tienes que hacer clic a una de las Campañas de Email de Mailrelay que te aparecerán aquí para ser redirigido a
* una página con la ID de esa Campaña de Mailrelay. En esa nueva página, puedes seleccionar a todos los clientes
* a los que quieres enviarle esa Campaña de Email.
*
* Las Campañas de Email de Mailrelay se obtendrán a través de una API de Django que llamará a la API de Mailrelay
* para listar / mostrar la lista de todas las Campañas de Email que fueron creadas desde el sitio web de Mailrelay.
*
* You can create a new React page by creating a new component. Here's a simple example of how you can create a new page
* called "Email Campaigns".
*
* This code creates a new React component called EmailCampaigns. This component returns a simple page with a title
* "Campañas de Marketing por Email". The getLayout function wraps the page in the DashboardLayout component, which
* includes the side navbar. The component is then exported as the default export of the module, so it can be used as a
* page in your Next.js application.  To make this page accessible at the "/email-campaigns" URL, you would need to save
* this file as index.js inside a new directory called email-campaigns in your pages directory. The structure would look
* like this: pages/email-campaigns/index.js.
* */

const EmailCampaigns = () => {

  // Variable en donde se meterán las Campañas de Email de Mailrelay cogidas por la API de Django
  const [campaigns, setCampaigns] = useState([]);

  /* API para coger la Lista de Campañas de Email de Mailrelay llamando a una API de Django.
  *
  * The fetchCampaigns async function is defined inside the useEffect hook. This function uses Axios to make a GET
  * request to your Django API. If the request is successful, the returned data is stored in the campaigns state
  * variable using the setCampaigns function. If an error occurs during the request, the error is logged to the console
  * and re-thrown. The fetchCampaigns function is then called to initiate the API request.
  * */
  useEffect(() => {
      const fetchCampaigns = async () => {
        try {
          const accessToken = localStorage.getItem('accessToken');
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ROOT}/api/mailrelay-list-of-campaigns/`, {
            headers: { Authorization: `JWT ${accessToken}` },
          });

          // Esto mete el JSON con las Campañas de Email en una variable que puedo usar fuera de esta función.
          setCampaigns(response.data);

          // DEBUGGEO. BORRAR. Esto imprime las Campañas de Email en la consola.
          console.log(response.data);

        } catch (e) {
          console.error(e);
          throw new Error(e.response.data.detail);
        }
  };

  fetchCampaigns();
}, []);

  /* Esto imprime el HTML del Formulario.
  *
  * You can create a table to display the list of campaigns. You can use the Table component from the Material-UI
  * library to create the table. a Table component is added to the render method of the EmailCampaigns component. This
  * table has three columns: "ID", "Title", and "Date Created". The campaigns state variable is mapped to a list of
  * TableRow components, each containing the ID, title, and creation date of a campaign.
  *
  *
  * */
  return (
    <>
      <Head>
        <title>Email Campaigns</title>
      </Head>
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          flexGrow: 1,
          py: 8
        }}
      >
        <Typography variant="h4">
          Campañas de Marketing por Email
        </Typography>

        {/* Tabla que muestra las Lista de las Campañas de Email */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Grupo a Enviar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {campaign.id}
                  </TableCell>
                  <TableCell>{campaign.subject}</TableCell>
                  <TableCell>{campaign.target}</TableCell> {/* Replace 'created_at' with the actual property name in your data */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer> {/* Fin de la Tabla que muestra las Lista de las Campañas de Email */}

      </Box>
    </>
  );
};

EmailCampaigns.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default EmailCampaigns;