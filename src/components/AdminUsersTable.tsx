"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import { apiFetch } from "@/lib/api-client";
import { adminSoftCardSx } from "@/theme/admin/surfaces";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { memberships: number; messages: number };
};

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    setError("");
    try {
      const url = q
        ? `/api/admin/users?q=${encodeURIComponent(q)}`
        : "/api/admin/users";
      const data = await apiFetch<AdminUser[]>(url);
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateRole = async (id: string, role: "USER" | "ADMIN") => {
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      await load(query);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปเดตไม่สำเร็จ");
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`ลบสมาชิก "${name}" ?`)) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      await load(query);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="ค้นหาชื่อหรืออีเมล..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(query)}
          sx={{ minWidth: { xs: "100%", sm: 280 }, flex: { sm: 1 } }}
        />
        <Button variant="contained" onClick={() => load(query)}>
          ค้นหา
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            ...adminSoftCardSx,
            p: 0,
            overflow: "hidden",
            "& .MuiTableHead-root .MuiTableCell-root": {
              bgcolor: "action.hover",
              fontWeight: 600,
            },
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ชื่อ</TableCell>
                <TableCell>อีเมล</TableCell>
                <TableCell>บทบาท</TableCell>
                <TableCell align="right">ห้องแชท</TableCell>
                <TableCell align="right">ข้อความ</TableCell>
                <TableCell>สมัครเมื่อ</TableCell>
                <TableCell align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={user.role}
                      onChange={(e) =>
                        updateRole(user.id, e.target.value as "USER" | "ADMIN")
                      }
                    >
                      <MenuItem value="USER">USER</MenuItem>
                      <MenuItem value="ADMIN">ADMIN</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="right">{user._count.memberships}</TableCell>
                  <TableCell align="right">{user._count.messages}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => remove(user.id, user.name)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    ไม่พบสมาชิก
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
