import { Box, Paper, Typography, useTheme } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: SvgIconComponent;
  trend?: number;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}

export const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        borderRadius: 2,
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" color="text.secondary">
          {title}
        </Typography>
        <Icon sx={{ color: theme.palette[color].main }} />
      </Box>
      <Typography variant="h4" fontWeight="bold" color="text.primary">
        {value}
      </Typography>
      {trend !== undefined && (
        <Typography
          variant="body2"
          color={trend >= 0 ? "success.main" : "error.main"}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          {trend >= 0 ? "+" : ""}
          {trend}%
        </Typography>
      )}
    </Paper>
  );
};
