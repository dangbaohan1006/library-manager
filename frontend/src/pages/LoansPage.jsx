import { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Typography, message, Popconfirm, Space, Tooltip } from 'antd';
import { CheckCircleOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getLoans, returnBook } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const LoansPage = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const response = await getLoans();
            setLoans(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách mượn trả");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleReturn = async (loanId) => {
        try {
            await returnBook(loanId);
            message.success("Đã trả sách thành công!");
            fetchLoans();
        } catch (error) {
            message.error(error.response?.data?.detail || "Có lỗi xảy ra");
        }
    };

    const columns = [
        { 
            title: 'ID', 
            dataIndex: 'id', 
            key: 'id',
            width: 60,
        },
        { 
            title: 'Sách mượn', 
            dataIndex: ['book', 'title'],
            key: 'book_title',
            render: (text) => <b>{text || "Sách đã bị xóa"}</b>
        },
        { 
            title: 'Người mượn', 
            dataIndex: ['member', 'full_name'],
            key: 'member_name',
        },
        { 
            title: 'Ngày mượn', 
            dataIndex: 'loan_date', 
            key: 'loan_date',
            render: (date) => dayjs(date).format('DD/MM/YYYY')
        },
        { 
            title: 'Hạn trả', 
            dataIndex: 'due_date', 
            key: 'due_date',
            render: (date) => <span style={{ color: '#ff4d4f' }}>{dayjs(date).format('DD/MM/YYYY')}</span>
        },
        { 
            title: 'Ngày trả', 
            dataIndex: 'return_date', 
            key: 'return_date',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => {
                let color = 'geekblue';
                let text = 'Đang mượn';
                if (status === 'returned') { color = 'green'; text = 'Đã trả'; }
                if (status === 'overdue') { color = 'volcano'; text = 'Quá hạn'; }
                return <Tag color={color} key={status}>{text.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.status !== 'returned' && (
                        <Popconfirm
                            title="Xác nhận trả sách"
                            description="Bạn có chắc chắn muốn trả cuốn sách này?"
                            onConfirm={() => handleReturn(record.id)}
                            okText="Trả ngay"
                            cancelText="Hủy"
                        >
                            <Button type="primary" size="small" icon={<CheckCircleOutlined />} ghost>
                                Trả sách
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 0 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Quản lý Mượn / Trả</Title>
                    <Typography.Text type="secondary">Theo dõi lịch sử mượn sách của thành viên</Typography.Text>
                </div>
                <Button icon={<SyncOutlined />} onClick={fetchLoans}>Làm mới</Button>
            </div>

            <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: 0 }}>
                <Table 
                    columns={columns} 
                    dataSource={loans} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default LoansPage;