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
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import { useEffect,useState, useCallback } from "react";
import { useMounted } from '../../hooks/use-mounted';
import { taxApi } from '../../api/tax-api';
import { voucherApi } from '../../api/voucher-api';

// TODO: estos valores deberían estar en el store(Copiar la lógica de create form)

export const VoucherEditForm = (props) => {
  const { voucher, ...other } = props;
  const [taxes, setTaxes] = useState([])
  const isMounted = useMounted();
  const [selectedRadio, setSelectedRadio ] = useState(1)
  const [precioConIva, setPrecioConIva] = useState(0)
  const [precioSinIva, setPrecioSinIva] = useState(0)

  const getTaxes = useCallback(async () => {
    try {
      const data = await taxApi.getTaxes();
      if (isMounted()) {
        setTaxes(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(()=>{
      getTaxes()
  },[])

  const formik = useFormik({
    initialValues: {
      gym:1,
      name: voucher.name || '',
      category: voucher.category || '',
      price: voucher.price || 0,
      tax: voucher.tax || '',
      description:voucher.description || '',
      valid_for: voucher.valid_for || 0,
      valid_from: voucher.valid_from || new Date(),
      submit: null,
      is_active: voucher.is_active
    },
    validationSchema: Yup.object({
      name: Yup.string().required(),
      price: Yup.number().min(0).required(),
    }),
    onSubmit: async (values, helpers) => {
      try {
        if(selectedRadio==2) values.price = precioSinIva.toFixed(2)
        await voucherApi.updateVoucher(voucher.id,values)
        toast.success(`Bono "${values.name}" modificado`);
        location.href='/vouchers'
      } catch (err) {
        console.error(err);
        toast.error('No se ha podido modificar el bono');
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    }
  });

  const handleStartDateChange = (newValue) => {
    formik.setFieldValue("valid_from", newValue);
  };

  const handleChangeRadio = (event) => {
    setSelectedRadio(event.target.value)
  };
  useEffect(() => {
    if (selectedRadio == 1) {
      if (formik.values.price) {
        setPrecioSinIva(formik.values.price);
        if(formik.values.tax){
          let pg =100;
          taxes?.map((e)=> {
            if(e.id==formik.values.tax) pg=e.percentage
          })
          setPrecioConIva(parseFloat(formik.values.price) * (pg/100) + parseFloat(formik.values.price));
        }else{
          setPrecioConIva(formik.values.price)
        }

      } else {
        setPrecioSinIva(0);
        setPrecioConIva(0);
      }
    }
    if (selectedRadio == 2) {
      if (formik.values.price) {
        setPrecioConIva(formik.values.price);
        if(formik.values.tax){
          let pg =100;
          taxes?.map((e)=> {
            if(e.id==formik.values.tax) pg=e.percentage
          })
          setPrecioSinIva(parseFloat(formik.values.price) - parseFloat(formik.values.price) * (pg/100));
        }else{
          setPrecioSinIva(formik.values.price)
        }
      } else {
        setPrecioConIva(0);
        setPrecioSinIva(0);
      }
    }
  }, [formik.values.price, selectedRadio, formik.values.tax, taxes]);


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
              <TextField
                error={Boolean(formik.touched.category && formik.errors.category)}
                fullWidth
                helperText={formik.touched.category && formik.errors.category}
                label="Categoría"
                name="category"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.category}
              />
              </Box>

              <Box sx={{ mt: 4 }}>
              <TextField
                error={Boolean(formik.touched.tax && formik.errors.tax)}
                fullWidth
                label="Impuesto"
                name="tax"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                select
                value={formik.values.tax}
              >
                {taxes.map((option) => (
                  <MenuItem
                    key={option.id}
                    value={option.id}
                  >
                    {option.name} %{option.percentage}
                  </MenuItem>
                ))}
              </TextField>
              </Box>
              <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    error={Boolean(formik.touched.price && formik.errors.price)}
                    fullWidth
                    helperText={formik.touched.price && formik.errors.price}
                    label="Importe del bono"
                    name="price"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.price}
                    type='number'
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                  <RadioGroup
                    aria-label="options"
                    name="options"
                    value={selectedRadio}
                    onChange={handleChangeRadio}
                    sx={{ display: 'flex', flexDirection: 'row' }}
                  >
                    <FormControlLabel value="1" control={<Radio />} label="Sin IVA" />
                    <FormControlLabel value="2" control={<Radio />} label="Con IVA" disabled={!formik.values.tax}/>
                  </RadioGroup>
                </Grid>
              </Grid>

              <p>El precio sin IVA será {parseFloat(precioSinIva).toFixed(2)} &euro;</p>
              <p>El precio con IVA será {parseFloat(precioConIva).toFixed(2)} &euro;</p>
              </Box>
              <Box sx={{ mt: 4 }}>
              <TextField
                error={Boolean(formik.touched.description && formik.errors.description)}
                fullWidth
                helperText={formik.touched.description && formik.errors.description}
                label="Descripción"
                name="description"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.description}
              />
              </Box>

              <Box sx={{ mt: 2 }}>
              <TextField
                error={Boolean(formik.touched.valid_for && formik.errors.valid_for)}
                fullWidth
                helperText={formik.touched.valid_for && formik.errors.valid_for}
                label="Días totales del bono"
                name="valid_for"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.valid_for}
              />
              </Box>
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  mt: 3
                }}
              >
                <MobileDatePicker
                  error={Boolean(formik.touched.valid_from && formik.errors.valid_from)}
                  label="Fecha inicio validez"
                  inputFormat="dd/MM/yyyy"
                  value={formik.values.valid_from}
                  name="valid_from"
                  onChange={handleStartDateChange}
                  onBlur={formik.handleBlur}
                  renderInput={(inputProps) => <TextField {...inputProps} />}
                />

                <TextField
                  fullWidth
                  label="Estado"
                  name="is_active"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  select
                  value={formik.values.is_active}
                  sx={{pl:3}}
                >
                  <MenuItem key={1} value={true}> Activo </MenuItem>
                  <MenuItem key={2} value={false}> Inactivo </MenuItem>
                </TextField>
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
        <NextLink href='/vouchers'>
        <Button
          sx={{ m: 1 }}
          variant="outlined"
        >
          Cancel
        </Button>
        </NextLink>
        <Button
          sx={{ m: 1 }}
          type="submit"
          variant="contained"
        >
          Update
        </Button>
      </Box>
    </form>
  );
};

VoucherEditForm.propTypes = {
  voucher: PropTypes.object.isRequired
};