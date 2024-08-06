import NextLink from "next/link";
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { MobileDatePicker } from '@mui/x-date-pickers';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import { useEffect,useState, useCallback } from "react";
import { useMounted } from '../../hooks/use-mounted';
import { productApi } from "../../api/product-api";
import { taxApi } from "../../api/tax-api"
import { supplierApi } from "../../api/supplier-api"

export const ProductCreateForm = (props) => {
  const [taxes, setTaxes] = useState([])
  const [suppliers, setSuppliers] = useState([])
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

  const getSuppliers = useCallback(async () => {
    try {
      const data = await supplierApi.getSuppliers();
      if (isMounted()) {
        setSuppliers(data.filter(s=>s.is_active));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(()=>{
      getTaxes();
      getSuppliers()
  },[])

  const formik = useFormik({
    initialValues: {
      gym:1,
      name: '',
      category: '',
      price: '',
      brand:'',
      color:'',
      dimensions:'',
      supplier:'',
      tax: '',
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required(),
      price: Yup.number().min(0).required()
    }),
    onSubmit: async (values, helpers) => {
      try {
        if(selectedRadio==2) values.price = precioSinIva.toFixed(2)
        await productApi.createProduct(values)
        toast.success(`Nuevo producto "${values.name}" creado`);
    
      } catch (err) {
        console.error(err);
        toast.error('No se ha podido crear el producto');
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    }
  });

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
          setPrecioConIva(formik.values.price * (pg/100) + formik.values.price);
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
          setPrecioSinIva(formik.values.price - formik.values.price * (pg/100));
        }else{
          setPrecioSinIva(formik.values.price)
        }
      } else {
        setPrecioConIva(0);
        setPrecioSinIva(0);
      }
    }
  }, [formik.values.price, selectedRadio, formik.values.tax]);

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
                    label="Importe del producto"
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

              <p>El precio sin IVA será {precioSinIva.toFixed(2)} &euro;</p>
              <p>El precio con IVA será {precioConIva.toFixed(2)} &euro;</p>
              </Box>
              <Box sx={{ mt: 4 }}>
              <TextField
                error={Boolean(formik.touched.brand && formik.errors.brand)}
                fullWidth
                helperText={formik.touched.brand && formik.errors.brand}
                label="Marca"
                name="brand"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.brand}
              />
              </Box>
              <Box sx={{ mt: 4 }}>
              <TextField
                error={Boolean(formik.touched.color && formik.errors.color)}
                fullWidth
                helperText={formik.touched.color && formik.errors.color}
                label="Color"
                name="color"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.color}
              />
              </Box>
              <Box sx={{ mt: 4 }}>
              <TextField
                error={Boolean(formik.touched.dimensions && formik.errors.dimensions)}
                fullWidth
                helperText={formik.touched.dimensions && formik.errors.dimensions}
                label="Dimensiones"
                name="dimensions"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.dimensions}
              />
              </Box>

              <Box sx={{ mt: 4 }}>
              <TextField
                error={Boolean(formik.touched.supplier && formik.errors.supplier)}
                fullWidth
                label="Proveedor"
                name="supplier"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                select
                value={formik.values.supplier}
              >
                {suppliers.map((option) => (
                  <MenuItem
                    key={option.id}
                    value={option.id}
                  >
                    {option.name}
                  </MenuItem>
                ))}
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
        <NextLink href='/products'>
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
          Create
        </Button>
      </Box>
    </form>
  );
};