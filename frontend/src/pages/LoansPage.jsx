import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Card, Typography, message, Popconfirm, Space, Tooltip, Form, Input, Select } from 'antd';
import { CheckCircleOutlined, SyncOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { getLoans, returnBook, payFine } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const LoansPage = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchLoans = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                ...(sortBy && { sort_by: sortBy, sort_order: sortOrder })
            };
            const response = await getLoans(params);
            setLoans(response.data);
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi tải danh sách mượn trả");
        } finally {
            setLoading(false);
        }
    }, [filters, sortBy, sortOrder]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const calculateTotalFine = (fines) => {
        if (!fines || fines.length === 0) return 0;
        return fines.reduce((total, fine) => total + parseFloat(fine.amount || 0), 0);
    };

    const handleReturn = async (loanId) => {
        try {
            const response = await returnBook(loanId);
            const loanData = response.data;
            const fines = loanData.fines || [];
            const totalFine = calculateTotalFine(fines);
            
            // Hiển thị thông báo dựa trên trường hợp
            if (totalFine > 0) {
                // Tính số ngày quá hạn từ due_date và return_date
                const dueDate = dayjs(loanData.due_date);
                const returnDate = dayjs(loanData.return_date);
                const overdueDays = returnDate.diff(dueDate, 'day');
                
                message.warning({
                    content: (
                        <div>
                            <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 15 }}>
                                ⚠️ Trả sách quá hạn!
                            </div>
                            <div style={{ marginBottom: 6, fontSize: 13 }}>
                                Số ngày quá hạn: <strong style={{ color: '#ff4d4f' }}>{overdueDays} ngày</strong>
                            </div>
                            <div style={{ marginBottom: 6, fontSize: 13 }}>
                                Chi phí phạt: <strong style={{ color: '#ff4d4f', fontSize: 14 }}>{formatCurrency(totalFine)}</strong>
                            </div>
                            <div style={{ 
                                fontSize: 12, 
                                color: '#8c8c8c', 
                                marginTop: 8,
                                paddingTop: 8,
                                borderTop: '1px solid #f0f0f0'
                            }}>
                                Trạng thái thanh toán: <strong>{fines[0]?.status === 'pending' ? 'Chưa thanh toán' : 'Đã thanh toán'}</strong>
                            </div>
                        </div>
                    ),
                    duration: 6,
                });
            } else {
                message.success({
                    content: (
                        <div>
                            <div style={{ marginBottom: 4, fontWeight: 'bold' }}>
                                ✅ Đã trả sách thành công!
                            </div>
                            <div style={{ fontSize: 12, color: '#52c41a' }}>
                                Không có chi phí phạt
                            </div>
                        </div>
                    ),
                    duration: 3,
                });
            }
            fetchLoans();
        } catch (error) {
            message.error(error.response?.data?.detail || "Có lỗi xảy ra");
        }
    };

    const handlePayFine = async (fineId) => {
        try {
            await payFine(fineId);
            message.success({
                content: (
                    <div>
                        <div style={{ marginBottom: 4, fontWeight: 'bold' }}>
                            ✅ Đã thanh toán phí thành công!
                        </div>
                        <div style={{ fontSize: 12, color: '#52c41a' }}>
                            Trạng thái phí đã được cập nhật
                        </div>
                    </div>
                ),
                duration: 3,
            });
            fetchLoans();
        } catch (error) {
            message.error(error.response?.data?.detail || "Lỗi khi cập nhật trạng thái thanh toán");
        }
    };

    const columns = [
        { 
            title: 'STT', 
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
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
            title: 'Chi phí', 
            key: 'fine',
            width: 150,
            render: (_, record) => {
                const fines = record.fines || [];
                const totalFine = fines.reduce((total, fine) => total + parseFloat(fine.amount || 0), 0);
                
                if (totalFine > 0) {
                    const isPaid = fines.some(fine => fine.status === 'paid');
                    return (
                        <div>
                            <div style={{ 
                                color: isPaid ? '#52c41a' : '#ff4d4f', 
                                fontWeight: 'bold',
                                fontSize: 13
                            }}>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(totalFine)}
                            </div>
                            <Tag 
                                color={isPaid ? 'green' : 'orange'} 
                                size="small"
                                style={{ marginTop: 4, fontSize: 10 }}
                            >
                                {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </Tag>
                        </div>
                    );
                }
                return (
                    <span style={{ color: '#8c8c8c' }}>0 ₫</span>
                );
            }
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
            width: 200,
            render: (_, record) => {
                const fines = record.fines || [];
                const hasUnpaidFine = fines.some(fine => fine.status === 'pending');
                const unpaidFine = fines.find(fine => fine.status === 'pending');
                
                return (
                    <Space size="middle" direction="vertical" style={{ width: '100%' }}>
                        {record.status !== 'returned' && (() => {
                            const today = dayjs();
                            const dueDate = dayjs(record.due_date);
                            const isOverdue = today.isAfter(dueDate, 'day');
                            const overdueDays = isOverdue ? today.diff(dueDate, 'day') : 0;
                            const fineAmount = overdueDays * 5000; // FINE_PER_DAY = 5000
                            
                            return (
                                <Popconfirm
                                    title="Xác nhận trả sách"
                                    description={
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                Bạn có chắc chắn muốn trả cuốn sách <strong>{record.book?.title || 'N/A'}</strong>?
                                            </div>
                                            {isOverdue ? (
                                                <div style={{ 
                                                    marginTop: 12, 
                                                    padding: 12, 
                                                    background: '#fff7e6', 
                                                    borderRadius: 6,
                                                    border: '1px solid #ffd591'
                                                }}>
                                                    <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 'bold', color: '#d46b08' }}>
                                                        ⚠️ Sách đã quá hạn!
                                                    </div>
                                                    <div style={{ marginBottom: 4, fontSize: 12, color: '#8c8c8c' }}>
                                                        Số ngày quá hạn: <strong style={{ color: '#ff4d4f' }}>{overdueDays} ngày</strong>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                        Chi phí phạt: <strong style={{ color: '#ff4d4f', fontSize: 13 }}>{formatCurrency(fineAmount)}</strong>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ 
                                                    marginTop: 8, 
                                                    padding: 8, 
                                                    background: '#f6ffed', 
                                                    borderRadius: 6,
                                                    border: '1px solid #b7eb8f',
                                                    fontSize: 12,
                                                    color: '#52c41a'
                                                }}>
                                                    ✅ Sách chưa quá hạn - Không có phí phạt
                                                </div>
                                            )}
                                        </div>
                                    }
                                    onConfirm={() => handleReturn(record.id)}
                                    okText="Trả ngay"
                                    cancelText="Hủy"
                                >
                                    <Button type="primary" size="small" icon={<CheckCircleOutlined />} ghost block>
                                        Trả sách
                                    </Button>
                                </Popconfirm>
                            );
                        })()}
                        {record.status === 'returned' && hasUnpaidFine && unpaidFine && (
                            <Popconfirm
                                title="Xác nhận thanh toán"
                                description={
                                    <div>
                                        <div style={{ marginBottom: 8 }}>
                                            Xác nhận đã thanh toán phí <strong>{formatCurrency(parseFloat(unpaidFine.amount))}</strong>?
                                        </div>
                                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                            Sách: <strong>{record.book?.title || 'N/A'}</strong>
                                        </div>
                                    </div>
                                }
                                onConfirm={() => handlePayFine(unpaidFine.id)}
                                okText="Xác nhận thanh toán"
                                cancelText="Hủy"
                            >
                                <Button 
                                    type="primary" 
                                    size="small" 
                                    icon={<DollarOutlined />}
                                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                    block
                                >
                                    Đã thanh toán
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ padding: 0 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Quản lý mượn / trả</Title>
                    <Typography.Text type="secondary">Theo dõi lịch sử mượn sách của thành viên</Typography.Text>
                </div>
                <Button icon={<SyncOutlined />} onClick={fetchLoans}>Làm mới</Button>
            </div>

            <Card style={{ marginBottom: 16, background: '#1f2937', border: 'none' }}>
                <Form layout="inline" style={{ width: '100%' }}>
                    <Form.Item label={<span style={{ color: '#f3f4f6' }}>Tìm kiếm</span>}>
                        <Input
                            placeholder="Tên sách, thành viên..."
                            value={filters.q || ''}
                            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                            style={{ width: 200 }}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item label={<span style={{ color: '#f3f4f6' }}>Trạng thái</span>}>
                        <Select
                            placeholder="Chọn trạng thái"
                            value={filters.status}
                            onChange={(value) => setFilters({ ...filters, status: value || undefined })}
                            style={{ width: 150 }}
                            allowClear
                        >
                            <Select.Option value="active">Đang mượn</Select.Option>
                            <Select.Option value="returned">Đã trả</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label={<span style={{ color: '#f3f4f6' }}>Sắp xếp</span>}>
                        <Select
                            placeholder="Chọn cột"
                            value={sortBy}
                            onChange={(value) => setSortBy(value)}
                            style={{ width: 150 }}
                            allowClear
                        >
                            <Select.Option value="loan_date">Ngày mượn</Select.Option>
                            <Select.Option value="due_date">Hạn trả</Select.Option>
                            <Select.Option value="return_date">Ngày trả</Select.Option>
                            <Select.Option value="status">Trạng thái</Select.Option>
                        </Select>
                    </Form.Item>
                    {sortBy && (
                        <Form.Item>
                            <Select
                                value={sortOrder}
                                onChange={(value) => setSortOrder(value)}
                                style={{ width: 120 }}
                            >
                                <Select.Option value="asc">Tăng dần</Select.Option>
                                <Select.Option value="desc">Giảm dần</Select.Option>
                            </Select>
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Button
                            onClick={() => {
                                setFilters({});
                                setSortBy(null);
                                setSortOrder('desc');
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: 0 }}>
                <Table 
                    columns={columns} 
                    dataSource={loans} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ 
                        ...pagination,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                        onChange: (page, pageSize) => {
                            setPagination({ current: page, pageSize });
                        },
                        onShowSizeChange: (current, size) => {
                            setPagination({ current: 1, pageSize: size });
                        }
                    }}
                />
            </Card>
        </div>
    );
};

export default LoansPage;