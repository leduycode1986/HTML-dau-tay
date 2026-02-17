import React from 'react';
import { Helmet } from 'react-helmet';

function SEO({ title, description, image, url }) {
  // Cấu hình mặc định (Dùng khi không có thông tin chi tiết)
  const defaultTitle = "Thực Phẩm Mai Vàng - Tươi Ngon, Giá Rẻ";
  const defaultDesc = "Chuyên cung cấp thực phẩm Việt Nam tại Nhật Bản. Giao hàng nhanh chóng, giá cả hợp lý.";
  
  // Bạn thay link ảnh Logo của bạn vào dòng dưới đây (dùng link từ postimages hoặc link firebase)
  const defaultImg = "https://postimg.cc/MM3k4r5m"; 
  
  // Link gốc website
  const siteUrl = "https://html-dau-tay.vercel.app"; 

  // Xử lý link ảnh: Nếu ảnh sản phẩm rỗng thì dùng ảnh mặc định
  const metaImage = image || defaultImg;
  const metaTitle = title ? `${title} | MaiVang Shop` : defaultTitle;
  const metaDesc = description ? description.substring(0, 150) : defaultDesc; // Cắt ngắn mô tả tránh quá dài
  const metaUrl = url ? `${siteUrl}${url}` : window.location.href;

  return (
    <Helmet>
      {/* 1. Cấu hình cơ bản */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />

      {/* 2. Cấu hình cho Facebook (Open Graph) - QUAN TRỌNG */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} /> {/* Đây là dòng giúp hiện ảnh */}
      <meta property="og:image:alt" content={metaTitle} />
      <meta property="og:url" content={metaUrl} />
      
      {/* 3. Cấu hình cho Zalo (Zalo đôi khi cần ảnh kích thước nhỏ hơn) */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </Helmet>
  );
}

export default SEO;