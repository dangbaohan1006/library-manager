import React, { useState } from 'react';
import { Layout, Menu, Avatar, Input, Space, Typography, Badge } from 'antd';
import { 
    BookOutlined, 
    UserOutlined, 
    DashboardOutlined, 
    SearchOutlined, 
    BellOutlined,
    ReadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    return (
        <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
            <Sider 
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)}
                theme="dark"
                width={260}
                style={{ 
                    boxShadow: '2px 0 8px rgba(0,0,0,0.05)', zIndex: 10, backgroundColor: 'transparent'
                }}
            >
                <div style={{ height: 64, margin: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                   <div style={{ width: 32, height: 32, background: '#234046', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ReadOutlined style={{ color: 'white', fontSize: 18 }} />
                   </div>
                   {!collapsed && <Title level={4} style={{ margin: 0, color: '#e0e0e0' }}>LibManager</Title>}
                </div>
                
                <Menu 
                    theme="dark"
                    defaultSelectedKeys={['1']} 
                    mode="inline"
                    style={{ borderRight: 0, backgroundColor: 'transparent' }}
                    onClick={({ key }) => {
                        if (key === '1') navigate('/');
                        if (key === '2') navigate('/books');
                        if (key === '4') navigate('/loans');
                    }}
                    items={[
                        { key: '1', icon: <DashboardOutlined />, label: 'Tổng quan' },
                        { type: 'divider' },
                        { key: '2', icon: <BookOutlined />, label: 'Quản lý Sách' },
                        { key: '3', icon: <UserOutlined />, label: 'Thành viên' },
                        { key: '4', icon: <ReadOutlined />, label: 'Mượn / Trả sách' },
                    ]}
                />
            </Sider>

            <Layout className="site-layout" style={{ background: 'transparent' }}>
                <Header style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', background: 'transparent' }}>
                    <Input 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                        placeholder="Tìm kiếm sách, tác giả, ISBN..." 
                        style={{ width: 400, borderRadius: 8, background: '#2a2a4a', border: 'none', padding: '8px 12px', color: '#e0e0e0' }}
                    />
                    
                    <Space size={24}>
                        <Badge dot>
                            <BellOutlined style={{ fontSize: 20, color: '#e0e0e0', cursor: 'pointer' }} />
                        </Badge>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" style={{ backgroundColor: '#fde3cf' }} />
                            <span style={{ fontWeight: 500, color: '#e0e0e0' }}>Admin User</span>
                        </div>
                    </Space>
                </Header>

                <Content style={{ margin: '24px 24px', minHeight: 280, background: 'transparent' }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;