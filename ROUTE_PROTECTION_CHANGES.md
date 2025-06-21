# Route Protection và Authentication Changes

## Tổng quan
Đã thực hiện các thay đổi để bảo vệ route và quản lý authentication theo role của user.

## Các thay đổi chính

### 1. Tạo ProtectedRoute Component
- **File**: `frontend/src/components/common/ProtectedRoute.jsx`
- **Chức năng**: Bảo vệ các route yêu cầu authentication
- **Tính năng**:
  - Kiểm tra token authentication
  - Kiểm tra role của user
  - Chuyển hướng tự động dựa trên role

### 2. Tạo PublicRoute Component
- **File**: `frontend/src/components/common/PublicRoute.jsx`
- **Chức năng**: Ngăn user đã đăng nhập truy cập trang auth
- **Tính năng**:
  - Chuyển hướng user đã đăng nhập đến trang phù hợp
  - Chỉ cho phép user chưa đăng nhập truy cập

### 3. Cập nhật LoginPage
- **File**: `frontend/src/pages/auth/LoginPage.jsx`
- **Thay đổi**: Cập nhật logic chuyển hướng sau khi đăng nhập
- **Logic**:
  - Admin → `/admin`
  - Student → `/student`
  - Parent → `/parent/dashboard`
  - Khác → `/`

### 4. Cập nhật App.js
- **File**: `frontend/src/App.js`
- **Thay đổi**: Áp dụng ProtectedRoute và PublicRoute cho tất cả routes
- **Chi tiết**:
  - Auth routes (login, signup, etc.) được wrap với PublicRoute
  - Admin routes được wrap với ProtectedRoute (allowedRoles: ['admin'])
  - Student routes được wrap với ProtectedRoute (allowedRoles: ['student'])
  - Parent routes được wrap với ProtectedRoute (allowedRoles: ['parent'])

### 5. Cập nhật MainLayout
- **File**: `frontend/src/layouts/MainLayout.jsx`
- **Thay đổi**:
  - Hiển thị thông tin user thực tế thay vì hardcode "Admin"
  - Thêm dropdown menu với chức năng logout
  - Hiển thị role của user

### 6. Cập nhật SidebarStudent
- **File**: `frontend/src/layouts/Student/SideBarStudent.js`
- **Thay đổi**:
  - Thêm thông tin user trong sidebar
  - Thêm chức năng logout
  - Hiển thị tên và role của student

### 7. Cập nhật ParentStatsDashboard
- **File**: `frontend/src/components/parent/ParentStatsDashboard.js`
- **Thay đổi**:
  - Thêm dropdown menu với thông tin user
  - Thêm chức năng logout
  - Hiển thị tên và role của parent

### 8. Cập nhật Header
- **File**: `frontend/src/components/header/Header.js`
- **Thay đổi**: Cập nhật link Dashboard để chuyển hướng đến trang phù hợp dựa trên role

## Cách hoạt động

### 1. User chưa đăng nhập
- Có thể truy cập: Homepage, Login, Signup, Reset Password
- Không thể truy cập: Admin, Student, Parent pages
- Khi cố gắng truy cập protected route → chuyển hướng đến `/login`

### 2. User đã đăng nhập
- **Admin**:
  - Được chuyển hướng đến `/admin` sau khi đăng nhập
  - Có thể truy cập: `/admin`, `/users`, `/subjects`, `/analytics`, `/reports`
  - Không thể truy cập: `/login`, `/signup`, `/student/*`, `/parent/*`

- **Student**:
  - Được chuyển hướng đến `/student` sau khi đăng nhập
  - Có thể truy cập: `/student/*`
  - Không thể truy cập: `/login`, `/signup`, `/admin/*`, `/parent/*`

- **Parent**:
  - Được chuyển hướng đến `/parent/dashboard` sau khi đăng nhập
  - Có thể truy cập: `/parent/dashboard`
  - Không thể truy cập: `/login`, `/signup`, `/admin/*`, `/student/*`

### 3. Sau khi logout
- Token và user data được xóa khỏi localStorage
- User được chuyển hướng đến `/login`
- Có thể truy cập lại các trang auth

## Cấu trúc file mới

```
frontend/src/components/common/
├── ProtectedRoute.jsx    # Bảo vệ route yêu cầu auth
└── PublicRoute.jsx       # Ngăn user đã đăng nhập truy cập auth pages
```

## Lưu ý
- Tất cả các thay đổi đều tương thích với Redux store hiện tại
- Không cần thay đổi backend API
- Logic chuyển hướng được xử lý ở frontend để tối ưu performance 