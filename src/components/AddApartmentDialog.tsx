import React, { useState } from 'react';
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

interface AddApartmentDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AddApartmentDialog: React.FC<AddApartmentDialogProps> = ({
  open,
  onClose,
}) => {
  const { addApartment } = useApartments();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

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

  const handleSubmit = async () => {
    try {
      await addApartment({
        name,
        description,
        location,
        pricePerNight: Number(pricePerNight),
        amenities,
        images,
      });
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setLocation('');
      setPricePerNight('');
      setAmenities([]);
      setImages([]);
    } catch (error) {
      console.error('Error adding apartment:', error);
    }
  };

  const isSubmitDisabled = !name || !location || !pricePerNight || amenities.length === 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>إضافة شقة جديدة</DialogTitle>
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
              id="add-apartment-image"
              type="file"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <label htmlFor="add-apartment-image">
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
          إضافة
        </Button>
      </DialogActions>
    </Dialog>
  );
};
