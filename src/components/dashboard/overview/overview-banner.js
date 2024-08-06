import PropTypes from 'prop-types';
import { Box, Button, Card, Chip, Typography } from '@mui/material';

/* Banner azul / purpura claro que aparece en la parte superior de la Página de Inicio que muestra el dibujo de
* un ordenador, el cual se encuentra en la URL /dashboard.
*
* */

export const OverviewBanner = (props) => {
  const { onDismiss, ...other } = props;

  return (
    <Card
      sx={{
        alignItems: 'center',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        flexDirection: {
          xs: 'column',
          md: 'row'
        },
        p: 4
      }}
      {...other}>
      <Box
        sx={{
          mr: 4,
          width: 200,
          height: 200,
          '& img': {
            height: 200,
            width: 'auto'
          }
        }}
      >
        <img
          alt=""
          src="/static/banner-illustration.png"
        />
      </Box>
      <div>
        <div>
          <Chip
            color="secondary"
            label="Novedad!"
          />
        </div>
        <Typography
          color="inherit"
          sx={{ mt: 2 }}
          variant="h4"
        >
          ¡Bienvenido al panel de Administración del Gimnasio!
        </Typography>
        <Typography
          color="inherit"
          sx={{ mt: 1 }}
          variant="subtitle2"
        >
          Desde aquí puedes navegar a la sección de configuración del Gym, donde puedes crear y modificar los espacios y las salas de tu gimnasio, configurar actividades y gestionar tus clientes.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            color="secondary"
            onClick={onDismiss}
            variant="contained"
          >
            Ocultar mensaje inicial.
          </Button>
        </Box>
      </div>
    </Card>
  );
};

OverviewBanner.propTypes = {
  onDismiss: PropTypes.func
};
