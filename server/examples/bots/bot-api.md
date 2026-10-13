# Bot API

Các bot trong thư mục này chạy độc lập trong sandbox. Mỗi lượt, backend gửi
một snapshot JSON vào bot và đọc lại đúng một quyết định JSON. Bot không gọi
HTTP API; toàn bộ dữ liệu cần thiết đã có trong snapshot.

## Snapshot đầu vào

Ví dụ đầy đủ nằm trong [`snapshot.example.json`](./snapshot.example.json).

| Trường | Kiểu | Ý nghĩa |
| --- | --- | --- |
| `player` | `1` hoặc `2` | Người chơi mà bot điều khiển |
| `turn` | `1` hoặc `2` | Người chơi đang tới lượt |
| `version` | số nguyên | Phiên bản trạng thái hiện tại |
| `variantId` | chuỗi | Biến thể bàn cờ, ví dụ `classic-9x9` hoặc `classic-10x10` |
| `board` | object | Kích thước bàn gồm `rows` và `cols` |
| `goal` | tọa độ | Góc đích của người chơi hiện tại |
| `pieces` | mảng quân cờ | Toàn bộ quân còn trên bàn |
| `legalMoves` | mảng nước đi | Tất cả nước hợp lệ cho lượt này |

Mỗi quân trong `pieces` có `id`, `owner`, `type` và `position`. `position` gồm
`row` và `col`, đánh số từ 0. Mỗi phần tử `legalMoves` có `pieceId`, `from` và
`to`; mỗi tọa độ cũng gồm `row` và `col`. Dùng `goal` hoặc `board` thay vì
giả định bàn luôn là 9×9 để bot hoạt động trên nhiều biến thể.

## Điểm vào theo ngôn ngữ

| Ngôn ngữ | Hàm/chương trình bắt buộc | Đọc đầu vào | Trả quyết định |
| --- | --- | --- | --- |
| JavaScript | `export function getMove(state)` | Đối tượng JavaScript | Giá trị trả về của hàm |
| Python | `def get_move(state):` | Dictionary Python | Giá trị trả về của hàm |
| C | `int main(void)` | JSON từ stdin | JSON ghi ra stdout |

Quyết định hợp lệ có dạng:

```json
{
  "pieceId": "p1-0",
  "to": { "row": 2, "col": 1 }
}
```

Có thể trả trực tiếp một phần tử của `legalMoves`; engine chỉ sử dụng
`pieceId` và `to` rồi xác minh lại nước đi. Nếu `legalMoves` rỗng, trả `null`
trong JavaScript/Python hoặc ghi `null` trong C. Mọi nội dung ghi ra stdout
của bot C phải là JSON quyết định; không in log thông thường vào stdout.

## Ví dụ có thể nộp trực tiếp

- [`api.js`](./api.js)
- [`api.py`](./api.py)
- [`api.c`](./api.c)

Đây là các bot mẫu chọn nước hợp lệ đầu tiên. Ví dụ chiến thuật ưu tiên ăn quân
nằm trong [`tactical.js`](./tactical.js), [`tactical.py`](./tactical.py) và
[`tactical.c`](./tactical.c).

Giới hạn hiện tại: JavaScript/Python tối đa 64 KiB; C tối đa 16 KiB. Mỗi lượt
chạy trong Docker, không có mạng, có giới hạn thời gian, CPU, bộ nhớ và output.
