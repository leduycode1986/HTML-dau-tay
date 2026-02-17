import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';

function ShareButtons({ title, url }) {
  const shareUrl = url || window.location.href; 
  const shareTitle = title || document.title;

  const openShareWin = (platformUrl) => {
     window.open(platformUrl, 'Share', 'width=600,height=400,location=no,toolbar=no,menubar=no');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Đã sao chép liên kết!");
    }, () => {
        toast.error("Lỗi sao chép.");
    });
  };

  return (
    <div className="share-buttons-container d-flex align-items-center gap-2 mt-4 pt-3 border-top">
      <span className="small text-muted fw-bold me-2">Chia sẻ:</span>
      
      {/* Facebook - Sửa thành icon chuẩn 'fa-facebook' và dùng 'fab' */}
      <OverlayTrigger placement="top" overlay={<Tooltip>Facebook</Tooltip>}>
        <Button variant="outline-primary" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width:36, height:36, borderColor:'#1877F2', color:'#1877F2'}} onClick={()=>openShareWin(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}>
            <i className="fab fa-facebook" style={{fontSize: '18px'}}></i>
        </Button>
      </OverlayTrigger>

      {/* Twitter - Sửa thành icon chuẩn 'fa-twitter' và dùng 'fab' */}
      <OverlayTrigger placement="top" overlay={<Tooltip>Twitter</Tooltip>}>
        <Button variant="outline-info" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width:36, height:36, borderColor:'#1DA1F2', color:'#1DA1F2'}} onClick={()=>openShareWin(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`)}>
            <i className="fab fa-twitter" style={{fontSize: '18px'}}></i>
        </Button>
      </OverlayTrigger>

      {/* Copy Link */}
      <OverlayTrigger placement="top" overlay={<Tooltip>Sao chép Link</Tooltip>}>
        <Button variant="outline-secondary" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width:36, height:36}} onClick={handleCopyLink}>
            <i className="fa-solid fa-link" style={{fontSize: '16px'}}></i>
        </Button>
      </OverlayTrigger>
    </div>
  );
}
export default ShareButtons;