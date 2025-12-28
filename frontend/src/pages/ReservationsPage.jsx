import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Card, Typography, Button, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Space, Tooltip } from 'antd';
import { BookOutlined, UserOutlined, CalendarOutlined, DeleteOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { getReservations, createReservation, deleteReservation, getBooks, getMembers, borrowBook } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const ReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchInput, setSearchInput] = useState('');

    const fetchReservations = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                ...(sortBy && { sort_by: sortBy, sort_order: sortOrder })
            };
            const res = await getReservations(params);
            setReservations(res.data);
        } catch (error) {
            console.error(error);
            message.error("Lỗi tải danh sách đặt trước");
        } finally {
            setLoading(false);
        }
    }, [filters, sortBy, sortOrder, message]);

    useEffect(() => {
        fetchReservations();
        const loadOptions = async () => {
            try {
                const [booksRes, membersRes] = await Promise.all([getBooks(), getMembers()]);
                setBooks(booksRes.data);
                setMembers(membersRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        loadOptions();
    }, [fetchReservations]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, q: searchInput || undefined }));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleCreateReservation = async (values) => {
        setConfirmLoading(true);
        try {
            const payload = {
                member_id: values.member_id,
                book_id: values.book_id,
            };
            
            // Add reservation_date if provided, otherwise backend will use today
            if (values.reservation_date) {
                payload.reservation_date = values.reservation_date.format('YYYY-MM-DD');
            }
            
            await createReservation(payload);
            message.success("Đặt trước thành công!");
            setIsModalOpen(false);
            form.resetFields();
            fetchReservations();
        } catch (error) {
            message.error(error.response?.data?.detail || "Lỗi tạo đặt trước");
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleDeleteReservation = async (id) => {
        try {
            await deleteReservation(id);
            message.success("Đã hủy đặt trước!");
            fetchReservations();
        } catch (error) {
            message.error(error.response?.data?.detail || "Lỗi hủy đặt trước");
        }
    };

    const handleBorrowFromReservation = async (reservation) => {
        // Validate book availability
        if (!reservation.book) {
            message.error("Thông tin sách không hợp lệ!");
            return;
        }

        if (reservation.book.available_copies < 1) {
            message.warning("Sách này hiện không còn sẵn sàng để mượn!");
            return;
        }

        try {
            // Create loan from reservation with reservation_id
            await borrowBook({
                book_id: reservation.book_id,
                member_id: reservation.member_id,
                days: 14, // Default loan duration
                reservation_id: reservation.id, // Include reservation_id to update status
            });

            message.success({
                content: (
                    <div>
                        <div style={{ marginBottom: 4, fontWeight: 'bold' }}>
                            ✅ Mượn sách thành công!
                        </div>
                        <div style={{ fontSize: 12, color: '#52c41a' }}>
                            Đã tạo mượn sách và cập nhật trạng thái đặt trước
                        </div>
                    </div>
                ),
                duration: 3,
            });

            fetchReservations();
        } catch (error) {
            const errorDetail = error.response?.data?.detail || error.message;
            let errorMessage = "Lỗi khi tạo mượn sách";

            // Handle specific error messages
            if (typeof errorDetail === 'string') {
                if (errorDetail.includes('Limit reached') || errorDetail.includes('limit')) {
                    errorMessage = "Thành viên đã đạt giới hạn số sách mượn tối đa!";
                } else if (errorDetail.includes('Out of stock') || errorDetail.includes('stock')) {
                    errorMessage = "Sách này hiện không còn sẵn sàng!";
                } else if (errorDetail.includes('Member invalid') || errorDetail.includes('invalid')) {
                    errorMessage = "Thành viên không hợp lệ hoặc đã bị vô hiệu hóa!";
                } else {
                    errorMessage = errorDetail;
                }
            }

            message.error(errorMessage);
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
            title: 'Sách',
            dataIndex: ['book', 'title'],
            key: 'book_title',
            render: (text) => <b>{text || "Sách đã bị xóa"}</b>
        },
        {
            title: 'Thành viên',
            dataIndex: ['member', 'full_name'],
            key: 'member_name',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'reservation_date',
            key: 'reservation_date',
            render: (date) => (
                <Tag icon={<CalendarOutlined />} color="default" style={{ background: 'transparent', border: '1px solid #374151', color: '#9ca3af' }}>
                    {dayjs(date).format('DD/MM/YYYY')}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let text = status.toUpperCase();
                if (status === 'pending') {
                    color = 'orange';
                    text = 'ĐANG CHỜ';
                } else if (status === 'approved') {
                    color = 'green';
                    text = 'ĐÃ DUYỆT';
                } else if (status === 'fulfilled') {
                    color = 'green';
                    text = 'ĐÃ HOÀN THÀNH';
                }
                return (
                    <Tag color={color}>
                        {text}
                    </Tag>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_, record) => {
                // Calculate if this reservation can borrow the book
                // Check available copies and other pending reservations for the same book
                const availableCopies = record.book?.available_copies || 0;
                const otherPendingReservations = reservations.filter(
                    r => r.status === 'pending' && 
                    r.book_id === record.book_id && 
                    r.id !== record.id
                ).length;
                const canBorrow = availableCopies > otherPendingReservations && availableCopies > 0;
                
                return (
                <Space size="middle">
                    {record.status === 'pending' && record.book && canBorrow && (
                        <Popconfirm
                            title="Xác nhận mượn sách"
                            description={
                                <div>
                                    <div style={{ marginBottom: 8 }}>
                                        Tạo mượn sách cho <strong>{record.member?.full_name}</strong>?
                                    </div>
                                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                        Sách: <strong>{record.book?.title}</strong>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                                        Trạng thái đặt trước sẽ được cập nhật thành "Đã duyệt" sau khi mượn thành công.
                                    </div>
                                </div>
                            }
                            onConfirm={() => handleBorrowFromReservation(record)}
                            okText="Mượn ngay"
                            cancelText="Hủy"
                        >
                            <Button 
                                type="primary" 
                                size="small" 
                                icon={<ShoppingCartOutlined />}
                                style={{ background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold' }}
                            >
                                Mượn sách
                            </Button>
                        </Popconfirm>
                    )}
                    {record.status === 'pending' && record.book && !canBorrow && (
                        <Tooltip title={
                            availableCopies === 0 
                                ? "Sách hiện không còn sẵn sàng" 
                                : `Còn ${availableCopies} sách nhưng có ${otherPendingReservations} đặt trước khác đang chờ`
                        }>
                            <Button 
                                type="primary" 
                                size="small" 
                                icon={<ShoppingCartOutlined />}
                                disabled
                                style={{ 
                                    background: '#6b7280', 
                                    borderColor: '#6b7280', 
                                    color: '#fff', 
                                    fontWeight: 'bold',
                                    cursor: 'not-allowed'
                                }}
                            >
                                Mượn sách
                            </Button>
                        </Tooltip>
                    )}
                    <Popconfirm
                        title="Xác nhận hủy đặt trước"
                        description="Bạn có chắc chắn muốn hủy đặt trước này?"
                        onConfirm={() => handleDeleteReservation(record.id)}
                        okText="Hủy đặt trước"
                        cancelText="Không"
                    >
                        <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
                            Hủy
                        </Button>
                    </Popconfirm>
                </Space>
                );
            },
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0, color: '#f3f4f6' }}>Đặt trước sách</Title>
                    <Typography.Text style={{ color: '#9ca3af' }}>Quản lý danh sách đặt trước của thành viên</Typography.Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold' }}
                >
                    Đặt trước mới
                </Button>
            </div>

            <Card style={{ marginBottom: 16, background: '#1f2937', border: 'none' }}>
                <Form layout="inline" style={{ width: '100%' }}>
                    <Form.Item label={<span style={{ color: '#f3f4f6' }}>Tìm kiếm</span>}>
                        <Input
                            placeholder="Tên sách, thành viên..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ width: 200 }}
                            allowClear
                            onClear={() => setSearchInput('')}
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
                            <Select.Option value="pending">Đang chờ</Select.Option>
                            <Select.Option value="approved">Đã duyệt</Select.Option>
                            <Select.Option value="fulfilled">Đã hoàn thành</Select.Option>
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
                            <Select.Option value="reservation_date">Ngày đặt</Select.Option>
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
                                setSearchInput('');
                                setSortBy(null);
                                setSortOrder('desc');
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card bodyStyle={{ padding: 0 }} style={{ border: 'none', overflow: 'hidden', background: '#1f2937', borderRadius: 16 }}>
                <Table 
                    columns={columns} 
                    dataSource={reservations} 
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
                    style={{ background: 'transparent' }}
                />
            </Card>

            <Modal 
                title="Đặt trước sách mới" 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                destroyOnHidden={true}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateReservation}>
                    <Form.Item name="member_id" label="Thành viên" rules={[{ required: true, message: 'Vui lòng chọn thành viên!' }]}>
                        <Select
                            placeholder="Chọn thành viên"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={members.map(member => ({
                                value: member.id,
                                label: `${member.full_name} (${member.email})`
                            }))}
                            style={{ width: '100%' }}
                            notFoundContent={members.length === 0 ? 'Đang tải...' : 'Không tìm thấy'}
                        />
                    </Form.Item>
                    <Form.Item name="book_id" label="Sách" rules={[{ required: true, message: 'Vui lòng chọn sách!' }]}>
                        <Select
                            placeholder="Chọn sách"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={books.map(book => ({
                                value: book.id,
                                label: `${book.title} - ${book.author}`
                            }))}
                            style={{ width: '100%' }}
                            notFoundContent={books.length === 0 ? 'Đang tải...' : 'Không tìm thấy'}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="reservation_date" 
                        label="Ngày đặt trước"
                        initialValue={dayjs()}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày đặt trước"
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>
                    
                    <Button type="primary" htmlType="submit" loading={confirmLoading} block style={{ marginTop: 10, background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold' }}>
                        Xác nhận đặt trước
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default ReservationsPage;

