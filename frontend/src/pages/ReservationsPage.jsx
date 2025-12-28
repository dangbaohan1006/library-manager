import { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Button, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Space } from 'antd';
import { BookOutlined, UserOutlined, CalendarOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getReservations, createReservation, deleteReservation, getBooks, getMembers } from '../services/api';
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

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const res = await getReservations();
            setReservations(res.data);
        } catch (error) {
            console.error(error);
            message.error("Lỗi tải danh sách đặt trước");
        } finally {
            setLoading(false);
        }
    };

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
    }, []);

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

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
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
            render: (status) => (
                <Tag color={status === 'pending' ? 'orange' : status === 'fulfilled' ? 'green' : 'default'}>
                    {status === 'pending' ? 'ĐANG CHỜ' : status === 'fulfilled' ? 'ĐÃ HOÀN THÀNH' : status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
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
            ),
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
            
            <Card bodyStyle={{ padding: 0 }} style={{ border: 'none', overflow: 'hidden', background: '#1f2937', borderRadius: 16 }}>
                <Table 
                    columns={columns} 
                    dataSource={reservations} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
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

