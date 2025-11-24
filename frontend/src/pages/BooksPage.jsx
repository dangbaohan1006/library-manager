import { useEffect, useState } from 'react';
import {
    List, Card, Tag, Button, Typography, Spin, Modal, Input,
    InputNumber, Tooltip, Form, Popconfirm, Dropdown, Upload, App
} from 'antd';
import {
    ShoppingCartOutlined, EditOutlined, DeleteOutlined,
    MoreOutlined, PlusOutlined, UploadOutlined,
    FileImageOutlined, EyeOutlined, LockOutlined
} from '@ant-design/icons';
import { getBooks, borrowBook, updateBook, deleteBook, createBook, BASE_URL, checkLoanAccess } from '../services/api';

const { Meta } = Card;
const { Title } = Typography;

// --- [NEW COMPONENT] BookCover: Xử lý ảnh thông minh ---
const BookCover = ({ item, getFileUrl }) => {
    // State lưu URL ảnh hiện tại
    const [imgSrc, setImgSrc] = useState(null);

    // Logic chọn nguồn ảnh ban đầu
    useEffect(() => {
        if (item.image_path) {
            // Nếu DB có đường dẫn ảnh (từ Supabase hoặc Upload) -> Dùng nó
            setImgSrc(getFileUrl(item.image_path));
        } else {
            // Nếu không -> Dùng Open Library
            // Thêm ?default=false để ép trả về lỗi 404 nếu không tìm thấy ảnh (để trigger onError)
            const cleanIsbn = item.isbn.replace(/-/g, '').replace(/ /g, '');
            setImgSrc(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`);
        }
    }, [item, getFileUrl]);

    // Xử lý khi ảnh bị lỗi (Fallback Chain)
    const handleError = () => {
        const cleanIsbn = item.isbn ? item.isbn.replace(/-/g, '').replace(/ /g, '') : '';
        const googleUrl = `https://books.google.com/books/content?vid=ISBN${cleanIsbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
        const placeholder = "https://placehold.co/160x240/1f1f3e/FFF?text=No+Cover";

        // Logic chuyển đổi nguồn
        if (imgSrc !== googleUrl && imgSrc !== placeholder) {
            // Lần 1: Thử sang Google Books (Nguồn dự phòng tốt nhất)
            setImgSrc(googleUrl);
        } else if (imgSrc === googleUrl) {
            // Lần 2: Google cũng lỗi nốt -> Dùng ảnh Placeholder
            setImgSrc(placeholder);
        }
    };

    return (
        <div style={{ height: 260, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '10px' }}>
            <img
                alt={item.title}
                src={imgSrc || "https://placehold.co/160x240/1f1f3e/FFF?text=Loading"}
                onError={handleError}
                style={{ height: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 4, transition: 'all 0.3s' }}
            />
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
                {item.available_copies > 0
                    ? <Tag color="#10b981" style={{ fontWeight: 'bold' }}>Sẵn sàng</Tag>
                    : <Tag color="#ef4444" style={{ fontWeight: 'bold' }}>Hết hàng</Tag>
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isReadModalOpen, setIsReadModalOpen] = useState(false);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

    const [selectedBook, setSelectedBook] = useState(null);
    const [readingBookUrl, setReadingBookUrl] = useState(null);

    const [borrowForm] = Form.useForm();
    const [updateForm] = Form.useForm();
    const [createForm] = Form.useForm();
    const [accessForm] = Form.useForm();

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        if (isCreateModalOpen) {
            createForm.resetFields();
        }
    }, [isCreateModalOpen, createForm]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await getBooks();
            setBooks(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        return `${BASE_URL}/${path.replace(/\\/g, '/')}`;
    };

    const handleCreateBook = async (values) => {
        setConfirmLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('author', values.author);
            formData.append('isbn', values.isbn);
            formData.append('total_copies', String(values.total_copies));
            
            if (values.edition) formData.append('edition', values.edition);
            if (values.publication_year) formData.append('publication_year', String(values.publication_year));
            
            if (values.file && values.file.length > 0) {
                formData.append('file', values.file[0].originFileObj);
            }
            if (values.cover_image && values.cover_image.length > 0) {
                formData.append('cover_image', values.cover_image[0].originFileObj);
            }

            await createBook(formData);
            message.success("Thêm sách thành công!");
            setIsCreateModalOpen(false);
            fetchBooks();
        } catch (error) {
            console.error("Lỗi API:", error.response?.data);
            const errorDetail = error.response?.data?.detail;
            if (typeof errorDetail === 'string') {
                message.error(errorDetail);
            } else if (Array.isArray(errorDetail)) {
                message.error(`Lỗi: ${errorDetail[0].msg} (${errorDetail[0].loc[1]})`);
            } else {
                message.error("Không thể tạo sách. Vui lòng thử lại.");
            }
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleClickRead = (book) => {
        setSelectedBook(book);
        setIsAccessModalOpen(true);
        accessForm.resetFields();
    };

    const handleCheckAccess = async (values) => {
        setConfirmLoading(true);
        try {
            const res = await checkLoanAccess(selectedBook.id, values.memberId);
            if (res.data.has_access) {
                message.success("Xác thực thành công!");
                setIsAccessModalOpen(false);
                const url = getFileUrl(selectedBook.file_path);
                setReadingBookUrl(url);
                setIsReadModalOpen(true);
            } else {
                message.error("Bạn chưa mượn cuốn sách này!");
            }
        } catch (error) {
            message.error("Lỗi kiểm tra quyền truy cập");
        } finally {
            setConfirmLoading(false);
        }
    };

    const showBorrowModal = (book) => {
        setSelectedBook(book);
        borrowForm.setFieldsValue({ days: 14, memberId: null });
        setIsModalOpen(true);
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
            setIsModalOpen(false);
            fetchBooks();
        } catch (error) {
            message.error(error.response?.data?.detail || "Lỗi mượn sách");
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
            // [FIX] Chuyển sang dùng FormData để gửi được cả Text và File
            const formData = new FormData();
            
            if (values.title) formData.append('title', values.title);
            if (values.author) formData.append('author', values.author);
            if (values.total_copies) formData.append('total_copies', String(values.total_copies));

            // Kiểm tra nếu có file ảnh mới được chọn
            if (values.cover_image && values.cover_image.length > 0) {
                formData.append('cover_image', values.cover_image[0].originFileObj);
            }

            await updateBook(selectedBook.id, formData);
            message.success("Cập nhật thành công!");
            setIsUpdateModalOpen(false);
            fetchBooks(); // Load lại danh sách để thấy ảnh mới
        } catch (error) {
            console.error(error);
            message.error("Lỗi cập nhật sách");
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleDeleteBook = async (id) => {
        try {
            await deleteBook(id);
            message.success("Đã xóa");
            fetchBooks();
        } catch (e) {
            message.error(e.response?.data?.detail || "Không thể xóa");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0, color: '#f3f4f6' }}>Kho Sách</Title>
                    <Typography.Text style={{ color: '#9ca3af' }}>Quản lý {books.length} đầu sách</Typography.Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold', height: 40, borderRadius: 8 }}
                >
                    Thêm sách mới
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
                            // [UPDATE] Sử dụng Component BookCover mới
                            cover={<BookCover item={item} getFileUrl={getFileUrl} />}
                            actions={[
                                <Dropdown
                                    menu={{
                                        items: [
                                            { key: 'edit', label: 'Cập nhật', icon: <EditOutlined />, onClick: () => handleShowUpdateModal(item) },
                                            { key: 'delete', label: <Popconfirm title="Xóa?" onConfirm={() => handleDeleteBook(item.id)} okText="Xóa" cancelText="Hủy"><span style={{ color: '#ff4d4f' }}>Xóa sách</span></Popconfirm>, icon: <DeleteOutlined style={{ color: '#ff4d4f' }} /> }
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Tooltip title={item.title}>
                                            <div style={{ color: '#f3f4f6', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                                                {item.title}
                                            </div>
                                        </Tooltip>
                                        {item.file_path && (
                                            <Tooltip title="Đọc sách">
                                                <Button
                                                    type="text"
                                                    icon={<EyeOutlined />}
                                                    size="small"
                                                    style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)' }}
                                                    onClick={(e) => { e.stopPropagation(); handleClickRead(item); }}
                                                />
                                            </Tooltip>
                                        )}
                                    </div>
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

            {/* --- MODALS --- (Giữ nguyên các modal như cũ) */}
            <Modal
                title={<span style={{ color: '#f3f4f6', fontSize: 18 }}>Thêm sách mới</span>}
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                centered
                destroyOnHidden={true}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreateBook} preserve={false}>
                    <Form.Item name="title" label="Tiêu đề sách" rules={[{ required: true }]}>
                        <Input placeholder="Nhập tiêu đề" />
                    </Form.Item>
                    <Form.Item name="author" label="Tác giả" rules={[{ required: true }]}>
                        <Input placeholder="Nhập tên tác giả" />
                    </Form.Item>
                    <Form.Item name="isbn" label="Mã ISBN" rules={[{ required: true }]}>
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
                    <Form.Item name="file" label="File PDF" valuePropName="fileList" getValueFromEvent={normFile}>
                        <Upload 
                            beforeUpload={(file) => {
                                const isLt100M = file.size / 1024 / 1024 < 100;
                                if (!isLt100M) {
                                    message.error('File quá nặng! Vui lòng chọn file dưới 100MB.');
                                    return Upload.LIST_IGNORE;
                                }
                                return false;
                            }} 
                            maxCount={1} 
                            accept=".pdf"
                        >
                            <Button icon={<UploadOutlined />}>Chọn PDF</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item name="cover_image" label="Ảnh bìa" valuePropName="fileList" getValueFromEvent={normFile}>
                        <Upload beforeUpload={() => false} maxCount={1} accept="image/*" listType="picture">
                            <Button icon={<FileImageOutlined />}>Chọn ảnh bìa</Button>
                        </Upload>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={confirmLoading} block style={{ marginTop: 10, background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937', fontWeight: 'bold' }}>
                        Xác nhận
                    </Button>
                </Form>
            </Modal>

            <Modal
                title={<span style={{ color: '#f3f4f6' }}><LockOutlined /> Xác thực</span>}
                open={isAccessModalOpen}
                onCancel={() => setIsAccessModalOpen(false)}
                onOk={() => accessForm.submit()}
                confirmLoading={confirmLoading}
                destroyOnHidden={true}
                okText="Kiểm tra"
                okButtonProps={{ style: { background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937' } }}
            >
                <div style={{ marginBottom: 16, color: '#9ca3af' }}>Nhập ID thành viên để mượn/đọc sách.</div>
                <Form form={accessForm} layout="vertical" onFinish={handleCheckAccess}>
                    <Form.Item name="memberId" label="ID Thành viên" rules={[{ required: true }]}>
                        <Input type="number" autoFocus />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<div style={{ color: '#f3f4f6' }}>Đọc sách</div>}
                open={isReadModalOpen}
                onCancel={() => { setIsReadModalOpen(false); setReadingBookUrl(null); }}
                footer={null}
                width="90%"
                style={{ top: 20 }}
                styles={{ body: { height: '85vh', padding: 0, background: '#0f172a' } }}
                destroyOnHidden={true}
            >
                {readingBookUrl ? (
                    <iframe src={`${readingBookUrl}#toolbar=0&navpanes=0&scrollbar=0`} width="100%" height="100%" style={{ border: 'none' }} title="PDF Reader" />
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#fff' }}><Spin size="large" /></div>
                )}
            </Modal>

            <Modal
                title="Mượn sách"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => borrowForm.submit()}
                confirmLoading={confirmLoading}
                destroyOnHidden={true}
                okButtonProps={{ style: { background: '#fbbf24', borderColor: '#fbbf24', color: '#1f2937' } }}
            >
                <Form form={borrowForm} layout="vertical" onFinish={handleBorrow} initialValues={{ days: 14 }}>
                    <Form.Item name="memberId" label="ID Thành viên" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="days" label="Số ngày">
                        <InputNumber min={1} max={30} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Cập nhật thông tin"
                open={isUpdateModalOpen}
                onCancel={() => setIsUpdateModalOpen(false)}
                footer={null}
                destroyOnHidden={true}
            >
                <Form form={updateForm} layout="vertical" onFinish={handleUpdateBook}>
                    <Form.Item name="title" label="Tiêu đề">
                        <Input />
                    </Form.Item>
                    <Form.Item name="author" label="Tác giả">
                        <Input />
                    </Form.Item>
                    <Form.Item name="total_copies" label="Tổng số lượng">
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    
                    <Form.Item 
                        name="cover_image" 
                        label="Cập nhật ảnh bìa" 
                        valuePropName="fileList" 
                        getValueFromEvent={normFile}
                    >
                        <Upload beforeUpload={() => false} maxCount={1} accept="image/*" listType="picture">
                            <Button icon={<FileImageOutlined />}>Chọn ảnh mới</Button>
                        </Upload>
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
        </div>
    );
};

export default BooksPage;