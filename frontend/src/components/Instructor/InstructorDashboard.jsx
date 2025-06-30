"use client"

import { useState } from "react"
import { Layout, Card, Row, Col, Statistic, Typography, Tabs, Badge, Button, Space, List, Progress, Tag } from "antd"
import {
    BookOutlined,
    UserOutlined,
    FileTextOutlined,
    TrophyOutlined,
    CalendarOutlined,
    PlusOutlined,
    BarChartOutlined,
    LineChartOutlined,
} from "@ant-design/icons"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
} from "chart.js"
import { Bar, Line, Pie } from "react-chartjs-2"
import { motion } from "framer-motion"
import Header from "../header/Header"
import "./InstructorDashboard.css"

// Đăng ký các components của Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    ChartTitle,
    Tooltip,
    Legend,
)

const { Content } = Layout
const { Title, Text } = Typography

// Mock data dựa trên database models
const mockData = {
    instructor: {
        name: "Nguyễn Văn An",
        email: "nguyenvanan@example.com",
        department: "Công Nghệ Thông Tin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=instructor",
    },
    courses: [
        {
            id: "1",
            title: "Lập Trình Web Nâng Cao",
            subjectCode: "CNTT",
            term: "Học kỳ 2 - 2023-2024",
            enrollments: 45,
            modules: 2,
            assignments: 3,
            credits: 3,
            status: "active",
        },
        {
            id: "2",
            title: "Cơ Sở Dữ Liệu",
            subjectCode: "CSDL",
            term: "Học kỳ 2 - 2023-2024",
            enrollments: 38,
            modules: 3,
            assignments: 4,
            credits: 3,
            status: "active",
        },
    ],
    enrollmentStats: [
        { month: "Tháng 1", students: 30 },
        { month: "Tháng 2", students: 45 },
        { month: "Tháng 3", students: 38 },
        { month: "Tháng 4", students: 52 },
        { month: "Tháng 5", students: 41 },
        { month: "Tháng 6", students: 35 },
    ],
    submissionStats: [
        { assignment: "Bài tập 1", submitted: 42, total: 45, rate: 93.3 },
        { assignment: "Bài tập 2", submitted: 38, total: 45, rate: 84.4 },
        { assignment: "Bài tập 3", submitted: 35, total: 45, rate: 77.8 },
    ],
    gradeDistribution: [
        { grade: "A", count: 15, percent: 33.3 },
        { grade: "B", count: 18, percent: 40.0 },
        { grade: "C", count: 8, percent: 17.8 },
        { grade: "D", count: 4, percent: 8.9 },
    ],
    performanceData: [
        { week: "Tuần 1", avgScore: 85 },
        { week: "Tuần 2", avgScore: 78 },
        { week: "Tuần 3", avgScore: 82 },
        { week: "Tuần 4", avgScore: 88 },
        { week: "Tuần 5", avgScore: 91 },
        { week: "Tuần 6", avgScore: 87 },
    ],
    recentActivities: [
        { id: 1, action: "Bài tập mới được tạo", time: "2 giờ trước", type: "create" },
        { id: 2, action: "15 bài nộp mới", time: "5 giờ trước", type: "submission" },
        { id: 3, action: "Cập nhật điểm số", time: "1 ngày trước", type: "grade" },
        { id: 4, action: "Học viên mới đăng ký", time: "2 ngày trước", type: "enrollment" },
    ],
}

