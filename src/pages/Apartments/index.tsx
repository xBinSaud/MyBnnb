import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TablePagination,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import { useApartments } from "../../hooks/useApartments";
import { AddApartmentDialog } from "../../components/AddApartmentDialog";
import { EditApartmentDialog } from "../../components/EditApartmentDialog";
import { formatPrice } from "../../utils/dateUtils";

export default function Apartments() {
  const { t } = useTranslation();
  const { apartments, loading, error } = useApartments();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApartment, setSelectedApartment] = useState<string | null>(
    null
  );
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [_, setOpenDeleteDialog] = useState(false);

  const handleEditClick = (apartmentId: string) => {
    setSelectedApartment(apartmentId);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (apartmentId: string) => {
    setSelectedApartment(apartmentId);
    setOpenDeleteDialog(true);
  };

  // const handleConfirmDelete = async () => {
  //   if (selectedApartment) {
  //     try {
  //       await deleteApartment(selectedApartment);
  //       setOpenDeleteDialog(false);
  //       setSelectedApartment(null);
  //     } catch (error) {
  //       console.error("Error deleting apartment:", error);
  //     }
  //   }
  // };

  const filteredApartments = apartments.filter((apartment) =>
    apartment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1">
          {t("apartments.title")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenAddDialog(true)}
          startIcon={<AddIcon />}
        >
          إضافة شقة جديدة
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="البحث عن شقة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>اسم الشقة</TableCell>
              <TableCell>الموقع</TableCell>
              <TableCell>السعر لليلة</TableCell>
              <TableCell>المميزات</TableCell>
              <TableCell align="center">الصور</TableCell>
              <TableCell align="center">إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApartments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((apartment) => (
                <TableRow key={apartment.id} hover>
                  <TableCell>{apartment.name}</TableCell>
                  <TableCell>{apartment.location}</TableCell>
                  <TableCell>{formatPrice(apartment.pricePerNight)}</TableCell>
                  <TableCell>{apartment.amenities.join("، ")}</TableCell>
                  <TableCell align="center">
                    {apartment.images && apartment.images.length > 0 ? (
                      <Box
                        component="img"
                        src={apartment.images[0]}
                        alt={apartment.name}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <IconButton disabled>
                        <ImageIcon color="disabled" />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(apartment.id)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(apartment.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredApartments.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="عدد الصفوف:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} من ${count}`
        }
      />

      <AddApartmentDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />

      <EditApartmentDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedApartment(null);
        }}
        apartment={apartments.find((a) => a.id === selectedApartment) || null}
      />

      {/* Delete Confirmation Dialog */}
      {/* <Dialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedApartment(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف هذه الشقة؟ لا يمكن التراجع عن هذا الإجراء.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDeleteDialog(false);
              setSelectedApartment(null);
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog> */}
    </Box>
  );
}
