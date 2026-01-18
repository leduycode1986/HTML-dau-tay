import React, { useEffect } from 'react';

// Đây là công cụ SEO tự chế: Nhẹ, Nhanh, Không lỗi
const SEO = ({ title, description }) => {
  useEffect(() => {
    // 1. Thay đổi tiêu đề tab trình duyệt
    document.title = title ? `${title} | MaiVang Shop` : 'MaiVang Shop - Thực Phẩm Sạch';
    
    // 2. Thay đổi mô tả (Meta Description) cho Google đọc
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || 'Chuyên cung cấp thực phẩm sạch, tươi ngon.');
    }
  }, [title, description]);

  return null; // Không vẽ gì ra màn hình cả, chỉ chạy ngầm
};

export default SEO;