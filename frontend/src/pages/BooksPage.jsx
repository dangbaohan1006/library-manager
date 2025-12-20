import { useEffect, useState } from 'react';
import {
    List, Card, Button, Typography, Spin, Modal, Input,
    InputNumber, Form, Popconfirm, Dropdown, Tooltip, App
} from 'antd';
import {
    ShoppingCartOutlined, EditOutlined, DeleteOutlined,
    MoreOutlined, PlusOutlined
} from '@ant-design/icons';
import { getBooks, borrowBook, updateBook, deleteBook, createBook, BASE_URL } from '../services/api';

const { Meta } = Card;
const { Title } = Typography;

const BookCover = ({ item }) => {
    const [imgSrc, setImgSrc] = useState("https://placehold.co/160x240/1f1f3e/FFF?text=Loading");
    
    const getCleanIsbn = (isbn) => {
        if (!isbn) return '';
        return isbn.replace(/-/g, '').replace(/ /g, '');
    };

    useEffect(() => {
        const cleanIsbn = getCleanIsbn(item.isbn);
        if (cleanIsbn) {
            setImgSrc(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`);
        } else {
            setImgSrc("https://placehold.co/160x240/1f1f3e/FFF?text=No+ISBN");
        }
    }, [item]);

    const handleError = () => {
        const cleanIsbn = getCleanIsbn(item.isbn);
        const currentSrc = imgSrc;
        
        if (currentSrc.includes('covers.openlibrary.org')) {
            setImgSrc(`https://books.google.com/books/content?vid=ISBN${cleanIsbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`);
        } else {
            setImgSrc("https://placehold.co/160x240/1f1f3e/FFF?text=No+Cover");
        }
    };

    return (
        <div style={{ height: 260, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', position: 'relative' }}>
            <img
                alt={item.title}
                src={imgSrc}
                onError={handleError}
                style={{ 
                    height: '100%', 
                    maxWidth: '100%', 
                    objectFit: 'contain', 
                    borderRadius: 4,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
                }}
            />
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
                {item.available_copies > 0
                    ? <div style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>SẴN SÀNG</div>
                    : <div style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>HẾT HÀNG</div>
                }
            </div>
        </div>
    );
};

const BooksPage = () => {
    const { message } = App.useApp();

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

    const [selectedBook, setSelectedBook] = useState(null);

    const [borrowForm] = Form.useForm();
    const [updateForm] = Form.useForm();
    const [createForm] = Form.useForm();

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        if (isCreateModalOpen) createForm.resetFields();
    }, [isCreateModalOpen, createForm]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await getBooks();
            setBooks(response.data);
        } catch (error) {
            console.error(error);
            message.error("Không thể tải danh sách sách");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBook = async (values) => {
        setConfirmLoading(true);
        try {
            const payload = {
                title: values.title,
                author: values.author,
                isbn: values.isbn,
                total_copies: values.total_copies,
                publication_year: values.publication_year,
                edition: values.edition
            };

            await createBook(payload);
            message.success("Thêm sách thành công!");
            setIsCreateModalOpen(false);
            fetchBooks();
        } catch (error) {
            const errorDetail = error.response?.data?.detail;
            message.error(typeof errorDetail === 'string' ? errorDetail : "Lỗi khi tạo sách");
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleShowUpdateModal = (book) => {
        setSelectedBook(book);
        updateForm.setFieldsValue(book);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateBook = async (values) => {
        setConfirmLoading(true);
        try {
            const payload = {
                title: values.title,
                author: values.author,
                isbn: values.isbn,
                total_copies: values.total_copies,
                publication_year: values.publication_year,
                edition: values.edition
            };

            await updateBook(selectedBook.id, payload);
            message.success("Cập nhật thành công!");
            setIsUpdateModalOpen(false);
            fetchBooks();
        } catch (error) {
            message.error(error.response?.data?.detail || "Lỗi cập nhật sách");
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleDeleteBook = async (id) => {
        try {
            await deleteBook(id);
            message.success("Đã xóa sách");
            fetchBooks();
        } catch (e) {
            message.error(e.response?.data?.detail || "Không thể xóa");
        }
    };

    const showBorrowModal = (book) => {
        setSelectedBook(book);
        borrowForm.setFieldsValue({ days: 14, memberId: null });
        setIsBorrowModalOpen(true);
    };

    const handleBorrow = async (values) => {
        setConfirmLoading(true);
        try {
            await borrowBook({
                book_id: selectedBook.id,
                member_id: parseInt(values.memberId),
                days: values.days || 14
            });
            message.success(`Mượn thành công!`);
            setIsBorrowModalOpen(false);
            fetchBooks();
        } catch (error) {
            message.error(error.response?.data?.detail || "Lỗi mượn sách");
        } finally {
            setConfirmLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0, color: '#f3f4f6' }}>Kho sách</Title>
                    <Typography.Text style={{ color: '#9ca3af' }}>Quản lý {books.length} đầu sách</Typography.Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold', height: 40 }}
                >
                    Thêm sách
                </Button>
            </div>

            <List
                grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5 }}
                dataSource={books}
                renderItem={(item) => (
                    <List.Item>
                        <Card
                            hoverable
                            style={{ borderRadius: 16, overflow: 'hidden', background: '#1f2937', border: 'none' }}
                            cover={<BookCover item={item} />}
                            actions={[
                                <Dropdown
                                    menu={{
                                        items: [
                                            { key: 'edit', label: 'Cập nhật', icon: <EditOutlined />, onClick: () => handleShowUpdateModal(item) },
                                            { key: 'delete', label: <Popconfirm title="Xóa sách này?" onConfirm={() => handleDeleteBook(item.id)} okText="Xóa" cancelText="Hủy"><span style={{ color: '#ff4d4f' }}>Xóa sách</span></Popconfirm>, icon: <DeleteOutlined style={{ color: '#ff4d4f' }} /> }
                                        ]
                                    }}
                                    trigger={['click']}
                                >
                                    <Button type="text" icon={<MoreOutlined />} style={{ color: '#9ca3af' }}>Quản lý</Button>
                                </Dropdown>,
                                <Button
                                    type="primary"
                                    disabled={item.available_copies === 0}
                                    onClick={() => showBorrowModal(item)}
                                    icon={<ShoppingCartOutlined />}
                                    style={{ borderRadius: 8, background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold' }}
                                >
                                    Mượn
                                </Button>
                            ]}
                        >
                            <Meta
                                title={
                                    <Tooltip title={item.title}>
                                        <div style={{ color: '#f3f4f6', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.title}
                                        </div>
                                    </Tooltip>
                                }
                                description={
                                    <div>
                                        <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>{item.author}</div>
                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{item.publication_year || 'N/A'} • {item.isbn}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid #374151', paddingTop: 8 }}>
                                            <span style={{ color: '#6b7280' }}>ID: {item.id}</span>
                                            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Kho: {item.available_copies}/{item.total_copies}</span>
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />

            <Modal
                title={<span style={{ color: '#f3f4f6' }}>Thêm sách mới</span>}
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                centered
                destroyOnHidden
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreateBook}>
                    <Form.Item name="title" label="Tiêu đề sách" rules={[{ required: true }]}>
                        <Input placeholder="Nhập tiêu đề" />
                    </Form.Item>
                    <Form.Item name="author" label="Tác giả" rules={[{ required: true }]}>
                        <Input placeholder="Nhập tên tác giả" />
                    </Form.Item>
                    <Form.Item name="isbn" label="Mã ISBN" rules={[{ required: true, min: 10 }]}>
                        <Input placeholder="Ví dụ: 978-0132350884" />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="total_copies" label="Số lượng" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="publication_year" label="Năm XB" style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} placeholder="YYYY" />
                        </Form.Item>
                    </div>
                    <Form.Item name="edition" label="Phiên bản (Tùy chọn)">
                        <Input placeholder="Ví dụ: Tái bản lần 1" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={confirmLoading} block style={{ background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold' }}>
                        Xác nhận
                    </Button>
                </Form>
            </Modal>

            <Modal
                title="Cập nhật thông tin"
                open={isUpdateModalOpen}
                onCancel={() => setIsUpdateModalOpen(false)}
                footer={null}
                destroyOnHidden
            >
                <Form form={updateForm} layout="vertical" onFinish={handleUpdateBook}>
                    <Form.Item name="title" label="Tiêu đề">
                        <Input />
                    </Form.Item>
                    <Form.Item name="author" label="Tác giả">
                        <Input />
                    </Form.Item>
                    <Form.Item name="isbn" label="ISBN">
                        <Input />
                    </Form.Item>
                    <Form.Item name="total_copies" label="Tổng số lượng">
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="publication_year" label="Năm XB">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="edition" label="Phiên bản">
                        <Input />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={confirmLoading}
                        block
                        style={{ marginTop: 10, background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold' }}
                    >
                        Lưu thay đổi
                    </Button>
                </Form>
            </Modal>

            <Modal
                title="Mượn sách"
                open={isBorrowModalOpen}
                onCancel={() => setIsBorrowModalOpen(false)}
                onOk={() => borrowForm.submit()}
                confirmLoading={confirmLoading}
                destroyOnHidden
                okButtonProps={{ style: { background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937' } }}
            >
                <Form form={borrowForm} layout="vertical" onFinish={handleBorrow} initialValues={{ days: 14 }}>
                    <Form.Item name="memberId" label="ID Thành viên" rules={[{ required: true }]}>
                        <Input type="number" placeholder="Nhập ID thành viên mượn" />
                    </Form.Item>
                    <Form.Item name="days" label="Số ngày mượn">
                        <InputNumber min={1} max={30} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BooksPage;