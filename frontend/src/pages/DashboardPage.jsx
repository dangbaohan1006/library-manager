import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Spin, Avatar, Tag } from 'antd';
import { 
    ReadOutlined, UserOutlined, SyncOutlined, WarningOutlined, 
    FireOutlined, ArrowRightOutlined 
} from '@ant-design/icons';
import { getDashboardStats, getTopBooks } from '../services/api';

const { Title, Text } = Typography;

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [topBooks, setTopBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, topBooksRes] = await Promise.all([
                    getDashboardStats(),
                    getTopBooks()
                ]);
                setStats(statsRes.data);
                setTopBooks(topBooksRes.data);
            } catch (error) {
                console.error("Lỗi tải dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

    const StatCard = ({ title, value, icon, color, subTitle }) => (
        <Card 
            bordered={false} 
            style={{ 
                background: '#1f2937', 
                borderRadius: 16, 
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'relative', zIndex: 2 }}>
                <Text style={{ color: '#9ca3af', fontSize: 14 }}>{title}</Text>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: color, marginTop: 8 }}>
                    {value}
                </div>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>{subTitle}</Text>
            </div>
            <div style={{ 
                position: 'absolute', right: -10, bottom: -10, 
                opacity: 0.1, fontSize: 80, color: color 
            }}>
                {icon}
            </div>
        </Card>
    );

    return (
        <div style={{ paddingBottom: 20 }}>
            <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ color: '#f3f4f6', margin: 0, fontWeight: 700 }}>Thư viện Tổng hợp</Title>
                    <Text style={{ color: '#9ca3af' }}>Chào mừng quay trở lại, Admin!</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Tag color="#fbbf24" style={{ color: '#1f2937', fontWeight: 'bold', padding: '4px 12px', borderRadius: 20, border: 'none' }}>
                        Premium Access
                    </Tag>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Title level={4} style={{ color: '#f3f4f6', margin: 0 }}>Sách nổi bật</Title>
                            <Text style={{ color: '#fbbf24', cursor: 'pointer' }}>Xem tất cả <ArrowRightOutlined /></Text>
                        </div>
                        <Row gutter={[16, 16]}>
                            {topBooks.slice(0, 3).map((book, index) => (
                                <Col xs={24} sm={8} key={index}>
                                    <Card 
                                        hoverable
                                        bordered={false}
                                        bodyStyle={{ padding: 16 }}
                                        style={{ background: '#1f2937', borderRadius: 16 }}
                                        cover={
                                            <div style={{ height: 160, background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                                                <img 
                                                    alt={book.book_title} 
                                                    src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`}
                                                    onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/120x160/1f1f3e/FFF?text=No+Cover"}}
                                                    style={{ height: '90%', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
                                                />
                                            </div>
                                        }
                                    >
                                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#f3f4f6', fontWeight: 600 }}>{book.book_title}</div>
                                        <div style={{ color: '#9ca3af', fontSize: 12 }}>{book.author}</div>
                                        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                            <span style={{ color: '#fbbf24' }}>{book.total_loans} lượt mượn</span>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Title level={4} style={{ color: '#f3f4f6', margin: 0 }}>Thống kê nhanh</Title>
                            <FireOutlined style={{ color: '#fbbf24', fontSize: 20 }} />
                        </div>
                        <Row gutter={[16, 16]}>
                            <Col xs={12} md={8}>
                                <StatCard 
                                    title="Tổng đầu sách" 
                                    value={stats?.total_books} 
                                    subTitle="Kho lưu trữ"
                                    icon={<ReadOutlined />} 
                                    color="#fbbf24"
                                />
                            </Col>
                            <Col xs={12} md={8}>
                                <StatCard 
                                    title="Thành viên" 
                                    value={stats?.total_members} 
                                    subTitle="Độc giả active"
                                    icon={<UserOutlined />} 
                                    color="#3b82f6"
                                />
                            </Col>
                            <Col xs={12} md={8}>
                                <StatCard 
                                    title="Đang cho mượn" 
                                    value={stats?.active_loans} 
                                    subTitle="Sách đang lưu hành"
                                    icon={<SyncOutlined />} 
                                    color="#10b981"
                                />
                            </Col>
                            <Col xs={12} md={8}>
                                <StatCard 
                                    title="Sách quá hạn" 
                                    value={stats?.overdue_loans} 
                                    subTitle="Cần thu hồi gấp"
                                    icon={<WarningOutlined />} 
                                    color="#ef4444"
                                />
                            </Col>
                             <Col xs={12} md={16}>
                                <StatCard 
                                    title="Doanh thu phạt (Tạm tính)" 
                                    value={`${stats?.pending_fines?.toLocaleString()} đ`} 
                                    subTitle="Tiền phạt chờ thu"
                                    icon={<FireOutlined />} 
                                    color="#8b5cf6" // Tím
                                />
                            </Col>
                        </Row>
                    </div>
                </Col>

                <Col xs={24} lg={8}>
                    <Card 
                        title={<span style={{ color: '#f3f4f6' }}>Bảng xếp hạng</span>} 
                        bordered={false}
                        style={{ background: '#1f2937', borderRadius: 16, marginBottom: 24 }}
                        headStyle={{ borderBottom: '1px solid #374151' }}
                        extra={<Text style={{ color: '#fbbf24', fontSize: 12 }}>Xem tất cả</Text>}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={topBooks}
                            renderItem={(item, index) => (
                                <List.Item style={{ borderBottom: '1px solid #374151', padding: '12px 0' }}>
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{ width: 40, height: 56, background: '#374151', borderRadius: 4, overflow: 'hidden' }}>
                                                 <img 
                                                    alt={item.book_title} 
                                                    src={`https://covers.openlibrary.org/b/isbn/${item.isbn}-S.jpg`}
                                                    onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/40x56/1f1f3e/FFF?text=..."}}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        }
                                        title={<Text style={{ color: '#f3f4f6', fontSize: 14 }}>{item.book_title}</Text>}
                                        description={<Text style={{ color: '#9ca3af', fontSize: 12 }}>{item.author}</Text>}
                                    />
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>#{index + 1}</div>
                                        <Text style={{ fontSize: 10, color: '#6b7280' }}>{item.total_loans} mượn</Text>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>

                    <Card 
                        title={<span style={{ color: '#f3f4f6' }}>Tác giả & Độc giả</span>} 
                        bordered={false}
                        style={{ background: '#1f2937', borderRadius: 16 }}
                        headStyle={{ borderBottom: '1px solid #374151' }}
                    >
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                             {['JK', 'Agatha', 'Nam', 'Tolkien', 'Robert', 'F.Scott'].map((name, i) => (
                                 <div key={i} style={{ textAlign: 'center' }}>
                                     <Avatar 
                                        size={48} 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                                        style={{ backgroundColor: '#374151', marginBottom: 4 }} 
                                    />
                                     <div style={{ color: '#9ca3af', fontSize: 10 }}>{name}</div>
                                 </div>
                             ))}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;