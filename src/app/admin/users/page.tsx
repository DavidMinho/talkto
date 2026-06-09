import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AdminUsersTable from "@/components/AdminUsersTable";

export default function AdminUsersPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        จัดการสมาชิก
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        ค้นหา เปลี่ยนสิทธิ์ และจัดการบัญชีผู้ใช้ในระบบ
      </Typography>
      <AdminUsersTable />
    </Box>
  );
}
