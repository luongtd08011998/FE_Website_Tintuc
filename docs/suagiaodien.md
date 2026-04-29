import { Clock } from 'lucide-react';

const posts = [
{
id: 1,
title: 'Bài viết nổi bật mới',
content: 'thong bao bai biet du lich',
datetime: '2026-04-29T09:40:59.697339'
},
{
id: 2,
title: 'Bài viết nổi bật mới',
content: 'dâsd',
datetime: '2026-04-29T08:27:16.267245'
},
{
id: 3,
title: 'Bài viết nổi bật mới',
content: 'dsadadsd',
datetime: '2026-04-26T16:20:03.277188'
}
];

function formatDateTime(datetime: string) {
const date = new Date(datetime);
const day = String(date.getDate()).padStart(2, '0');
const month = String(date.getMonth() + 1).padStart(2, '0');
const year = date.getFullYear();
const hours = String(date.getHours()).padStart(2, '0');
const minutes = String(date.getMinutes()).padStart(2, '0');

return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export default function App() {
return (

<div className="size-full bg-gray-50 p-6">
<div className="max-w-2xl mx-auto space-y-4">
{posts.map((post) => (
<div
            key={post.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
<div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
<Clock className="w-4 h-4" />
<span>{formatDateTime(post.datetime)}</span>
</div>

            <h3 className="text-gray-500 mb-2">
              {post.title}
            </h3>

            <p className="text-gray-900 mb-4">
              {post.content}
            </p>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>
    </div>

);
}
trong thông báo > menu cúp nước và nổi bật hãy sửa lại hiển thị của từng bài viết tương tự như giao diện code bên trên
