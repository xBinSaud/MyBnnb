import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useApartments } from '../hooks/useApartments';
import { uploadImage } from '../config/cloudinary';
import type { Apartment } from '../config/firebase';

interface EditApartmentDialogProps {
  open: boolean;
  onClose: () => void;
  apartment: Apartment | null;
}

export const EditApartmentDialog: React.FC<EditApartmentDialogProps> = ({
  open,
  onClose,
  apartment,
}) => {
  const { updateApartment } = useApartments();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (apartment) {
      setName(apartment.name);
      setDescription(apartment.description || '');
      setLocation(apartment.location);
      setPricePerNight(apartment.pricePerNight.toString());
      setAmenities(apartment.amenities);
      setImages(apartment.images || []);
    }
  }, [apartment]);

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleDeleteAmenity = (amenityToDelete: string) => {
    setAmenities(amenities.filter(amenity => amenity !== amenityToDelete));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      try {
        setUploading(true);
        const file = event.target.files[0];
        const imageUrl = await uploadImage(file);
        setImages([...images, imageUrl]);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    setImages(images.filter((_, index) => index !== indexToDelete));
  };

  const handleSubmit = async () => {
    if (!apartment) return;

    try {
      await updateApartment(apartment.id, {
        name,
        description,
        location,
        pricePerNight: Number(pricePerNight),
        amenities,
        images,
      });
      onClose();
    } catch (error) {
      console.error('Error updating apartment:', error);
    }
  };

  const isSubmitDisabled = !name || !location || !pricePerNight || amenities.length === 0;

  if (!apartment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>تعديل الشقة</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="اسم الشقة"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="الوصف"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="الموقع"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="السعر لليلة"
            value={pricePerNight}
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = value.replace(/[^0-9]/g, '');
              setPricePerNight(numericValue);
            }}
            type="number"
            fullWidth
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">ر.س</InputAdornment>,
            }}
          />

          <Box>
            <TextField
              label="المميزات"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAmenity();
                }
              }}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleAddAmenity} edge="end">
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {amenities.map((amenity) => (
                <Chip
                  key={amenity}
                  label={amenity}
                  onDelete={() => handleDeleteAmenity(amenity)}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="edit-apartment-image"
              type="file"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <label htmlFor="edit-apartment-image">
              <Button
                variant="outlined"
                component="span"
                disabled={uploading}
                fullWidth
              >
                {uploading ? 'جاري الرفع...' : 'إضافة صورة'}
              </Button>
            </label>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    '&:hover .delete-icon': {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={image}
                    alt={`Apartment ${index + 1}`}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 1,
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    className="delete-icon"
                    size="small"
                    onClick={() => handleDeleteImage(index)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      backgroundColor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'error.dark',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitDisabled}
        >
          حفظ التغييرات
        </Button>
      </DialogActions>
    </Dialog>
  );
};
