/**
 * @OnlyCurrentDoc
 *
 * 上記のコメントは Apps Script に認可の範囲を限定するように指示しますが、
 * 最終的な権限はマニフェストファイル (`appsscript.json`) によって定義されます。
 */

/**
 * WebアプリのHTMLを提供します。
 * @returns {HtmlOutput} レンダリングされるHTML出力。
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index.html')
      .setTitle('Googleカレンダー 会議URL編集ツール');
}

/**
 * Googleカレンダーのイベントの会議情報を更新します。
 * この関数はクライアントサイドのスクリプトから呼び出されることを想定しています。
 *
 * @param {string} calendarId カレンダーのID。
 * @param {string} eventId イベントのID。
 * @param {string} newUri ビデオ会議の新しいURI。
 * @returns {object} 成功ステータスとメッセージを含む結果オブジェクト。
 */
function updateConferenceData(calendarId, eventId, newUri) {
  // 入力を検証
  if (!calendarId || !eventId || !newUri) {
    return { success: false, message: 'カレンダーID、イベントID、新しいURIは必須です。' };
  }

  try {
    // 1. Calendar上級サービスを使用してイベントを取得します。
    // これには、Apps Scriptプロジェクトと関連するGoogle Cloud Platformプロジェクトの両方で
    // Calendar APIが有効になっている必要があります。
    const event = Calendar.Events.get(calendarId, eventId);

    // 2. conferenceDataとentryPointsが存在するか確認します。
    if (!event.conferenceData || !event.conferenceData.entryPoints || event.conferenceData.entryPoints.length === 0) {
      return { success: false, message: 'このイベントには編集可能なビデオ会議情報がありません。' };
    }

    // 3. 最初の 'video' エントリーポイントを見つけて、そのURIを更新します。
    let updated = false;
    for (let i = 0; i < event.conferenceData.entryPoints.length; i++) {
      if (event.conferenceData.entryPoints[i].entryPointType === 'video') {
        event.conferenceData.entryPoints[i].uri = newUri;
        updated = true;
        break; // 最初のものを更新した後に停止します。
      }
    }

    if (!updated) {
        return { success: false, message: '更新対象のビデオ会議情報 (entryPointType="video") が見つかりませんでした。' };
    }

    // 4. patchリクエストのリソースを作成します。更新するフィールドのみを含む必要があります。
    const resource = {
      conferenceData: event.conferenceData
    };

    // 5. イベントにパッチを適用します。
    // conferenceDataVersion: 1 は、Google Meetが会議情報を自動更新するのを防ぐために必要です。
    Calendar.Events.patch(resource, calendarId, eventId, {
      conferenceDataVersion: 1
    });

    return { success: true, message: '会議情報を正常に更新しました。' };

  } catch (e) {
    // デバッグ用にエラーをログに記録し、ユーザーフレンドリーなメッセージを返します。
    console.error('Error in updateConferenceData: ' + e.toString() + ' Stack: ' + e.stack);
    return { success: false, message: 'サーバーエラーが発生しました: ' + e.message };
  }
}

/**
 * ユーザーのカレンダーリストを取得します。
 * @returns {Array<Object>} カレンダーのリスト。各オブジェクトは {id: string, summary: string} を含みます。
 */
function getCalendars() {
  try {
    const calendars = Calendar.CalendarList.list({ showHidden: false });
    return calendars.items.map(calendar => ({
      id: calendar.id,
      summary: calendar.summary
    }));
  } catch (e) {
    console.error('Error in getCalendars: ' + e.toString());
    // エラーをクライアントに伝達するためにオブジェクトとして返すこともできますが、
    // ここでは単純化のため空の配列を返します。
    return [];
  }
}

/**
 * 特定のカレンダーから今後のイベントを取得します。
 * @param {string} calendarId 取得元のカレンダーID。
 * @returns {Array<Object>} イベントのリスト。各オブジェクトは {id: string, summary: string} を含みます。
 */
function getEvents(calendarId) {
  if (!calendarId) {
    return [];
  }
  try {
    const now = new Date();
    // 取得するイベントの期間を制限（例：今後30日間）
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const events = Calendar.Events.list(calendarId, {
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50 // 取得するイベントの最大数
    });

    return events.items
      .filter(event => event.status !== 'cancelled' && event.start.dateTime) // 終日イベントやキャンセルされたイベントを除外
      .map(event => {
        // イベントの開始日時をフォーマットしてサマリーに追加
        const startTime = new Date(event.start.dateTime).toLocaleString('ja-JP');
        return {
          id: event.id,
          summary: `${event.summary} (${startTime})`
        };
      });
  } catch (e) {
    console.error(`Error in getEvents for calendar ${calendarId}: ` + e.toString());
    return [];
  }
}
