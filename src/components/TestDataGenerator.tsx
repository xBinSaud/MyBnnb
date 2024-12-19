import { Button } from "@mui/material";

export const TestDataGenerator = () => {
  const handleGenerateData = async () => {
    // const success = await createTestData();
    // if (success) {
    //   alert('تم إنشاء البيانات التجريبية بنجاح');
    // } else {
    //   alert('حدث خطأ أثناء إنشاء البيانات التجريبية');
    // }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleGenerateData}
      sx={{ m: 2 }}
    >
      إنشاء بيانات تجريبية
    </Button>
  );
};
