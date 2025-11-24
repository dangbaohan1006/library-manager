import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd'; 
import DashboardLayout from './layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import LoansPage from './pages/LoansPage';
import MembersPage from './pages/MembersPage';
import 'antd/dist/reset.css';

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#fbbf24',
            colorInfo: '#fbbf24',
            
            // background color
            colorBgBase: '#111827',
            colorBgContainer: '#1f2937',
            
            // Typography
            colorTextBase: '#f3f4f6',
            colorTextSecondary: '#9ca3af',
            
            // Shape
            borderRadius: 16,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
          components: {
            Layout: {
              bodyBg: '#111827',
              headerBg: '#111827',
              siderBg: '#111827',
            },
            Menu: {
              itemBg: 'transparent',
              itemColor: '#9ca3af',
              itemSelectedColor: '#fbbf24',
              itemSelectedBg: 'rgba(251, 191, 36, 0.1)',
              itemHoverColor: '#fbbf24',
              iconSize: 18,
              subMenuItemBg: 'transparent',
            },
            Card: {
              headerBg: 'transparent',
              borderless: true,
              boxShadow: 'none',
            },
            Table: {
              headerBg: '#1f2937',
              headerColor: '#fbbf24',
              rowHoverBg: '#374151',
            },
            Input: {
              colorBgContainer: '#1f2937',
              activeBorderColor: '#fbbf24',
              hoverBorderColor: '#fbbf24',
              borderRadius: 24, 
            },
            Button: {
              fontWeight: 600,
              defaultBorderColor: 'transparent',
              defaultBg: '#374151',
            },
            Tag: {
               borderRadius: 8,
            }
          }
        }}
      >
        <AntdApp>
            <DashboardLayout>
                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/books" element={<BooksPage />} />
                    <Route path="/loans" element={<LoansPage />} />
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </DashboardLayout>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;