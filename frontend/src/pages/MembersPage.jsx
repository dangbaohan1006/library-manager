import { useEffect, useState } from 'react';
import { Table, Tag, Card, Avatar, Typography, Button, Modal, Form, Input, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { getMembers, createMember } from '../services/api';
import dayjs from 'dayjs';
import axios from 'axios';

const { Title } = Typography;

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await getMembers();
            setMembers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMembers(); }, []);

    const handleCreateMember = async (values) => {
        setConfirmLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/members/', values); 
            
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
            title: 'Thành viên',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2dd4bf' }} />
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{text}</span>
                </div>
            )
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                    <span style={{ color: '#94a3b8' }}><MailOutlined /> {record.email}</span>
                    {record.phone && <span style={{ color: '#94a3b8' }}><PhoneOutlined /> {record.phone}</span>}
                </div>
            )
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'joined_date',
            key: 'joined_date',
            render: (date) => (
                <Tag icon={<CalendarOutlined />} color="default" style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}>
                    {dayjs(date).format('DD/MM/YYYY')}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => (
                <Tag color={active ? '#10b981' : '#ef4444'} style={{ border: 'none' }}>
                    {active ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                </Tag>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0, color: '#e2e8f0' }}>Thành viên</Title>
                    <Typography.Text style={{ color: '#94a3b8' }}>Quản lý độc giả thư viện</Typography.Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: '#2dd4bf', borderColor: '#2dd4bf', color: '#0f172a', fontWeight: 'bold' }}
                >
                    Thêm mới
                </Button>
            </div>
            
            <Card bodyStyle={{ padding: 0 }} style={{ border: 'none', overflow: 'hidden', background: '#1f1f3e' }}>
                <Table 
                    columns={columns} 
                    dataSource={members} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal 
                title={<span style={{ color: '#e2e8f0' }}>Thêm thành viên mới</span>} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateMember}>
                    <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true }]}> <Input /> </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}> <Input /> </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại"> <Input /> </Form.Item>
                    
                    <Button type="primary" htmlType="submit" loading={confirmLoading} block style={{ marginTop: 10, background: '#2dd4bf', borderColor: '#2dd4bf', color: '#0f172a', fontWeight: 'bold' }}>
                        Xác nhận tạo
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default MembersPage;