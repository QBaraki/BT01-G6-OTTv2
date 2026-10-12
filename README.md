# OTTv2 — Oẳn Tù Tì Online

Game chiến thuật hai người trên bàn 9×9, viết bằng TypeScript, Vite, Vitest và playhtml.

## Chạy trên Ubuntu

Cần Node.js 20.19+ và npm:

```bash
npm install
npm run dev
```

Mở địa chỉ Vite in trong Terminal (thường là `http://localhost:5173`). Để chơi trên hai máy cùng mạng, **cả hai máy mở cùng địa chỉ Network** do Vite in ra, ví dụ `http://192.168.1.20:5173`; không dùng `localhost` trên một máy và IP trên máy kia. Không mở trực tiếp `dist/index.html` qua `file://`.

Kiểm tra bằng `npm run typecheck`, `npm run test`, `npm run build`. Vite chỉ phục vụ frontend; playhtml đồng bộ dữ liệu qua hạ tầng PartyKit theo [tài liệu chính thức](https://playhtml.fun/docs/).

## Phòng chơi

Trang chủ hiển thị danh sách phòng đang có. Nhập tên, chọn **Tạo phòng mới** để nhận mã ngẫu nhiên; chia sẻ mã hoặc link cho người thứ hai. Có thể nhập mã hay bấm **Vào phòng** từ danh sách. Hai người nhấn **Tôi đã sẵn sàng** để bắt đầu. Người thứ ba chỉ xem.

Mỗi phòng có kênh game riêng trong playhtml; danh sách phòng dùng một kênh chung. Khi trận đã kết thúc và số người chơi đang online giảm xuống dưới hai, phòng bị xóa khỏi danh sách và không thể tham gia bằng mã cũ. Nếu tất cả đóng tab, phòng sẽ được dọn khi có người khác mở trang. Nút **Rời phòng** giải phóng vị trí ngay. Dữ liệu kênh game cũ có thể vẫn còn trong hạ tầng playhtml; mã phòng đã xóa không còn trỏ tới kênh đó.

Mỗi lần chạy `npm run dev` dùng một phiên lobby mới; các máy phải dùng cùng một Vite server để nhìn thấy cùng danh sách. Bản production dùng phiên được tạo lúc `npm run build`.

## Luật

Mỗi bên có 3 ✊, 3 ✋, 3 ✌️. Player 1 ở a2:c4, Player 2 ở g6:i8. Đi đúng một ô theo tám hướng; ✊ ăn ✌️, ✌️ ăn ✋, ✋ ăn ✊. Cùng loại chặn nhau. Loại hết một loại quân đối phương hoặc tới i9 (Player 1), a1 (Player 2) để thắng. Không còn nước đi là hòa. Trận đầu Player 1 đi trước; chơi lại đổi người đi trước.

```mermaid
flowchart LR
P1[Player 1] --> PH[playhtml / PartyKit] --> P2[Player 2]
```

```mermaid
flowchart LR
A[Click quân] --> B[Chọn ô] --> C[Validate] --> D[Update state] --> E[Synchronize] --> F[Render] --> G[Check victory]
```

## Kiến trúc và triển khai

`src/game/engine.ts` chứa luật thuần; `src/multiplayer/room.ts` quản lý danh sách phòng, kênh game và presence; `src/main.ts` hiển thị UI. Build bằng `npm run build`, đưa `dist/` lên Vercel hoặc Netlify. Muốn chơi qua Internet, cả hai dùng cùng URL HTTPS sau khi triển khai.

## Kiểm thử multiplayer

Mở hai browser profile hoặc hai máy cùng địa chỉ Network. Tạo phòng, tham gia bằng mã, kiểm tra danh sách, trạng thái sẵn sàng, lượt, ăn quân, kết quả, chơi lại và rời phòng. Sau khi một người rời trận đã kết thúc, kiểm tra phòng biến mất và mã cũ không tham gia được. Những bước thủ công này chưa được đánh dấu đã kiểm thử nếu chưa chạy trên thiết bị thật.

## Hạn chế

playhtml không cung cấp transaction hay quyền điều khiển game trên server. Luật và phiên bản lượt được kiểm tra ở client, nên client bị sửa hoặc thao tác đồng thời vẫn có thể gây sai lệch. Presence có thể báo offline trễ. Để chống gian lận và bảo đảm xử lý đồng thời, hướng phát triển là bổ sung server authoritative. Danh sách và các kênh game dùng chung một kết nối playhtml, nên chưa phù hợp với số lượng phòng rất lớn.

# BOT ARENA – HƯỚNG DẪN SỬ DỤNG

## 1. Giới thiệu

Bot Arena là chế độ mở rộng của game OTTv2, cho phép người chơi viết bot bằng JavaScript và cho hai bot tự động thi đấu với nhau.

Các chức năng chính:

- Nộp script JavaScript.
- Kiểm tra cú pháp và phát hiện một số đoạn mã có nguy cơ gây hại.
- Chạy script trong môi trường Docker Sandbox.
- Tổ chức trận đấu Bot vs Bot.
- Hiển thị người thắng, lịch sử nước đi và phát lại trận đấu trên bàn cờ 9×9.
- Lưu log kiểm tra script và trận đấu.

## 2. Cài đặt và khởi động

Yêu cầu: Node.js, npm và Docker Desktop.

Mở Terminal trong thư mục dự án, chạy:

```bash
npm install
docker pull node:22-alpine
npm run dev:all
```

Truy cập địa chỉ Vite hiển thị, thường là http://localhost:5173.

Lưu ý: Docker Desktop phải đang hoạt động.

## 3. Cách sử dụng Bot Arena

1. Mở game và chọn chế độ **Bot Arena**.
2. Nhập tên bot và tải lên hoặc dán script JavaScript.
3. Gửi script để hệ thống kiểm tra.
4. Nếu kết quả là `PASSED`, bot có thể được chọn để thi đấu.
5. Chọn Bot A và Bot B, sau đó nhấn **Bắt đầu trận đấu**.
6. Xem kết quả thắng/thua và sử dụng các nút điều khiển để phát lại trận đấu.

## 4. Ví dụ script bot

Bot phải cung cấp hàm `getMove(state)` để lựa chọn nước đi.

```javascript
export function getMove(state) {
  const moves = state.legalMoves;

  if (moves.length === 0) return null;

  return moves[0];
}
```

Script trên luôn chọn nước đi hợp lệ đầu tiên.

## 5. Kiểm tra bảo mật

Hệ thống phân tích script trước khi cho phép sử dụng.

- `PASSED`: Vượt qua các bước kiểm tra.
- `REJECTED`: Script không hợp lệ hoặc chứa thao tác bị hạn chế.
- `FORFEIT`: Bot bị xử thua khi thi đấu do lỗi thực thi hoặc nước đi không hợp lệ.

Lưu ý: Kiểm tra tĩnh không đảm bảo phát hiện mọi mã độc. Script được thực thi trong môi trường Docker cách ly.

## 6. Lỗi thường gặp

- Không mở được game: Kiểm tra `npm run dev:all`.
- Không nộp được script: Kiểm tra backend ở cổng 4174.
- Bot không thi đấu được: Kiểm tra Docker Desktop.
- Script bị từ chối: Xem thông báo lỗi và sửa lại mã nguồn.

## 7. Hạn chế hiện tại

- Chỉ hỗ trợ bot viết bằng JavaScript.
- Trận đấu được xử lý trước khi hiển thị replay.
- Hệ thống hiện phù hợp để thử nghiệm cục bộ, chưa sẵn sàng triển khai công khai.
