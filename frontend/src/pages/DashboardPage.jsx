import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Spin, Tag, App } from 'antd';
import { 
    ReadOutlined, UserOutlined, SyncOutlined, WarningOutlined, 
    FireOutlined, ArrowRightOutlined, TrophyOutlined
} from '@ant-design/icons';
import { getDashboardStats, getTopBooks, BASE_URL } from '../services/api';

const { Title, Text } = Typography;

// [FIX UI] BookCover hiển thị trọn vẹn (Contain) giống BooksPage
const BookCover = ({ item, getFileUrl, height = 200, style = {} }) => {
    const [imgSrc, setImgSrc] = useState("https://placehold.co/160x240/1f1f3e/FFF?text=Loading");
    
    useEffect(() => {
        if (item.image_path) {
            setImgSrc(getFileUrl(item.image_path));
        } else {
            const cleanIsbn = item.isbn ? item.isbn.replace(/-/g, '').replace(/ /g, '') : '';
            setImgSrc(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`);
        }
    }, [item, getFileUrl]);

    const handleError = () => {
        const cleanIsbn = item.isbn ? item.isbn.replace(/-/g, '').replace(/ /g, '') : '';
        const googleUrl = `https://books.google.com/books/content?vid=ISBN${cleanIsbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
        const placeholder = "https://placehold.co/160x240/1f1f3e/FFF?text=No+Cover";
        
        if (imgSrc !== googleUrl && imgSrc !== placeholder) setImgSrc(googleUrl);
        else setImgSrc(placeholder);
    };

    return (
        <div style={{ 
            height: height, 
            background: '#111827', // Màu nền tối làm nổi bật bìa sách
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            overflow: 'hidden',
            padding: '8px', // [FIX] Thêm padding để ảnh không dính sát lề
            ...style 
        }}>
            <img 
                alt={item.title} 
                src={imgSrc} 
                onError={handleError} 
                style={{ 
                    height: '100%', 
                    maxWidth: '100%', // [FIX] Đảm bảo ảnh không bị méo
                    objectFit: 'contain', // [FIX] Quan trọng: Hiển thị full ảnh thay vì cắt
                    borderRadius: 2,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)' // Đổ bóng nhẹ cho bìa sách nổi lên
                }} 
            />
        </div>
    );
};

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [topBooks, setTopBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, topBooksRes] = await Promise.all([getDashboardStats(), getTopBooks()]);
                setStats(statsRes.data);
                setTopBooks(topBooksRes.data);
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${BASE_URL}/${path.replace(/\\/g, '/')}`;
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

    const StatCard = ({ title, value, icon, color, subTitle }) => (
        <Card bordered={false} style={{ background: '#1f2937', borderRadius: 16, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
                <Text style={{ color: '#9ca3af' }}>{title}</Text>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: color, marginTop: 8 }}>{value}</div>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>{subTitle}</Text>
            </div>
            <div style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1, fontSize: 80, color: color }}>{icon}</div>
        </Card>
    );

    return (
        <div style={{ paddingBottom: 20 }}>
            <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ color: '#f3f4f6', margin: 0 }}>Thư viện Tổng hợp</Title>
                    <Text style={{ color: '#9ca3af' }}>Chào mừng quay trở lại, Admin!</Text>
                </div>
                <Tag color="#fbbf24" style={{ color: '#1f2937', fontWeight: 'bold', padding: '4px 12px', borderRadius: 20, border: 'none' }}>Premium Access</Tag>
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
                                        bodyStyle={{ padding: 12 }} 
                                        style={{ background: '#1f2937', borderRadius: 16, overflow: 'hidden' }}
                                        cover={
                                            <BookCover 
                                                item={book} 
                                                getFileUrl={getFileUrl} 
                                                height={220} // Tăng chiều cao để ảnh rõ hơn
                                                style={{ background: '#111827' }} 
                                            />
                                        }
                                    >
                                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#f3f4f6', fontWeight: 600, fontSize: 15 }}>
                                            {book.title || book.book_title}
                                        </div>
                                        <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>{book.author}</div>
                                        <Tag color="gold">{book.total_loans} lượt mượn</Tag>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                    
                    <Row gutter={[16, 16]}>
                        <Col xs={12} md={8}><StatCard title="Tổng đầu sách" value={stats?.total_books} subTitle="Kho lưu trữ" icon={<ReadOutlined />} color="#fbbf24" /></Col>
                        <Col xs={12} md={8}><StatCard title="Thành viên" value={stats?.total_members} subTitle="Độc giả active" icon={<UserOutlined />} color="#3b82f6" /></Col>
                        <Col xs={12} md={8}><StatCard title="Đang cho mượn" value={stats?.active_loans} subTitle="Sách đang lưu hành" icon={<SyncOutlined />} color="#10b981" /></Col>
                    </Row>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title={<span style={{ color: '#f3f4f6' }}><TrophyOutlined /> Bảng xếp hạng</span>} bordered={false} style={{ background: '#1f2937', borderRadius: 16 }} headStyle={{ borderBottom: '1px solid #374151' }}>
                        <List itemLayout="horizontal" dataSource={topBooks} renderItem={(item, index) => (
                            <List.Item style={{ borderBottom: '1px solid #374151', padding: '12px 0' }}>
                                <List.Item.Meta
                                    avatar={
                                        <BookCover item={item} getFileUrl={getFileUrl} height={64} style={{ width: 48, borderRadius: 4, background: 'transparent', padding: 0 }} />
                                    }
                                    title={<Text style={{ color: '#f3f4f6', fontSize: 14 }}>{item.title || item.book_title}</Text>}
                                    description={<Text style={{ color: '#9ca3af', fontSize: 12 }}>{item.author}</Text>}
                                />
                                <div style={{ textAlign: 'right' }}><div style={{ color: '#fbbf24', fontWeight: 'bold' }}>#{index + 1}</div><Text style={{ fontSize: 10, color: '#6b7280' }}>{item.total_loans} mượn</Text></div>
                            </List.Item>
                        )} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;