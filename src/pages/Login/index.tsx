// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Box,
//   Paper,
//   TextField,
//   Button,
//   Typography,
//   Alert,
//   CircularProgress,
// } from "@mui/material";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  // const navigate = useNavigate();
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError("");
  //   setLoading(true);

  //   try {
  //     const userCredential = await signInWithEmailAndPassword(
  //       auth,
  //       email,
  //       password
  //     );
  //     const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

  //     if (!userDoc.exists()) {
  //       throw new Error("لم يتم العثور على بيانات المستخدم");
  //     }

  //     const userData = userDoc.data();

  //     if (userData.role !== "admin") {
  //       throw new Error("عذراً، هذا الحساب ليس لديه صلاحيات الأدمن");
  //     }

  //     navigate("/admin");
  //   } catch (err: any) {
  //     console.error("Login error:", err);
  //     if (err.code === "auth/invalid-credential") {
  //       setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  //     } else {
  //       setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return <></>;
  // (
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
  //       تسجيل الدخول
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

  //     <form onSubmit={handleLogin}>
  //       <TextField
  //         fullWidth
  //         label="البريد الإلكتروني"
  //         variant="outlined"
  //         type="email"
  //         value={email}
  //         onChange={(e) => setEmail(e.target.value)}
  //         required
  //         sx={{
  //           mb: 2,
  //           "& .MuiOutlinedInput-root": {
  //             color: "white",
  //             "& fieldset": {
  //               borderColor: "rgba(255, 255, 255, 0.23)",
  //             },
  //             "&:hover fieldset": {
  //               borderColor: "rgba(255, 255, 255, 0.4)",
  //             },
  //             "&.Mui-focused fieldset": {
  //               borderColor: "#2196f3",
  //             },
  //           },
  //           "& .MuiInputLabel-root": {
  //             color: "rgba(255, 255, 255, 0.7)",
  //             "&.Mui-focused": {
  //               color: "#2196f3",
  //             },
  //           },
  //         }}
  //       />

  //       <TextField
  //         fullWidth
  //         label="كلمة المرور"
  //         variant="outlined"
  //         type="password"
  //         value={password}
  //         onChange={(e) => setPassword(e.target.value)}
  //         required
  //         sx={{
  //           mb: 3,
  //           "& .MuiOutlinedInput-root": {
  //             color: "white",
  //             "& fieldset": {
  //               borderColor: "rgba(255, 255, 255, 0.23)",
  //             },
  //             "&:hover fieldset": {
  //               borderColor: "rgba(255, 255, 255, 0.4)",
  //             },
  //             "&.Mui-focused fieldset": {
  //               borderColor: "#2196f3",
  //             },
  //           },
  //           "& .MuiInputLabel-root": {
  //             color: "rgba(255, 255, 255, 0.7)",
  //             "&.Mui-focused": {
  //               color: "#2196f3",
  //             },
  //           },
  //         }}
  //       />

  //       <Button
  //         type="submit"
  //         variant="contained"
  //         fullWidth
  //         size="large"
  //         disabled={loading}
  //         sx={{
  //           py: 1.5,
  //           position: "relative",
  //           background: "linear-gradient(45deg, #2196f3, #f50057)",
  //           transition: "all 0.3s ease-in-out",
  //           "&:hover": {
  //             background: "linear-gradient(45deg, #1976d2, #ab003c)",
  //             transform: "translateY(-2px)",
  //             boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
  //           },
  //         }}
  //       >
  //         {loading ? (
  //           <CircularProgress size={24} sx={{ color: "white" }} />
  //         ) : (
  //           "تسجيل الدخول"
  //         )}
  //       </Button>
  //     </form>
  //   </Paper>
  // </Box>
  // );
}
