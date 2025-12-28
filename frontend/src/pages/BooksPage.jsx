import { useEffect, useState, useCallback } from "react";
import {
  List,
  Card,
  Button,
  Typography,
  Spin,
  Modal,
  Input,
  InputNumber,
  Form,
  Popconfirm,
  Dropdown,
  Tooltip,
  App,
  Upload,
  Select,
} from "antd";
import {
  ShoppingCartOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  getBooks,
  borrowBook,
  updateBook,
  deleteBook,
  createBook,
  BASE_URL,
  createReservation,
  uploadBookImage,
  getMembers,
} from "../services/api";

const { Meta } = Card;
const { Title } = Typography;

const defaultCover = "https://placehold.co/160x240/1f1f3e/FFF?text=No+Cover";

const BookCover = ({ item }) => {
    return (
    <div
      style={{
        height: 260,
        background: "#111827",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        position: "relative",
      }}
    >
      {item.image_path && (
            <img
                alt={item.title}
          src={item.image_path}
          onError={() => defaultCover}
                style={{ 
            height: "100%",
            maxWidth: "100%",
            objectFit: "contain",
                    borderRadius: 4,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
          }}
        />
      )}
      <div style={{ position: "absolute", top: 10, right: 10 }}>
        {item.available_copies > 0 ? (
          <div
            style={{
              background: "#10b981",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: "800",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            SẴN SÀNG
          </div>
        ) : (
          <div
            style={{
              background: "#ef4444",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: "800",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            HẾT HÀNG
          </div>
        )}
            </div>
        </div>
    );
};

const BooksPage = () => {
    const { message } = App.useApp();

    const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

    const [selectedBook, setSelectedBook] = useState(null);

    const [borrowForm] = Form.useForm();
    const [updateForm] = Form.useForm();
    const [createForm] = Form.useForm();
  const [reserveForm] = Form.useForm();

    useEffect(() => {
    const loadMembers = async () => {
      try {
        const membersRes = await getMembers();
        setMembers(membersRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadMembers();
    }, []);

    useEffect(() => {
        if (isCreateModalOpen) createForm.resetFields();
    }, [isCreateModalOpen, createForm]);

  const fetchBooks = useCallback(async () => {
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
  }, [message]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

    const handleCreateBook = async (values) => {
        setConfirmLoading(true);
        try {
      let imagePath = null;

      // Upload image first if present
      if (
        values.image &&
        values.image.length > 0 &&
        values.image[0].originFileObj
      ) {
        try {
          const file = values.image[0].originFileObj;
          const uploadRes = await uploadBookImage(file);
          imagePath = uploadRes.data.image_path;
        } catch (error) {
          message.error(
            "Lỗi upload ảnh: " + (error.response?.data?.detail || error.message)
          );
          setConfirmLoading(false);
          return;
        }
      }

      // Create book with image path
            const payload = {
                title: values.title,
                author: values.author,
                isbn: values.isbn,
                total_copies: values.total_copies,
                publication_year: values.publication_year,
        edition: values.edition,
        image_path: imagePath,
            };

            await createBook(payload);
            message.success("Thêm sách thành công!");
            setIsCreateModalOpen(false);
      createForm.resetFields();
            fetchBooks();
        } catch (error) {
      const errorDetail = error.response?.data?.detail || error.message;
      message.error(
        typeof errorDetail === "string" ? errorDetail : "Lỗi khi tạo sách"
      );
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleShowUpdateModal = (book) => {
        setSelectedBook(book);
    const formValues = {
      ...book,
      image: book.image_path
        ? [
            {
              uid: "-1",
              name: "current-image.jpg",
              status: "done",
              url: book.image_path,
            },
          ]
        : [],
    };
    updateForm.setFieldsValue(formValues);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateBook = async (values) => {
        setConfirmLoading(true);
        try {
      let imagePath = selectedBook.image_path; // Keep existing image by default

      // Upload new image if present
      if (values.image && values.image.length > 0) {
        const imageFile = values.image[0];
        // Check if it's a new file (has originFileObj) or existing (has url)
        if (imageFile.originFileObj) {
          try {
            const uploadRes = await uploadBookImage(imageFile.originFileObj);
            imagePath = uploadRes.data.image_path;
          } catch (error) {
            message.error(
              "Lỗi upload ảnh: " +
                (error.response?.data?.detail || error.message)
            );
            setConfirmLoading(false);
            return;
          }
        } else if (imageFile.url) {
          // Keep existing image URL
          imagePath = imageFile.url;
        }
      } else {
        // If image was removed, set to null
        imagePath = null;
      }

            const payload = {
                title: values.title,
                author: values.author,
                isbn: values.isbn,
                total_copies: values.total_copies,
                publication_year: values.publication_year,
        edition: values.edition,
        image_path: imagePath,
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
    // Validate book availability before opening modal
    if (book.available_copies < 1) {
      message.warning("Sách này hiện không còn sẵn sàng để mượn!");
      return;
    }
        setSelectedBook(book);
        borrowForm.setFieldsValue({ days: 14, memberId: null });
        setIsBorrowModalOpen(true);
    };

    const handleBorrow = async (values) => {
    // Validate inputs
    if (!values.memberId) {
      message.error("Vui lòng chọn thành viên!");
      return;
    }

    const selectedMember = members.find(m => m.id === parseInt(values.memberId));
    if (!selectedMember) {
      message.error("Thành viên không hợp lệ!");
      return;
    }

    if (!selectedMember.is_active) {
      message.error("Thành viên này đã bị vô hiệu hóa!");
      return;
    }

    const days = values.days || 14;
    if (days < 1 || days > 30) {
      message.error("Số ngày mượn phải từ 1 đến 30 ngày!");
      return;
    }

    // Validate book availability again
    if (!selectedBook || selectedBook.available_copies < 1) {
      message.error("Sách này hiện không còn sẵn sàng!");
      setIsBorrowModalOpen(false);
      fetchBooks(); // Refresh to get latest data
      return;
    }

        setConfirmLoading(true);
        try {
      const response = await borrowBook({
                book_id: selectedBook.id,
                member_id: parseInt(values.memberId),
        days: days,
            });
      
      message.success(
        `Mượn thành công! "${selectedBook.title}" đã được mượn bởi ${selectedMember.full_name}. Hạn trả: ${new Date(response.data.due_date).toLocaleDateString('vi-VN')}`
      );
            setIsBorrowModalOpen(false);
      borrowForm.resetFields();
      fetchBooks(); // Refresh book list to update available_copies
    } catch (error) {
      const errorDetail = error.response?.data?.detail || error.message;
      let errorMessage = "Lỗi mượn sách";
      
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
      
      // Refresh books if there was an availability issue
      if (errorDetail.includes('stock') || errorDetail.includes('Out of stock')) {
        fetchBooks();
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const showReserveModal = (book) => {
    setSelectedBook(book);
    reserveForm.setFieldsValue({ memberId: null });
    setIsReserveModalOpen(true);
  };

  const handleReserve = async (values) => {
    setConfirmLoading(true);
    try {
      await createReservation({
        book_id: selectedBook.id,
        member_id: parseInt(values.memberId),
      });
      message.success("Đặt trước thành công!");
      setIsReserveModalOpen(false);
            fetchBooks();
        } catch (error) {
      message.error(error.response?.data?.detail || "Lỗi đặt trước sách");
        } finally {
            setConfirmLoading(false);
        }
    };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, color: "#f3f4f6" }}>
            Kho sách
          </Title>
          <Typography.Text style={{ color: "#9ca3af" }}>
            Quản lý {books.length} đầu sách
          </Typography.Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
          style={{
            background: "#fbbf24",
            borderColor: "#fbbf24",
            color: "#1f2937",
            fontWeight: "bold",
            height: 40,
          }}
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
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "#1f2937",
                border: "none",
              }}
                            cover={<BookCover item={item} />}
                            actions={[
                                <Dropdown
                  key="manage"
                                    menu={{
                                        items: [
                      {
                        key: "edit",
                        label: "Cập nhật",
                        icon: <EditOutlined />,
                        onClick: () => handleShowUpdateModal(item),
                      },
                      {
                        key: "delete",
                        label: (
                          <Popconfirm
                            title="Xóa sách này?"
                            onConfirm={() => handleDeleteBook(item.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <span style={{ color: "#ff4d4f" }}>Xóa sách</span>
                          </Popconfirm>
                        ),
                        icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
                      },
                    ],
                  }}
                  trigger={["click"]}
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    style={{ color: "#9ca3af" }}
                  >
                    Quản lý
                  </Button>
                                </Dropdown>,
                item.available_copies > 0 ? (
                                <Button
                    key="borrow"
                                    type="primary"
                                    onClick={() => showBorrowModal(item)}
                                    icon={<ShoppingCartOutlined />}
                    style={{
                      borderRadius: 8,
                      background: "#fbbf24",
                      borderColor: "#fbbf24",
                      color: "#1f2937",
                      fontWeight: "bold",
                    }}
                                >
                                    Mượn
                                </Button>
                ) : (
                  <Button
                    key="reserve"
                    type="default"
                    onClick={() => showReserveModal(item)}
                    style={{
                      borderRadius: 8,
                      borderColor: "#fbbf24",
                      color: "#fbbf24",
                      fontWeight: "bold",
                    }}
                  >
                    Đặt trước
                  </Button>
                ),
                            ]}
                        >
                            <Meta
                                title={
                                    <Tooltip title={item.title}>
                    <div
                      style={{
                        color: "#f3f4f6",
                        fontSize: 15,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                                            {item.title}
                                        </div>
                                    </Tooltip>
                                }
                                description={
                                    <div>
                    <div
                      style={{
                        color: "#9ca3af",
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      {item.author}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        marginBottom: 8,
                      }}
                    >
                      {item.publication_year || "N/A"} • {item.isbn}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        borderTop: "1px solid #374151",
                        paddingTop: 8,
                      }}
                    >
                      <span style={{ color: "#6b7280" }}>ID: {item.id}</span>
                      <span style={{ color: "#fbbf24", fontWeight: "bold" }}>
                        Kho: {item.available_copies}/{item.total_copies}
                      </span>
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />

            <Modal
        title={<span style={{ color: "#f3f4f6" }}>Thêm sách mới</span>}
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                centered
                destroyOnHidden
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreateBook}>
          <Form.Item
            name="title"
            label="Tiêu đề sách"
            rules={[{ required: true }]}
          >
                        <Input placeholder="Nhập tiêu đề" />
                    </Form.Item>
                    <Form.Item name="author" label="Tác giả" rules={[{ required: true }]}>
                        <Input placeholder="Nhập tên tác giả" />
                    </Form.Item>
          <Form.Item
            name="isbn"
            label="Mã ISBN"
            rules={[{ required: true, min: 10 }]}
          >
                        <Input placeholder="Ví dụ: 978-0132350884" />
                    </Form.Item>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="total_copies"
              label="Số lượng"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
            <Form.Item
              name="publication_year"
              label="Năm XB"
              style={{ flex: 1 }}
            >
              <InputNumber style={{ width: "100%" }} placeholder="YYYY" />
                        </Form.Item>
                    </div>
                    <Form.Item name="edition" label="Phiên bản (Tùy chọn)">
                        <Input placeholder="Ví dụ: Tái bản lần 1" />
                    </Form.Item>
          <Form.Item
            name="image"
            label="Ảnh bìa sách (Tùy chọn)"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              name="image"
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={confirmLoading}
            block
            style={{
              background: "#fbbf24",
              borderColor: "#fbbf24",
              color: "#1f2937",
              fontWeight: "bold",
            }}
          >
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
            <InputNumber type="number" min={1} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="publication_year" label="Năm XB">
            <InputNumber type="number" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="edition" label="Phiên bản">
                        <Input />
                    </Form.Item>
          <Form.Item
            name="image"
            label="Ảnh bìa sách (Tùy chọn)"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              name="image"
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={confirmLoading}
                        block
            style={{
              marginTop: 10,
              background: "#fbbf24",
              borderColor: "#fbbf24",
              color: "#1f2937",
              fontWeight: "bold",
            }}
                    >
                        Lưu thay đổi
                    </Button>
                </Form>
            </Modal>

            <Modal
        title={
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#f3f4f6" }}>
              Mượn sách
            </div>
            {selectedBook && (
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, fontWeight: 400 }}>
                {selectedBook.title} - {selectedBook.author}
              </div>
            )}
          </div>
        }
                open={isBorrowModalOpen}
        onCancel={() => {
          setIsBorrowModalOpen(false);
          borrowForm.resetFields();
        }}
                onOk={() => borrowForm.submit()}
                confirmLoading={confirmLoading}
                destroyOnHidden
        okText="Xác nhận mượn"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            background: "#fbbf24",
            borderColor: "#fbbf24",
            color: "#1f2937",
            fontWeight: "bold",
          },
        }}
        width={500}
      >
        {selectedBook && (
          <div style={{ marginBottom: 20, padding: 12, background: "#1f2937", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>Sách còn lại:</span>
              <span style={{ color: selectedBook.available_copies > 0 ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                {selectedBook.available_copies} / {selectedBook.total_copies}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>ISBN:</span>
              <span style={{ color: "#f3f4f6", fontSize: 12 }}>{selectedBook.isbn}</span>
            </div>
          </div>
        )}
        
        <Form
          form={borrowForm}
          layout="vertical"
          onFinish={handleBorrow}
          initialValues={{ days: 14 }}
        >
          <Form.Item
            name="memberId"
            label="Thành viên"
            rules={[
              { required: true, message: 'Vui lòng chọn thành viên!' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const member = members.find(m => m.id === parseInt(value));
                  if (!member) {
                    return Promise.reject(new Error('Thành viên không tồn tại!'));
                  }
                  if (!member.is_active) {
                    return Promise.reject(new Error('Thành viên này đã bị vô hiệu hóa!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select
              placeholder="Chọn thành viên"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={members
                .filter(member => member.is_active)
                .map(member => ({
                  value: member.id,
                  label: `${member.full_name} (${member.email})`
                }))}
              style={{ width: '100%' }}
              notFoundContent={members.length === 0 ? 'Đang tải...' : 'Không tìm thấy'}
            />
          </Form.Item>
          
          <Form.Item 
            name="days" 
            label="Số ngày mượn"
            rules={[
              { required: true, message: 'Vui lòng nhập số ngày mượn!' },
              { type: 'number', min: 1, message: 'Số ngày mượn tối thiểu là 1 ngày!' },
              { type: 'number', max: 30, message: 'Số ngày mượn tối đa là 30 ngày!' }
            ]}
          >
            <InputNumber 
              min={1} 
              max={30} 
              style={{ width: "100%" }} 
              placeholder="Nhập số ngày (1-30)"
            />
          </Form.Item>
          
          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.days !== currentValues.days}>
            {() => {
              const days = borrowForm.getFieldValue('days') || 14;
              const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
              
              return selectedBook && days > 0 ? (
                <div style={{ 
                  marginTop: 12, 
                  padding: 12, 
                  background: "#111827", 
                  borderRadius: 8,
                  border: "1px solid #374151"
                }}>
                  <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>
                    Thông tin mượn sách:
                  </div>
                  <div style={{ color: "#f3f4f6", fontSize: 13 }}>
                    <div style={{ marginBottom: 4 }}>
                      📅 Hạn trả dự kiến: <span style={{ color: "#fbbf24", fontWeight: "bold" }}>
                        {dueDate.toLocaleDateString('vi-VN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    {selectedBook.available_copies === 1 && (
                      <div style={{ color: "#fbbf24", fontSize: 11, marginTop: 4 }}>
                        ⚠️ Đây là cuốn sách cuối cùng còn lại!
                      </div>
                    )}
                  </div>
                </div>
              ) : null;
            }}
                    </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đặt trước sách"
        open={isReserveModalOpen}
        onCancel={() => setIsReserveModalOpen(false)}
        onOk={() => reserveForm.submit()}
        confirmLoading={confirmLoading}
        destroyOnHidden={true}
        okButtonProps={{
          style: {
            background: "#fbbf24",
            borderColor: "#fbbf24",
            color: "#1f2937",
          },
        }}
      >
         <Form form={reserveForm} layout="vertical" onFinish={handleReserve}>
           <Form.Item
             name="memberId"
             label="Thành viên"
             rules={[{ required: true, message: 'Vui lòng chọn thành viên!' }]}
           >
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
                </Form>
            </Modal>
        </div>
    );
};

export default BooksPage;
