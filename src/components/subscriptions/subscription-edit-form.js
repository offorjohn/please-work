import NextLink from 'next/link';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { MobileDatePicker } from '@mui/x-date-pickers';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  FormHelperText,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { wait } from '../../utils/wait';
import { getActivitys} from "../../slices/gym";
import { useEffect,useCallback,useState } from "react";
import { useMounted } from '../../hooks/use-mounted';
import { groupApi } from '../../api/group-api';
import { subscriptionApi } from '../../api/subscription-api';

// Esto me deja redirigir al usuario a la lista de Suscripciones al terminar de editar una suscripción.
import Router from "next/router";

/* Formulario para Editar el Precio de Una Suscripción / Importe de una Cuota.
*
* AQUI TENGO QUE ARREGLAR UN BUG en el que, si edito el precio de la cuota, no se edita el precio de la suscripción
* para los clientes que ya estaban suscritos a ella.
*
* Es más, ni siquiera se puede modificar el Precio de la Suscripción.
* */


export const SubscriptionEditForm = (props) => {

  const isMounted = useMounted();
  const [groups, setGroups] = useState([]);
  const getGroups = useCallback(async () => {
    try {
      const data = await groupApi.getGroups();

      if (isMounted()) {
        setGroups(data);

      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
      getGroups();
    },
    []);

  const { subscription, ...other } = props;

  const formik = useFormik({
    initialValues: {
      name: subscription.name || '',
      groups: subscription.formikGroups || [],
      price: subscription.price || 0,
      is_active: subscription.is_active || false,
      first_rate_defferal: subscription.first_rate_defferal || false,
      submit: null,
      gym:1
    },
    validationSchema: Yup.object({
      name: Yup.string().required(),
      price: Yup.number().min(0).required(),
    }),
    onSubmit: async (values, helpers) => {
      try {
        // NOTE: Make API request
        let response = subscriptionApi.updateSubscription(subscription.id,{
          name: values.name,
          groups: values.groups.map(group => group.id),
          price:values.price,
          is_active:values.is_active,
          first_rate_defferal: values.first_rate_defferal,
          gym:1,
          price_id_stripe:subscription.price_id_stripe
        })
        //console.log(response)
        toast.success(`Cuota "${values.name}" modificada`);

        // Esto te redirige a la lista de Suscripciones al terminar de editar una suscripción.
        Router.push('/subscriptions').catch(console.error);
        // router.push('/dashboard/products').catch(console.error);
      } catch (err) {
        console.error(err);
        toast.error('No se ha podido modificar la cuota');
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    }
  });

  /* Formulario para Editar el Precio de Una Suscripción / Importe de una Cuota.
  *
  * Aquí tenía un bug en el que no podía editar el campo del Precio de la Cuota, aún aunque desactivara el atributo
  * "read only".
  *
  * The "Importe de la Cuota" component for the price was not editable because the `value` prop is set to
  * `subscription.price` which is a prop passed to the component and not a state variable. This means that even though
  * the TextField is not read-only, it does not update when you type into it because its value is tied to a prop that
  * does not change.
  *
  * To solve this, you should bind the `value` prop of the TextField to `formik.values.price` instead of
  * `subscription.price`. This way, the TextField's value will be tied to Formik's state and will update as you type
  * into it. In the fixed version, the TextField's value is tied to `formik.values.price` and it updates whenever you
  * type into it because of the `onChange` prop.
  *
  * */
  return (
    <form
      onSubmit={formik.handleSubmit}
      {...props}>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              md={4}
              xs={12}
            >
              <Typography variant="h6">
                Datos generales
              </Typography>
            </Grid>
            <Grid
              item
              md={8}
              xs={12}
            >
              <Box sx={{ mt: 4 }}>
              <TextField
                error={Boolean(formik.touched.name && formik.errors.name)}
                fullWidth
                label="Nombre"
                name="name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.name}
              >
              </TextField>
              </Box>
              {Boolean(formik.touched.name && formik.errors.name) && (
                <Box sx={{ mt: 2 }}>
                  <FormHelperText error>
                    {formik.errors.name}
                  </FormHelperText>
                </Box>
              )}
              <Box sx={{ mt: 4 }}>
              <Autocomplete
                id="groups"
                options={groups}
                getOptionLabel= {(option) => option.name}
                fullWidth
                label="Grupo de Actividades"
                name="groups"
                onBlur={formik.handleBlur}
                onChange={(e, value) =>{
                  formik.setFieldValue("groups", value)
                }}
                multiple
                value={formik.values.groups}
                isOptionEqualToValue={(option, value) => {option.id === value.id}}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    error={Boolean(formik.touched.groups && formik.errors.groups)}
                    label="Grupo de Actividades"
                    placeholder="Añadir"
                  />
                  )}
              >
              </Autocomplete>
              </Box>

              {/* Precio de la Suscripción / Importe de la Cuota */}
              {/*ESTO TIENE UN BUG: NO SE PUEDE MODIFICAR EL PRECIO DE LA CUOTA.*/}
              {/* Y, al parecer, aunque lo modifique, no se edita el precio de la suscripción para los * /}
              {/* clientes que ya estaban suscritos a ella. */}
              <Box sx={{ mt: 2 }}>
              <TextField
                error={Boolean(formik.touched.price && formik.errors.price)}
                fullWidth
                helperText={formik.touched.price && formik.errors.price}
                label="Importe de la cuota"
                name="price"
                // value={subscription.price}
                value={formik.values.price} // Esto me permite modificar el precio de la suscripción
                onChange={formik.handleChange}  // Esto también me permite modificar el precio de la suscripción
                // readOnly={true} // DEBO ELIMINAR ESTO ya que no me deja editar el precio de una suscripción
              />
              </Box>

        <Divider sx={{ my: 3 }} />
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <Typography
                gutterBottom
                variant="subtitle1"
              >
                {formik.values.is_active && "La cuota está activa."}
                {!formik.values.is_active && "La cuota no está activa."}
              </Typography>
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{ mt: 1 }}
              >
                {formik.values.is_active && "Desmarca esta opción para desactivar la cuota. El cliente no podrá usar los servicios del gimnasio hasta que la cuota esté activa."}
                {!formik.values.is_active && "Marca esta opción para activar la cuota. El cliente podrá disfrutar del plan que ha contratado."}
              </Typography>
            </div>
            <Switch
              checked={formik.values.is_active}
              color="primary"
              edge="start"
              name="is_active"
              onChange={formik.handleChange}
              value={formik.values.is_active}
            />
          </Box>
        <Divider sx={{ my: 3 }} />
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <Typography
                gutterBottom
                variant="subtitle1"
              >
                {formik.values.first_rate_defferal && "Primera cuota reducida."}
                {!formik.values.first_rate_defferal && "Primera cuota entera."}
              </Typography>
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{ mt: 1 }}
              >
                {formik.values.first_rate_defferal && "Desmarca esta opción para que la primera cuota sea entera."}
                {!formik.values.first_rate_defferal && "Marca esta opción para calcular la primera cuota en base al número proporcionales de días que quedan en el mes."}
              </Typography>
            </div>
            <Switch
              checked={formik.values.first_rate_defferal}
              color="primary"
              edge="start"
              name="first_rate_defferal"
              onChange={formik.handleChange}
              value={formik.values.first_rate_defferal}
            />
          </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          mx: -1,
          mb: -1,
          mt: 3
        }}
      >
        <NextLink href='/subscriptions'>
        <Button
          sx={{ m: 1 }}
          variant="outlined"
        >
          Cancelar
        </Button>
        </NextLink>
        <Button
          sx={{ m: 1 }}
          type="submit"
          variant="contained"
        >
          Actualizar
        </Button>
      </Box>
    </form>
  );
};

SubscriptionEditForm.propTypes = {
  subscription: PropTypes.object.isRequired
};