import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import './KnowledgeBase.css'

function MIcon({ name, className = '', filled = false, size = 24 }) {
    return (
        <span
            className={`material-symbols-rounded ${className}`}
            style={{
                fontSize: size,
                fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
            }}
        >
            {name}
        </span>
    )
}

const mockKnowledgeItems = [
    {
        id: 1,
        name: 'Thông tin tuyến xe',
        type: 'folder',
        items: 12,
        updatedAt: '2 giờ trước',
        description: 'Danh sách các tuyến xe, lịch trình và giá vé',
    },
    {
        id: 2,
        name: 'Chính sách đổi/trả vé',
        type: 'document',
        size: '2.4 MB',
        updatedAt: '1 ngày trước',
        description: 'Quy định về đổi trả vé, hoàn tiền và bồi thường',
    },
    {
        id: 3,
        name: 'FAQ khách hàng',
        type: 'document',
        size: '1.1 MB',
        updatedAt: '3 ngày trước',
        description: 'Các câu hỏi thường gặp và câu trả lời mẫu',
    },
    {
        id: 4,
        name: 'Hướng dẫn sử dụng app',
        type: 'folder',
        items: 8,
        updatedAt: '5 ngày trước',
        description: 'Tài liệu hướng dẫn sử dụng ứng dụng đặt vé',
    },
    {
        id: 5,
        name: 'Kịch bản xử lý khiếu nại',
        type: 'document',
        size: '3.2 MB',
        updatedAt: '1 tuần trước',
        description: 'Các kịch bản và quy trình xử lý khiếu nại của khách hàng',
    },
    {
        id: 6,
        name: 'Danh sách nhà xe đối tác',
        type: 'document',
        size: '890 KB',
        updatedAt: '2 tuần trước',
        description: 'Thông tin liên hệ và hợp đồng với các nhà xe đối tác',
    },
]

export default function KnowledgeBase() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const filteredItems = mockKnowledgeItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' ||
            (selectedCategory === 'folder' && item.type === 'folder') ||
            (selectedCategory === 'document' && item.type === 'document')
        return matchesSearch && matchesCategory
    })

    return (
        <DashboardLayout>
            <div className="knowledge-page">
                <div className="knowledge-header">
                    <div className="knowledge-header-left">
                        <h1>Kho tri thức</h1>
                        <p className="knowledge-subtitle">Quản lý tài liệu và dữ liệu huấn luyện cho AI Agent</p>
                    </div>
                    <div className="knowledge-header-actions">
                        <button className="btn-upload">
                            <MIcon name="upload" size={20} />
                            Tải lên
                        </button>
                        <button className="btn-create">
                            <MIcon name="add" size={20} />
                            Tạo mới
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="knowledge-stats">
                    <div className="knowledge-stat-card">
                        <div className="knowledge-stat-number">6</div>
                        <div className="knowledge-stat-label">Tài liệu</div>
                    </div>
                    <div className="knowledge-stat-card">
                        <div className="knowledge-stat-number">20</div>
                        <div className="knowledge-stat-label">Tổng mục</div>
                    </div>
                    <div className="knowledge-stat-card">
                        <div className="knowledge-stat-number">7.5 MB</div>
                        <div className="knowledge-stat-label">Dung lượng</div>
                    </div>
                    <div className="knowledge-stat-card">
                        <div className="knowledge-stat-number">98%</div>
                        <div className="knowledge-stat-label">Độ phủ</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="knowledge-toolbar">
                    <div className="knowledge-search">
                        <MIcon name="search" size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài liệu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="knowledge-filters">
                        <button
                            className={`knowledge-filter ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            Tất cả
                        </button>
                        <button
                            className={`knowledge-filter ${selectedCategory === 'folder' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('folder')}
                        >
                            Thư mục
                        </button>
                        <button
                            className={`knowledge-filter ${selectedCategory === 'document' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('document')}
                        >
                            Tài liệu
                        </button>
                    </div>
                </div>

                {/* Knowledge Grid */}
                <div className="knowledge-grid">
                    {filteredItems.map(item => (
                        <div key={item.id} className="knowledge-card">
                            <div className={`knowledge-card-icon ${item.type}`}>
                                <MIcon
                                    name={item.type === 'folder' ? 'folder' : 'description'}
                                    size={28}
                                    filled
                                />
                            </div>
                            <div className="knowledge-card-content">
                                <h3 className="knowledge-card-title">{item.name}</h3>
                                <p className="knowledge-card-desc">{item.description}</p>
                                <div className="knowledge-card-meta">
                                    <span className="knowledge-card-info">
                                        {item.type === 'folder' ? `${item.items} mục` : item.size}
                                    </span>
                                    <span className="knowledge-card-time">{item.updatedAt}</span>
                                </div>
                            </div>
                            <div className="knowledge-card-actions">
                                <button className="card-action-btn" title="Tải xuống">
                                    <MIcon name="download" size={18} />
                                </button>
                                <button className="card-action-btn" title="Sao chép">
                                    <MIcon name="content_copy" size={18} />
                                </button>
                                <button className="card-action-btn delete" title="Xóa">
                                    <MIcon name="delete" size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upload Drop Zone */}
                <div className="knowledge-dropzone">
                    <MIcon name="cloud_upload" size={48} className="dropzone-icon" />
                    <h3>Kéo thả tài liệu vào đây</h3>
                    <p>Hỗ trợ: PDF, DOCX, TXT, CSV, JSON (tối đa 50MB)</p>
                </div>
            </div>
        </DashboardLayout>
    )
}
