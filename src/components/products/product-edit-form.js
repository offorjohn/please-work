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
  FormControlLabel,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useEffect,useState, useCallback } from "react";
import { useMounted } from '../../hooks/use-mounted';
import { taxApi } from '../../api/tax-api';
import { productApi } from '../../api/product-api';
import { supplierApi } from '../../api/supplier-api';
import { Scrollbar } from '../scrollbar';
import { saleApi } from '../../api/sale-api';
import { clientApi } from '../../api/client-api';

let items=[]

export const ProductEditForm = (props) => {
  const { product, ...other } = props;
  const [taxes, setTaxes] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const isMounted = useMounted();
  const [selectedRadio, setSelectedRadio ] = useState(1)
  const [precioConIva, setPrecioConIva] = useState(0)
  const [precioSinIva, setPrecioSinIva] = useState(0)
  const [stockMovs, setStockMovs] = useState([])
  const [sales, setSales] = useState([])
  const [stock, setStock] = useState(0)
  const [openModal, setOpenModal] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [addStock,setAddStock] = useState(false)

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
        setSuppliers(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);
  const getStockMovs = useCallback(async () => {
    try {
      const data = await productApi.getProductStock(product.id);
      const data_vendedores = await saleApi.getSellers();
      const new_movs = [];

      for (const s of data) {
        let vendedor = '';
        for (const v of data_vendedores) {
          if (v.id === s.employee) {
            vendedor = v;
            break;
          }
        }
        s.vendedor = vendedor.username;
        new_movs.push(s)
      }
      if (isMounted()) {
        setStockMovs(new_movs);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);
  const getSales = useCallback(async () => {
    try {
      const data = await productApi.getProductSales(product.id);
      const new_sales = [];

      for (const s of data) {
        const data_cliente = await clientApi.getClient(s.buyer);
        s.comprador = data_cliente.first_name +" " + data_cliente.last_name;
        new_sales.push(s)
      }
      if (isMounted()) {
        setSales(new_sales);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);
  const getStock = useCallback(async () => {
    try {
      let s =0;
      for (const m of stockMovs) {
       s+=parseInt(m.amount)
      }
      for (const v of sales) {
        s--;
       }
      if (isMounted()) {
        setStock(s);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted,stockMovs,sales]);

  useEffect(()=>{
      getTaxes()
      getSuppliers()
      getStockMovs()
      getSales()
  },[])
  useEffect(()=>{
    getStock()
  },[stockMovs,sales,product])

  const formik = useFormik({
    initialValues: {
      gym:1,
      name: product.name || '',
      category: product.category || '',
      price: product.price || '',
      brand: product.brand || '',
      color: product.color || '',
      dimensions: product.dimensions || '',
      supplier: product.supplier || '',
      tax: product.tax || '',
      submit: null,
      is_active: product.is_active
    },
    validationSchema: Yup.object({
      name: Yup.string().required(),
      price: Yup.number().min(0).required(),
    }),
    onSubmit: async (values, helpers) => {
      try {
        if(selectedRadio==2) values.price = precioSinIva.toFixed(2)
        await productApi.updateProduct(product.id,values)
        toast.success(`Producto "${values.name}" modificado`);
        location.href='/products'
      } catch (err) {
        console.error(err);
        toast.error('No se ha podido modificar el producto');
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

  const handleOpenModal = (type) => {
    setOpenModal(true);
    if(type=='add') setAddStock(true)
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setAddStock(false)
  };

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
  };

  const handleAdd =async () => {
    try{
      const emp = await saleApi.getSellerByEmail(localStorage.getItem('user_email'))
      if(emp.type=="EMPLOYEE") await productApi.createProductStock({amount:quantity,employee:emp.id,product:product.id})
      else await productApi.createProductStock({amount:quantity,employee:2,product:product.id})
      getStockMovs()
      getStock()
      setQuantity(0)
    }catch(e){
      console.log(e)
    }

    handleCloseModal();
  };

  const handleSubtract = async() => {
    try{
      const emp = await saleApi.getSellerByEmail(localStorage.getItem('user_email'))
      if(emp.type=="EMPLOYEE") await productApi.createProductStock({amount:-quantity,employee:emp.id,product:product.id})
      else await productApi.createProductStock({amount:-quantity,employee:2,product:product.id})
      getStockMovs()
      getStock()
      setQuantity(0)
    }catch(e){
      console.log(e)
    }

    handleCloseModal();
  };

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

              <p>El precio sin IVA será {parseFloat(precioSinIva).toFixed(2)} &euro;</p>
              <p>El precio con IVA será {parseFloat(precioConIva).toFixed(2)} &euro;</p>
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
              <Box sx={{mt: 3}}>
                <TextField
                  fullWidth
                  label="Estado"
                  name="is_active"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  select
                  value={formik.values.is_active}
                >
                  <MenuItem key={1} value={true}> Activo </MenuItem>
                  <MenuItem key={2} value={false}> Inactivo </MenuItem>
                </TextField>
              </Box>

            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Typography variant="h6">
                Stock
              </Typography>
            </Grid>
            <Grid item md={8} xs={12} container alignItems="center" spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Cantidad"
                  variant="outlined"
                  fullWidth
                  value={stock}
                />
              </Grid>
              <Grid item xs={4}>
                <Button variant="contained" color="primary" fullWidth onClick={()=>handleOpenModal('add')}>
                  Añadir
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button variant="contained" color="secondary" fullWidth onClick={()=>handleOpenModal('subtract')}>
                  Descontar
                </Button>
              </Grid>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Typography variant="h6">
                Movimientos stock
              </Typography>
            </Grid>
            <Grid
              item
              md={8}
              xs={12}
            >
              <Scrollbar>
                <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                        <TableRow>
                        <TableCell>Id</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Empleado</TableCell>
                        <TableCell>Fecha y hora</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stockMovs.map((item) => {

                        return (
                            <TableRow hover
                                key={item.id} >

                            <TableCell>
                                <Box
                                sx={{
                                    alignItems: "center",
                                    display: "flex",
                                }}
                                >
                                <Box sx={{ ml: 1 }}>
                                    <Link
                                    color="inherit"
                                    variant="subtitle2">
                                        {item.id}
                                    </Link>
                                </Box>
                                </Box>

                            </TableCell>
                            <TableCell>
                                <Box
                                sx={{
                                    alignItems: "center",
                                    display: "flex",
                                }}
                                >
                                <Box sx={{ ml: 1 }}>
                                <Link
                                    color="inherit"
                                    variant="subtitle2">
                                        {item.amount}
                                    </Link>
                                </Box>
                                </Box>

                            </TableCell>
                            <TableCell>
                                <Typography color="success.main"
                                variant="subtitle2">
                                {`${item.vendedor}`}
                                </Typography>
                            </TableCell>
                            <TableCell>
                              {`${new Date(item.created_at).toLocaleDateString('es-ES')+" "+new Date(item.created_at).getHours()+":"+new Date(item.created_at).getMinutes().toString().padStart(2, '0')}`}
                            </TableCell>

                            </TableRow>
                        );
                        })}
                    </TableBody>
                    </Table>
                </Scrollbar>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Typography variant="h6">
                Últimos clientes que lo compraron
              </Typography>
            </Grid>
            <Grid
              item
              md={8}
              xs={12}
            >
              <Scrollbar>
                <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                        <TableRow>
                        <TableCell>Id</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Fecha y hora</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sales.map((item) => {

                        return (
                            <TableRow hover
                                key={item.id} >

                            <TableCell>
                                <Box
                                sx={{
                                    alignItems: "center",
                                    display: "flex",
                                }}
                                >
                                <Box sx={{ ml: 1 }}>
                                    <Link
                                    color="inherit"
                                    variant="subtitle2">
                                        {item.id}
                                    </Link>
                                </Box>
                                </Box>

                            </TableCell>
                            <TableCell>
                                <Box
                                sx={{
                                    alignItems: "center",
                                    display: "flex",
                                }}
                                >
                                <Box sx={{ ml: 1 }}>
                                <Link
                                    color="inherit"
                                    variant="subtitle2">
                                        1
                                    </Link>
                                </Box>
                                </Box>

                            </TableCell>
                            <TableCell>
                                <Typography color="success.main"
                                variant="subtitle2">
                                {`${item.comprador}`}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {`${new Date(item.created_at).toLocaleDateString('es-ES')+" "+new Date(item.created_at).getHours()+":"+new Date(item.created_at).getMinutes().toString().padStart(2, '0')}`}
                            </TableCell>

                            </TableRow>
                        );
                        })}
                    </TableBody>
                    </Table>
                </Scrollbar>
            </Grid>
          </Grid>
          <Dialog open={openModal} onClose={handleCloseModal}>
            <DialogTitle>Ingrese la cantidad</DialogTitle>
            <DialogContent>
              <TextField
                label="Cantidad"
                variant="outlined"
                fullWidth
                value={quantity}
                onChange={handleQuantityChange}
                sx={{mt:2}}
                type='number'
                inputProps={{ min: 0, step:1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="primary">
                Cancelar
              </Button>
              {addStock?
              <Button onClick={handleAdd} color="primary">
                Añadir
              </Button> :
              <Button onClick={handleSubtract} color="primary">
                Descontar
              </Button>
              }
            </DialogActions>
          </Dialog>
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
          Update
        </Button>
      </Box>
    </form>
  );
};

ProductEditForm.propTypes = {
  product: PropTypes.object.isRequired
};