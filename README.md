# DrawCustom

Bảng vẽ vô hạn cho React, có **pin đặt tên** (ID cố định, tìm kiếm, link/nhúng) và **tầng lưu trữ thay được** (adapter).
Dùng được theo hai cách:

- **Ứng dụng độc lập** — `npm run dev` / `npm run build`. Dữ liệu chỉ nằm trong trình duyệt người dùng (localStorage).
- **Thư viện nhúng** vào dự án khác — `npm run pack:lib` tạo `drawcustom-<version>.tgz`.

## Cài vào dự án khác

```bash
# trong thư mục DrawCustom
npm run pack:lib                       # → drawcustom-0.1.0.tgz

# trong dự án host (copy file .tgz vào, vd vendor/)
npm install ./vendor/drawcustom-0.1.0.tgz
```

Yêu cầu: React ≥ 18.2. `@reduxjs/toolkit`, `react-redux`, `lucide-react` được cài kèm.

```jsx
import { useMemo } from 'react';
import { DrawCustomBoard, createLocalStorageAdapter } from 'drawcustom';
import 'drawcustom/style.css';

export function MyBoard() {
  const adapter = useMemo(() => createLocalStorageAdapter({ key: 'my-board' }), []);
  return (
    <div style={{ height: 600 }}>
      <DrawCustomBoard adapter={adapter} />
    </div>
  );
}
```

Bảng chiếm 100% khung chứa — hãy đặt chiều cao cho khung. Mọi CSS nằm dưới `.dc-root`, không ảnh hưởng trang host.
Khi khung hẹp hơn 768px, bảng tự chuyển giao diện gọn (theo bề rộng **khung**, không theo cửa sổ).

## Props chính của `<DrawCustomBoard>`

| Prop | Ý nghĩa |
|---|---|
| `adapter` | **Bắt buộc.** Nơi lưu dữ liệu (xem dưới). Giữ ổn định bằng `useMemo` — adapter mới = tải lại bảng. |
| `mode` | `'editor'` (mặc định) · `'viewer'` chỉ xem · `'embed'` chỉ xem, giao diện tối giản cho iframe. |
| `user` | `{ id, name, isAdmin? }` — người đang vẽ, dùng làm chủ pin. Mặc định: khách ẩn danh nhớ theo trình duyệt. |
| `initialTarget` | `{ pinSlug }` bay tới pin · `{ at: { center, zoom } }` · `fit` vừa toàn bộ nội dung. |
| `keyboard` | `'focus'` (mặc định): phím tắt chỉ chạy sau khi người dùng bấm vào bảng — đúng cho bảng nằm trong trang. `'global'`: luôn chạy (app toàn màn hình). |
| `features` | `{ fileMenu, clearCanvas, pinSearch, brand }` bật/tắt từng phần giao diện. |
| `share` | `{ buildUrl(target, { embed }), settings? }` — bật hộp thoại chia sẻ; host quyết định link trông thế nào. |
| `onPinOpen(pin)` | Người xem mở một pin (bấm pin ở chế độ xem, chọn kết quả tìm kiếm). |
| `onReady(api)` | Nhận API: `flyToPin(slug)`, `flyTo(center, zoom)`, `fitContent()`, `searchPins(q)`, `getSnapshot()`, `flush()`. |
| `onError(e)` | Lỗi tải / lưu từ adapter. |

## Adapter — tự quyết định dữ liệu nằm ở đâu

DrawCustom không tự gọi backend nào. Có sẵn:

- `createLocalStorageAdapter({ key })` — lưu cục bộ trong trình duyệt.
- `createJsonUrlAdapter(url)` — đọc một file board JSON đã đăng (chỉ xem).
- `createMemoryAdapter(initial)` — trong bộ nhớ (test, demo).

Tự viết adapter cho backend của bạn (Firebase, API riêng…):

```ts
interface BoardAdapter {
  load(): Promise<BoardSnapshot>;                         // bắt buộc
  save?(changes: BoardChanges, full: BoardSnapshot): Promise<void>; // không có = chỉ xem
  subscribe?(onRemote: (changes: BoardChanges) => void): () => void; // realtime
  saveCamera?(camera): void;                              // nhớ vị trí xem (chỉ adapter cục bộ)
}

interface BoardChanges {
  upserts: CanvasShape[];   // shape mới / đã sửa
  deletes: string[];        // id shape đã xoá
  order?: string[];         // thứ tự lớp đầy đủ — chỉ khi thay đổi
}
```

- `save` được gọi **gom lại (debounce ~400ms) và chỉ chứa phần thay đổi**, nên có thể ghi mỗi shape thành một bản ghi riêng.
  Adapter đơn giản thì bỏ qua `changes` và ghi nguyên `full`.
- Thay đổi nhận qua `subscribe` không bị gửi ngược lại `save` (không có vòng ghi qua lại).

## Pin