const InstructorDashboard = () => {
    const [selectedCourse, setSelectedCourse] = useState(mockData.courses[0])

    // Cấu hình biểu đồ cột - Thống kê đăng ký
    const enrollmentChartData = {
        labels: mockData.enrollmentStats.map((item) => item.month),
        datasets: [
            {
                label: "Số học viên",
                data: mockData.enrollmentStats.map((item) => item.students),
                backgroundColor: "#7C3AED",
                borderColor: "#7C3AED",
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    }

    const enrollmentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "#f3f4f6",
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    }

    // Cấu hình biểu đồ tròn - Phân bố điểm
    const gradeChartData = {
        labels: mockData.gradeDistribution.map((item) => `Loại ${item.grade}`),
        datasets: [
            {
                data: mockData.gradeDistribution.map((item) => item.count),
                backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#6B7280"],
                borderWidth: 2,
                borderColor: "#ffffff",
            },
        ],
    }

    const gradeChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    padding: 20,
                    usePointStyle: true,
                },
            },
        },
    }

    // Cấu hình biểu đồ đường - Hiệu suất
    const performanceChartData = {
        labels: mockData.performanceData.map((item) => item.week),
        datasets: [
            {
                label: "Điểm trung bình",
                data: mockData.performanceData.map((item) => item.avgScore),
                borderColor: "#7C3AED",
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#7C3AED",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 6,
            },
        ],
    }

    const performanceChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 70,
                max: 100,
                grid: {
                    color: "#f3f4f6",
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    }

    // Cấu hình biểu đồ cột cho tỷ lệ nộp bài
    const submissionChartData = {
        labels: mockData.submissionStats.map((item) => item.assignment),
        datasets: [
            {
                label: "Tổng số",
                data: mockData.submissionStats.map((item) => item.total),
                backgroundColor: "#E5E7EB",
                borderRadius: 4,
            },
            {
                label: "Đã nộp",
                data: mockData.submissionStats.map((item) => item.submitted),
                backgroundColor: "#10B981",
                borderRadius: 4,
            },
        ],
    }

    const submissionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "#f3f4f6",
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    }

    return (
        <Layout className="instructor-dashboard">
            {/* Header Component */}
            <Header />

            <Content className="dashboard-content">
                <div className="content-wrapper">
                    {/* Welcome Section */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="welcome-section">
                            <div className="welcome-content">
                                <Title level={2} style={{ color: "white", margin: 0 }}>
                                    Giảng Viên
                                </Title>
                                <Text style={{ color: "#E0E7FF", fontSize: "16px" }}>
                                    Chào mừng trở lại
                                </Text>
                            </div>
                            {/* <div className="welcome-actions">
                                <Space>
                                    <Button type="primary" icon={<CalendarOutlined />} className="btn-success">
                                        Lịch dạy
                                    </Button>
                                    <Button type="primary" icon={<PlusOutlined />} className="btn-warning">
                                        Tạo bài tập
                                    </Button>
                                </Space>
                            </div> */}
                        </div>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Row gutter={[24, 24]} className="stats-row">
                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Tổng khóa học"
                                        value={mockData.courses.length}
                                        prefix={<BookOutlined className="stat-icon purple" />}
                                        suffix="khóa"
                                    />
                                    <Text type="secondary">Đang giảng dạy</Text>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Tổng học viên"
                                        value={mockData.courses.reduce((sum, course) => sum + course.enrollments, 0)}
                                        prefix={<UserOutlined className="stat-icon green" />}
                                        suffix="người"
                                    />
                                    <Text type="secondary">Đã đăng ký</Text>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Bài tập"
                                        value={mockData.courses.reduce((sum, course) => sum + course.assignments, 0)}
                                        prefix={<FileTextOutlined className="stat-icon orange" />}
                                        suffix="bài"
                                    />
                                    <Text type="secondary">Đã tạo</Text>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Điểm trung bình"
                                        value={8.5}
                                        prefix={<TrophyOutlined className="stat-icon blue" />}
                                        precision={1}
                                    />
                                    <Text type="secondary">Tất cả khóa học</Text>
                                </Card>
                            </Col>
                        </Row>
                    </motion.div>

                    {/* Main Content */}
                    <Row gutter={[24, 24]} className="main-content">
                        {/* Left Column - Course List */}
                        <Col xs={24} lg={8}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card
                                    title={
                                        <Space>
                                            <BookOutlined />
                                            Khóa học của tôi
                                        </Space>
                                    }
                                    className="course-list-card"
                                >
                                    <List
                                        dataSource={mockData.courses}
                                        renderItem={(course) => (
                                            <List.Item
                                                className={`course-item ${selectedCourse.id === course.id ? "selected" : ""}`}
                                                onClick={() => setSelectedCourse(course)}
                                            >
                                                <div className="course-content">
                                                    <div className="course-header">
                                                        <Title level={5} className="course-title">
                                                            {course.title}
                                                        </Title>
                                                        <Badge count={course.term} style={{ backgroundColor: "#F59E0B" }} />
                                                    </div>
                                                    <Text type="secondary" className="course-code">
                                                        {course.subjectCode}
                                                    </Text>
                                                    <Row gutter={16} className="course-stats">
                                                        <Col span={8} className="stat-item">
                                                            <div className="stat-number purple">{course.enrollments}</div>
                                                            <div className="stat-label">Học viên</div>
                                                        </Col>
                                                        <Col span={8} className="stat-item">
                                                            <div className="stat-number green">{course.modules}</div>
                                                            <div className="stat-label">Chương</div>
                                                        </Col>
                                                        <Col span={8} className="stat-item">
                                                            <div className="stat-number orange">{course.assignments}</div>
                                                            <div className="stat-label">Bài tập</div>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </motion.div>
                        </Col>

                        {/* Right Column - Charts and Analytics */}
                        <Col xs={24} lg={16}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Card className="analytics-card">
                                    <Tabs defaultActiveKey="analytics" className="analytics-tabs">
                                        <Tabs.TabPane
                                            tab={
                                                <span>
                                                    <BarChartOutlined />
                                                    Phân tích
                                                </span>
                                            }
                                            key="analytics"
                                        >
                                            <Row gutter={[24, 24]}>
                                                <Col xs={24} xl={12}>
                                                    <Card title="Thống kê đăng ký theo tháng" size="small">
                                                        <div style={{ height: "250px" }}>
                                                            <Bar data={enrollmentChartData} options={enrollmentChartOptions} />
                                                        </div>
                                                    </Card>
                                                </Col>
                                                <Col xs={24} xl={12}>
                                                    <Card title="Phân bố điểm số" size="small">
                                                        <div style={{ height: "250px" }}>
                                                            <Pie data={gradeChartData} options={gradeChartOptions} />
                                                        </div>
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </Tabs.TabPane>

                                        <Tabs.TabPane
                                            tab={
                                                <span>
                                                    <FileTextOutlined />
                                                    Bài nộp
                                                </span>
                                            }
                                            key="submissions"
                                        >
                                            <Row gutter={[24, 24]}>
                                                <Col xs={24} xl={14}>
                                                    <Card title="Tỷ lệ nộp bài" size="small">
                                                        <div style={{ height: "250px" }}>
                                                            <Bar data={submissionChartData} options={submissionChartOptions} />
                                                        </div>
                                                    </Card>
                                                </Col>
                                                <Col xs={24} xl={10}>
                                                    <Card title="Chi tiết nộp bài" size="small">
                                                        <List
                                                            dataSource={mockData.submissionStats}
                                                            renderItem={(item) => (
                                                                <List.Item>
                                                                    <div style={{ width: "100%" }}>
                                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                                                            <Text strong>{item.assignment}</Text>
                                                                            <Text>
                                                                                {item.submitted}/{item.total}
                                                                            </Text>
                                                                        </div>
                                                                        <Progress
                                                                            percent={item.rate}
                                                                            strokeColor="#10B981"
                                                                            format={(percent) => `${percent?.toFixed(1)}%`}
                                                                        />
                                                                    </div>
                                                                </List.Item>
                                                            )}
                                                        />
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </Tabs.TabPane>

                                        <Tabs.TabPane
                                            tab={
                                                <span>
                                                    <LineChartOutlined />
                                                    Hiệu suất
                                                </span>
                                            }
                                            key="performance"
                                        >
                                            <Row gutter={[24, 24]}>
                                                <Col xs={24} xl={14}>
                                                    <Card title="Điểm trung bình theo tuần" size="small">
                                                        <div style={{ height: "250px" }}>
                                                            <Line data={performanceChartData} options={performanceChartOptions} />
                                                        </div>
                                                    </Card>
                                                </Col>
                                                <Col xs={24} xl={10}>
                                                    <Card title="Thành tích nổi bật" size="small" style={{ marginBottom: 16 }}>
                                                        <Space direction="vertical" style={{ width: "100%" }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                <Text>Học viên xuất sắc</Text>
                                                                <Tag color="green">15 người</Tag>
                                                            </div>
                                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                <Text>Hoàn thành đúng hạn</Text>
                                                                <Tag color="blue">92%</Tag>
                                                            </div>
                                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                <Text>Tham gia tích cực</Text>
                                                                <Tag color="purple">38 người</Tag>
                                                            </div>
                                                        </Space>
                                                    </Card>

                                                    <Card title="Hoạt động gần đây" size="small">
                                                        <List
                                                            size="small"
                                                            dataSource={mockData.recentActivities}
                                                            renderItem={(item) => (
                                                                <List.Item>
                                                                    <div>
                                                                        <Text strong>{item.action}</Text>
                                                                        <br />
                                                                        <Text type="secondary" style={{ fontSize: "12px" }}>
                                                                            {item.time}
                                                                        </Text>
                                                                    </div>
                                                                </List.Item>
                                                            )}
                                                        />
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </Tabs.TabPane>
                                    </Tabs>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    )
}

export default InstructorDashboard
