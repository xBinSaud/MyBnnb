// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Box,
//   Paper,
//   Button,
//   Typography,
//   Alert,
//   CircularProgress,
// } from "@mui/material";
// import { setupAdminAccount } from '../../utils/setupAdmin';

export default function Setup() {
  // const navigate = useNavigate();
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");
  // const [success, setSuccess] = useState("");
  // const [credentials, setCredentials] = useState<{
  //   email: string;
  //   password: string;
  // } | null>(null);

  // const handleSetup = async () => {
  //   setLoading(true);
  //   setError("");
  //   setSuccess("");
  //   setCredentials(null);

  //   try {
  //     const result = await setupAdminAccount();
  //     if (result.success) {
  //       setSuccess(result.message);
  //       if (result.credentials) {
  //         setCredentials(result.credentials);
  //       }
  //     } else {
  //       setError(result.message);
  //     }
  //   } catch (err: any) {
  //     setError(err.message || "حدث خطأ أثناء إعداد حساب الأدمن");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <></>
    // <Box
    //   sx={{
    //     minHeight: "100vh",
    //     display: "flex",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     background: "linear-gradient(180deg, #0a1929 0%, #1a2027 100%)",
    //     p: 3,
    //   }}
    // >
    //   <Paper
    //     elevation={3}
    //     sx={{
    //       p: 4,
    //       width: "100%",
    //       maxWidth: 400,
    //       textAlign: "center",
    //       background: "rgba(26, 32, 39, 0.9)",
    //       backdropFilter: "blur(10px)",
    //       border: "1px solid rgba(255, 255, 255, 0.1)",
    //     }}
    //   >
    //     <Typography
    //       variant="h4"
    //       gutterBottom
    //       sx={{
    //         fontWeight: "bold",
    //         background: "linear-gradient(45deg, #2196f3, #f50057)",
    //         WebkitBackgroundClip: "text",
    //         WebkitTextFillColor: "transparent",
    //         mb: 4,
    //       }}
    //     >
    //       إعداد حساب الأدمن
    //     </Typography>

    //     {error && (
    //       <Alert
    //         severity="error"
    //         sx={{
    //           mb: 3,
    //           backgroundColor: "rgba(211, 47, 47, 0.1)",
    //           color: "#ff1744",
    //           "& .MuiAlert-icon": {
    //             color: "#ff1744",
    //           },
    //         }}
    //       >
    //         {error}
    //       </Alert>
    //     )}

    //     {success && (
    //       <Alert
    //         severity="success"
    //         sx={{
    //           mb: 3,
    //           backgroundColor: "rgba(46, 125, 50, 0.1)",
    //           color: "#69f0ae",
    //           "& .MuiAlert-icon": {
    //             color: "#69f0ae",
    //           },
    //         }}
    //       >
    //         {success}
    //       </Alert>
    //     )}

    //     {credentials && (
    //       <Box sx={{ mb: 3, textAlign: "right" }}>
    //         <Typography variant="subtitle1" color="primary" gutterBottom>
    //           بيانات الدخول:
    //         </Typography>
    //         <Typography variant="body2" color="text.secondary">
    //           البريد الإلكتروني: {credentials.email}
    //         </Typography>
    //         <Typography variant="body2" color="text.secondary">
    //           كلمة المرور: {credentials.password}
    //         </Typography>
    //       </Box>
    //     )}

    //     <Button
    //       variant="contained"
    //       fullWidth
    //       size="large"
    //       // onClick={handleSetup}
    //       disabled={loading}
    //       sx={{
    //         py: 1.5,
    //         position: "relative",
    //         background: "linear-gradient(45deg, #2196f3, #f50057)",
    //         transition: "all 0.3s ease-in-out",
    //         "&:hover": {
    //           background: "linear-gradient(45deg, #1976d2, #ab003c)",
    //           transform: "translateY(-2px)",
    //           boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    //         },
    //       }}
    //     >
    //       {loading ? (
    //         <CircularProgress size={24} sx={{ color: "white" }} />
    //       ) : (
    //         "إعداد حساب الأدمن"
    //       )}
    //     </Button>

    //     {credentials && (
    //       <Button
    //         variant="outlined"
    //         fullWidth
    //         size="large"
    //         onClick={() => navigate("/login")}
    //         sx={{
    //           mt: 2,
    //           borderColor: "rgba(255, 255, 255, 0.23)",
    //           color: "white",
    //           "&:hover": {
    //             borderColor: "rgba(255, 255, 255, 0.4)",
    //             background: "rgba(255, 255, 255, 0.05)",
    //           },
    //         }}
    //       >
    //         الذهاب لتسجيل الدخول
    //       </Button>
    //     )}
    //   </Paper>
    // </Box>
  );
}
