import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import {
  DrawCustomBoard,
  createJsonUrlAdapter,
  createLocalStorageAdapter,
  downloadDocument,
  type DrawCustomApi,
  type ShareConfig,
} from './lib';
import { LAUNCH, buildShareUrl, getAppBaseUrl } from './utils/launch';
import { readPinSlugFromHash } from './utils/pins';

const BOARD_URL_KEY = 'drawcustom.share.boardUrl';

/**
 * The standalone DrawCustom app: one full-screen board stored in this browser,
 * or a published JSON board opened read-only via ?board=<url>.
 * It is just a host of <DrawCustomBoard>, like any other site embedding the library.
 */
export const App: React.FC = () => {
  const mode = LAUNCH.embed ? 'embed' : LAUNCH.readOnly ? 'viewer' : 'editor';
  const adapter = useMemo(
    () => (LAUNCH.boardUrl ? createJsonUrlAdapter(LAUNCH.boardUrl) : createLocalStorageAdapter()),
    []
  );
  const apiRef = useRef<DrawCustomApi | null>(null);
  const [boardUrl, setBoardUrl] = useState(() => {
    if (LAUNCH.boardUrl) return LAUNCH.boardUrl;
    try {
      return window.localStorage.getItem(BOARD_URL_KEY) ?? '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (LAUNCH.boardUrl) return;
    try {
      window.localStorage.setItem(BOARD_URL_KEY, boardUrl);
    } catch {
      // ignore
    }
  }, [boardUrl]);

  // Changing #pin=<slug> on an open page flies there
  useEffect(() => {
    const onHash = () => {
      const slug = readPinSlugFromHash(window.location.hash);
      if (slug) apiRef.current?.flyToPin(slug);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const share = useMemo<ShareConfig>(() => {
    const cleanBoardUrl = boardUrl.trim() || null;
    const isLocalhost = /^(localhost|127\.|0\.0\.0\.0)/.test(window.location.hostname);
    return {
      buildUrl: (target, { embed }) =>
        buildShareUrl({ baseUrl: getAppBaseUrl(), boardUrl: cleanBoardUrl, embed, ...target }),
      settings: (
        <>
          <label className="share-field">
            <span className="panel-label">URL file board (JSON) đã đăng</span>
            <input
              value={boardUrl}
              readOnly={Boolean(LAUNCH.boardUrl)}
              onChange={(e) => setBoardUrl(e.target.value)}
              placeholder="https://…/my-board.json"
            />
          </label>
          {!LAUNCH.boardUrl && (
            <button
              type="button"
              className="share-secondary-btn"
              onClick={() => {
                const snap = apiRef.current?.getSnapshot();
                if (snap) {
                  downloadDocument(
                    {
                      version: 1,
                      shapes: snap.shapes,
                      shapeOrder: snap.shapeOrder,
                      camera: snap.camera ?? { x: 0, y: 0, zoom: 1 },
                    },
                    'drawcustom-board.json'
                  );
                }
              }}
            >
              <Download size={14} /> Tải file board JSON để đăng lên host
            </button>
          )}
          {(!cleanBoardUrl || isLocalhost) && (
            <div className="share-warning">
              <AlertTriangle size={15} />
              <div>
                {!cleanBoardUrl && (
                  <p>
                    Chưa có URL board: link chỉ mở đúng <b>trên trình duyệt này</b> vì dữ liệu
                    đang lưu cục bộ. Để người ngoài xem được, tải file board lên host có bật CORS
                    (vd GitHub Gist raw, S3, server blog) rồi dán URL vào ô trên.
                  </p>
                )}
                {isLocalhost && (
                  <p>
                    App đang chạy ở <b>{window.location.host}</b> — người ngoài không truy cập
                    được. Cần deploy app (thư mục <code>dist</code>) lên một domain trước khi nhúng.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      ),
    };
  }, [boardUrl]);

  const onReady = useCallback((api: DrawCustomApi) => {
    apiRef.current = api;
  }, []);

  const initialTarget = useMemo(() => ({ pinSlug: LAUNCH.pinSlug, at: LAUNCH.at }), []);

  return (
    <DrawCustomBoard
      adapter={adapter}
      mode={mode}
      keyboard="global"
      share={share}
      initialTarget={initialTarget}
      onReady={onReady}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

export default App;
