import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';

function ShareButtons({ title, url }) {
  const shareUrl = url || window.location.href; // Lấy link hiện tại nếu không truyền vào
  const shareTitle = title || document.title;

  // Hàm mở cửa sổ chia sẻ popup
  const openShareWin = (platformUrl) => {
     window.open(platformUrl, 'Share', 'width=600,height=400,location=no,toolbar=no,menubar=no');
  };

  // Hàm sao chép liên kết (cho Zalo,...)
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
    }, () => {
        toast.error("Không thể sao chép liên kết.");
    });
  };

  return (
    <div className="share-buttons-container d-flex align-items-center gap-2 mt-4 pt-3 border-top">
      <span className="small text-muted fw-bold me-2">Chia sẻ:</span>
      
      {/* Facebook */}
      <OverlayTrigger placement="top" overlay={<Tooltip>Chia sẻ lên Facebook</Tooltip>}>
        <Button variant="outline-primary" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width:36, height:36, borderColor:'#1877F2', color:'#1877F2'}} onClick={()=>openShareWin(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}>
            <i className="fa-brands fa-facebook-f fs-6"></i>
        </Button>
      </OverlayTrigger>

      {/* Twitter (X) */}
      <OverlayTrigger placement="top" overlay={<Tooltip>Chia sẻ lên X (Twitter)</Tooltip>}>
        <Button variant="outline-dark" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width:36, height:36}} onClick={()=>openShareWin(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`)}>
            <i className="fa-brands fa-x-twitter fs-6"></i>
        </Button>
      </OverlayTrigger>

      {/* Nút Copy Link (Dùng cho Zalo, Messenger...) */}
      <OverlayTrigger placement="top" overlay={<Tooltip>Sao chép liên kết</Tooltip>}>
        <Button variant="outline-secondary" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width:36, height:36}} onClick={handleCopyLink}>
            <i className="fa-solid fa-link fs-6"></i>
        </Button>
      </OverlayTrigger>
    </div>
  );
}
export default ShareButtons;