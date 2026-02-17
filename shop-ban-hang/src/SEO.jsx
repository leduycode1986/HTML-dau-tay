import React from 'react';
import { Helmet } from 'react-helmet';

function SEO({ title, description, image, url }) {
  // Cấu hình mặc định (khi không truyền gì vào)
  const defaultTitle = "Thực Phẩm Mai Vàng - Tươi Ngon, Giá Rẻ";
  const defaultDesc = "Chuyên cung cấp thực phẩm Việt Nam tại Nhật Bản. Giao hàng nhanh chóng, giá cả hợp lý.";
  
  // Bạn thay link ảnh logo hoặc banner mặc định của shop vào đây nhé
  const defaultImg = "https://postimg.cc/MM3k4r5m"; 
  
  const siteUrl = "https://html-dau-tay.vercel.app"; // Link web của bạn

  return (
    <Helmet>
      {/* 1. Cấu hình cơ bản cho Google */}
      <title>{title ? `${title} | Mai Vang Shop` : defaultTitle}</title>
      <meta name="description" content={description || defaultDesc} />

      {/* 2. Cấu hình cho Facebook / Zalo (Open Graph) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title ? `${title} | Mai Vang Shop` : defaultTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={image || defaultImg} />
      <meta property="og:url" content={url ? `${siteUrl}${url}` : window.location.href} />
      
      {/* 3. Cấu hình cho Twitter (X) - Tùy chọn */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={image || defaultImg} />
    </Helmet>
  );
}

export default SEO;