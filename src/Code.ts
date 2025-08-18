/**
 * @OnlyCurrentDoc
 */

// Define custom types for clarity
type AppResponse = {
  success: boolean;
  message: string;
};

type CalendarInfo = {
  id: string;
  summary: string;
};

type EventInfo = {
  id:string;
  summary: string;
};


/**
 * Web アプリの HTML を提供します。
 * @returns {GoogleAppsScript.HTML.HtmlOutput} レンダリングされる HTML 出力。
 */
function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createHtmlOutputFromFile('index.html')
      .setTitle('Google カレンダー 会議 URL 編集ツール');
}

/**
 * Google カレンダーのイベントの会議情報を更新します。
 * この関数はクライアントサイドのスクリプトから呼び出されることを想定しています。
 *
 * @param {string} calendarId カレンダーの ID。
 * @param {string} eventId イベントの ID。
 * @param {string} newUri ビデオ会議の新しい URI。
 * @returns {AppResponse} 成功ステータスとメッセージを含む結果オブジェクト。
 */
function updateConferenceData(calendarId: string, eventId: string, newUri: string): AppResponse {
  // 入力を検証
  if (!calendarId || !eventId || !newUri) {
    return { success: false, message: 'カレンダー ID、イベント ID、新しい URI は必須です。' };
  }

  try {
    if (!Calendar.Events) {
        return { success: false, message: 'Calendar API が有効になっていません。' };
    }
    // 1. Calendar 上級サービスを使用してイベントを取得します。
    const event: GoogleAppsScript.Calendar.Schema.Event = Calendar.Events.get(calendarId, eventId);

    // 2. conferenceData と entryPoints が存在するか確認します。
    if (!event.conferenceData || !event.conferenceData.entryPoints || event.conferenceData.entryPoints.length === 0) {
      return { success: false, message: 'このイベントには編集可能なビデオ会議情報がありません。' };
    }

    // 3. 最初の 'video' エントリーポイントを見つけて、その URI を更新します。
    let updated = false;
    for (const entryPoint of event.conferenceData.entryPoints) {
      if (entryPoint.entryPointType === 'video') {
        entryPoint.uri = newUri;
        updated = true;
        break; // 最初のものを更新した後に停止します。
      }
    }

    if (!updated) {
        return { success: false, message: '更新対象のビデオ会議情報 (entryPointType="video") が見つかりませんでした。' };
    }

    // 4. patch リクエストのリソースを作成します。更新するフィールドのみを含む必要があります。
    const resource: GoogleAppsScript.Calendar.Schema.Event = {
      conferenceData: event.conferenceData
    };

    // 5. イベントにパッチを適用します。
    // conferenceDataVersion: 1 は、Google Meet が会議情報を自動更新するのを防ぐために必要です。
    Calendar.Events.patch(resource, calendarId, eventId, {
      conferenceDataVersion: 1
    });

    return { success: true, message: '会議情報を正常に更新しました。' };

  } catch (e: any) {
    // デバッグ用にエラーをログに記録し、ユーザーフレンドリーなメッセージを返します。
    console.error('Error in updateConferenceData: ' + e.toString() + ' Stack: ' + e.stack);
    return { success: false, message: 'サーバーエラーが発生しました: ' + e.message };
  }
}

/**
 * ユーザーのカレンダーリストを取得します。
 * @returns {CalendarInfo[]} カレンダーのリスト。
 */
function getCalendars(): CalendarInfo[] {
  try {
    if (!Calendar.CalendarList) {
      console.error('Calendar API が有効になっていません。');
      return [];
    }
    const calendars = Calendar.CalendarList.list({ showHidden: false });
    if (!calendars.items) {
      return [];
    }
    return calendars.items
      .filter((calendar): calendar is { id: string; summary: string } => !!calendar.id && !!calendar.summary)
      .map(calendar => ({
        id: calendar.id,
        summary: calendar.summary
      }));
  } catch (e: any) {
    console.error('Error in getCalendars: ' + e.toString());
    return [];
  }
}

/**
 * 特定のカレンダーから今後のイベントを取得します。
 * @param {string} calendarId 取得元のカレンダー ID。
 * @returns {EventInfo[]} イベントのリスト。
 */
function getEvents(calendarId: string): EventInfo[] {
  if (!calendarId) {
    return [];
  }
  try {
    if (!Calendar.Events) {
      console.error('Calendar API が有効になっていません。');
      return [];
    }
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const events = Calendar.Events.list(calendarId, {
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50
    });

    if (!events.items) {
      return [];
    }

    return events.items
      .filter((event): event is GoogleAppsScript.Calendar.Schema.Event & { id: string; start: { dateTime: string } } =>
        !!event.id &&
        event.status !== 'cancelled' &&
        !!event.start &&
        !!event.start.dateTime
      )
      .map(event => {
        // イベントの開始日時をフォーマットしてサマリーに追加
        const startTime = new Date(event.start.dateTime).toLocaleString('ja-JP');
        return {
          id: event.id,
          summary: `${event.summary} (${startTime})`
        };
      });
  } catch (e: any) {
    console.error(`Error in getEvents for calendar ${calendarId}: ` + e.toString());
    return [];
  }
}
