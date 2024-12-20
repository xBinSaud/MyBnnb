import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import type { Expense } from "../types";

interface ExpensesTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  onViewImage: (imageUrl: string) => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  onEdit,
  onDelete,
  onViewImage,
}) => {
  const formatDate = (date: Date | string | { toDate: () => Date }) => {
    if (date instanceof Date) {
      return format(date, "dd/MM/yyyy", { locale: arSA });
    }
    if (typeof date === "object" && "toDate" in date) {
      return format(date.toDate(), "dd/MM/yyyy", { locale: arSA });
    }
    return format(new Date(date), "dd/MM/yyyy", { locale: arSA });
  };

  return (
    <TableContainer component={Paper} sx={{ width: "100%" }}>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell>الوصف</TableCell>
            <TableCell>التاريخ</TableCell>
            <TableCell>المبلغ</TableCell>
            <TableCell>صورة الإيصال</TableCell>
            <TableCell>إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{formatDate(expense.date)}</TableCell>
              <TableCell>{expense.amount} ريال</TableCell>
              <TableCell align="center">
                {expense.receiptImage ? (
                  <IconButton
                    size="small"
                    onClick={() => onViewImage(expense.receiptImage!)}
                    sx={{ color: "primary.main" }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => onEdit(expense)}
                    sx={{
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.light",
                        color: "primary.dark",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(expense.id)}
                    sx={{
                      color: "error.main",
                      "&:hover": {
                        backgroundColor: "error.light",
                        color: "error.dark",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {expenses.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                لا توجد مصروفات
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
