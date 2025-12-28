import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Card, Avatar, Typography, Button, Modal, Form, Input, message, Select } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { getMembers, createMember } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                ...(sortBy && { sort_by: sortBy, sort_order: sortOrder })
            };
            const res = await getMembers(params);
            setMembers(res.data);
        } catch (error) {
            console.error(error);
            message.error("Lỗi tải danh sách thành viên");
        } finally {
            setLoading(false);
        }
    }, [filters, sortBy, sortOrder, message]);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    const handleCreateMember = async (values) => {
        setConfirmLoading(true);
        try {
            await createMember(values);
            
            message.success("Thêm thành viên thành công!");
            setIsModalOpen(false);
            form.resetFields();
            fetchMembers();
        } catch (error) {
            message.error(error.response?.data?.detail || "Lỗi tạo thành viên");
        } finally {
            setConfirmLoading(false);
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
            title: 'Thành viên',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2dd4bf' }} />
                    <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{text}</span>
                </div>
            )
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                    <span style={{ color: '#9ca3af' }}><MailOutlined /> {record.email}</span>
                    {record.phone && <span style={{ color: '#9ca3af' }}><PhoneOutlined /> {record.phone}</span>}
                </div>
            )
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'joined_date',
            key: 'joined_date',
            render: (date) => (
                <Tag icon={<CalendarOutlined />} color="default" style={{ background: 'transparent', border: '1px solid #374151', color: '#9ca3af' }}>
                    {dayjs(date).format('DD/MM/YYYY')}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => (
                <Tag color={active ? '#10b981' : '#ef4444'} style={{ border: 'none', fontWeight: 'bold' }}>
                    {active ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                </Tag>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0, color: '#f3f4f6' }}>Thành viên</Title>
                    <Typography.Text style={{ color: '#9ca3af' }}>Quản lý độc giả thư viện</Typography.Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold' }}
                >
                    Thêm mới
                </Button>
            </div>
            
            <Card style={{ marginBottom: 16, background: '#1f2937', border: 'none' }}>
                <Form layout="inline" style={{ width: '100%' }}>
                    <Form.Item label={<span style={{ color: '#f3f4f6' }}>Tìm kiếm</span>}>
                        <Input
                            placeholder="Tên, email..."
                            value={filters.q || ''}
                            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                            style={{ width: 200 }}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item label={<span style={{ color: '#f3f4f6' }}>Trạng thái</span>}>
                        <Select
                            placeholder="Chọn trạng thái"
                            value={filters.is_active}
                            onChange={(value) => setFilters({ ...filters, is_active: value !== undefined ? value : undefined })}
                            style={{ width: 150 }}
                            allowClear
                        >
                            <Select.Option value={true}>Hoạt động</Select.Option>
                            <Select.Option value={false}>Bị khóa</Select.Option>
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
                            <Select.Option value="full_name">Tên</Select.Option>
                            <Select.Option value="email">Email</Select.Option>
                            <Select.Option value="joined_date">Ngày tham gia</Select.Option>
                            <Select.Option value="is_active">Trạng thái</Select.Option>
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
            
            <Card bodyStyle={{ padding: 0 }} style={{ border: 'none', overflow: 'hidden', background: '#1f2937', borderRadius: 16 }}>
                <Table 
                    columns={columns} 
                    dataSource={members} 
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
                title="Thêm thành viên mới" 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                destroyOnHidden={true}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateMember}>
                    <Form.Item 
                        name="full_name" 
                        label="Họ và tên" 
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    > 
                        <Input placeholder="Nhập họ và tên" /> 
                    </Form.Item>
                    <Form.Item 
                        name="email" 
                        label="Email" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    > 
                        <Input placeholder="Nhập email" /> 
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại"> 
                        <Input placeholder="Nhập số điện thoại" /> 
                    </Form.Item>
                    
                    <Button type="primary" htmlType="submit" loading={confirmLoading} block style={{ marginTop: 10, background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold' }}>
                        Xác nhận tạo
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default MembersPage;