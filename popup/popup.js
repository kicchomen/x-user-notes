const _ = chrome.i18n.getMessage

const export_elm = document.querySelector('.function.export')
const import_elm = document.querySelector('.function.import')
console.info(_('exportData'))
export_elm.innerText = _('exportData')
import_elm.innerText = _('importData')
export_elm.addEventListener('click', exportData)
import_elm.addEventListener('click', importData)

/** 
 * 全ユーザデータを json ファイルとしてダウンロード
 */
async function exportData(tab) {
  const data = await chrome.storage.local.get();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const reader = new FileReader();
  reader.onload = function(event) {
    const url = event.target.result
    chrome.downloads.download({
      url: url,
      filename: 'scribble.json',
      saveAs: true
    });
  }
  reader.readAsDataURL(blob); 
}

// ファイル選択ダイアログを表示して JSON ファイルからデータを復元する関数
async function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const jsonData = JSON.parse(e.target.result);

        // 正常に取り込めることを確認
        await chrome.storage.local.set(jsonData);
        // ストレージを初期化
        await chrome.storage.local.clear();
        // 正式に取り込む
        await chrome.storage.local.set(jsonData);

        alert('データのインポートが完了しました');
      };
      reader.readAsText(file);
    }
  };
  input.click();
}