Mỗi pin có `slug` (khoá chính: duy nhất, chỉ `a-z0-9-`, **không đổi sau khi tạo** — dùng cho link/nhúng),
`title` (tên hiển thị dạng `#tên`, đổi tự do), `createdBy`, `createdAt`.
Lưu ý: tính duy nhất của `slug` hiện được đảm bảo **trong một bảng trên một máy**. Với bảng nhiều người dùng chung,
backend nên đảm bảo (vd dùng `slug` làm ID bản ghi và tạo trong transaction).

## Vẽ lên ảnh (`<DrawCustomAnnotator>`)

Vẽ mũi tên, chữ, khoanh vùng lên một bức ảnh. Ảnh được ghim cố định, nét vẽ được phép tràn ra ngoài ảnh.
Component lấp đầy khung chứa; host tự quyết định hiển thị dạng modal toàn màn hình, panel...

```jsx
import { DrawCustomAnnotator } from 'drawcustom';

<div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
  <DrawCustomAnnotator
    image={{ src: dataUrl, width: 1000, height: 1000 * naturalHeight / naturalWidth }}
    initial={saved?.snapshot}          // để sửa lại lần trước
    onCancel={close}
    onDone={(result) => {              // null = đã xoá hết nét
      // result.svgDataUrl  → <img src> đặt đè lên ảnh
      // result.bounds      → vị trí, theo đơn vị của image.width/height (ở đây: 1/1000 bề rộng ảnh)
      // result.snapshot    → lưu lại để sửa lần sau (JSON)
    }}
  />
</div>
```

- `image.width/height` quy định hệ toạ độ của `bounds`. Truyền `width: 1000` thì `bounds.x / 1000` là tỉ lệ theo bề rộng ảnh,
  nên lớp chú thích co giãn đúng theo ảnh ở mọi kích thước màn hình.
- Mặc định: nét đỏ, dày; tắt pin, chèn ảnh, menu file (đổi bằng `defaultStyle`, `features`).
- SVG xuất ra không nhúng font chữ: khi hiển thị qua `<img>`, chữ dùng font dự phòng của hệ thống.

Bảng thường cũng xuất được SVG qua `onReady(api) → api.exportSvg()`, và nhận ảnh nền qua prop `background`.

## Nhóm & khoá

- **Mặc định ai cũng vẽ và sửa được mọi thứ.**
- Mỗi shape (kể cả pin) có `ownerId` = người tạo (lấy từ prop `user`).
- **Gom nhóm** (Ctrl+G) / **rã nhóm** (Ctrl+Shift+G): các shape trong nhóm được chọn và kéo cùng nhau.
- **Khoá** (Ctrl+Shift+L, hoặc nút ổ khoá ở bảng bên phải): chỉ người tạo hoặc admin (`user.isAdmin`) khoá / mở khoá được.
  Shape đã khoá thì người khác chỉ xem: không chọn, kéo, sửa, tẩy, xoá được — kể cả bằng nút "Xoá toàn bộ bảng".
- Shape cũ chưa có chủ: ai khoá đầu tiên sẽ thành chủ.

Quy tắc nằm trong `canEdit(shape, user)` và `canLock(shape, user)` (được export). Thư viện chỉ chặn ở phía giao diện —
**backend dùng chung phải tự kiểm tra lại** (vd Firestore rules: chỉ cho sửa shape có `locked == true` khi `ownerId == request.auth.uid`).

## Undo / redo khi nhiều người cùng vẽ

Undo chỉ hoàn tác thao tác **của chính bạn**, và chỉ những shape vẫn còn đúng như lúc bạn sửa xong:
shape người khác thêm, sửa hay khoá sau đó được giữ nguyên. Một lần kéo / gõ chữ = một bước undo.

## Phát triển

```bash
npm run dev        # ứng dụng độc lập
npm test           # vitest
npm run build      # build ứng dụng độc lập → dist/
npm run build:lib  # build thư viện → dist-lib/
```

## Giấy phép & bản quyền

Copyright © 2026 **Duc Ngo** ([@kenngo81](https://github.com/kenngo81)). Mã nguồn gốc: https://github.com/kenngo81/drawcustom

DrawCustom được phát hành theo giấy phép **[GNU AGPL-3.0](LICENSE)**. Bạn được tự do dùng, sửa và phân phối lại,
kể cả cho mục đích thương mại, với điều kiện:

- Giữ nguyên thông báo bản quyền, file [`LICENSE`](LICENSE) và [`NOTICE`](NOTICE), ghi rõ tác giả gốc.
- Mọi bản phân phối lại hoặc bản sửa đổi, **kể cả khi chỉ chạy trên web/server cho người khác dùng**,
  phải công khai toàn bộ mã nguồn theo cùng giấy phép AGPL-3.0.
- Không được đóng thành phần mềm mã nguồn đóng hay tự nhận là tác giả.

Cần dùng theo điều khoản khác (ví dụ tích hợp vào sản phẩm mã nguồn đóng)? Hãy liên hệ tác giả để thoả thuận giấy phép thương mại.
