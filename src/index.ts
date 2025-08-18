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

// Based on https://developers.google.com/workspace/calendar/api/v3/reference/events#resource
type ConferenceData = GoogleAppsScript.Calendar.Schema.ConferenceData;


/**
 * @fileoverview This file serves the main HTML file for the web app and
 * includes a utility function for templating.
 */

/**
 * Includes the content of another file in the current HTML template.
 * This function is used in scriptlets (<%!= ... %>) to include JavaScript
 * and CSS files that are compiled by the `deploy-ui` script.
 *
 * @param {string} filename The name of the file to include. The file should
 *     be in the `dist` directory.
 * @returns {string} The content of the file.
 */
function include(filename: string): string {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Serves the main HTML file for the web application.
 * This function is called when a user visits the web app URL.
 *
 * @returns {GoogleAppsScript.HTML.HtmlOutput} The HTML output to be rendered.
 */
function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createTemplateFromFile('ui.html')
    .evaluate()
    .setTitle('Google Calendar Conference Editor');
}

/**
 * Google カレンダーのイベントの会議情報を更新します。
 * この関数はクライアントサイドのスクリプトから呼び出されることを想定しています。
 *
 * @param {string} calendarId カレンダーの ID。
 * @param {string} eventId イベントの ID。
 * @param {ConferenceData | null} conferenceData 更新する会議情報。null の場合は削除。
 * @returns {AppResponse} 成功ステータスとメッセージを含む結果オブジェクト。
 */
function updateConferenceData(calendarId: string, eventId: string, conferenceData: ConferenceData | null): AppResponse {
  // 入力を検証
  if (!calendarId || !eventId) {
    return { success: false, message: 'カレンダー ID、イベント ID は必須です。' };
  }

  try {
    if (!Calendar.Events) {
        return { success: false, message: 'Calendar API が有効になっていません。' };
    }

    // patch リクエストのリソースを作成します。
    const resource: GoogleAppsScript.Calendar.Schema.Event = {
      // @ts-ignore According to API docs, null should be used to clear the field, but the type definition expects undefined.
      conferenceData: conferenceData
    };

    // イベントにパッチを適用します。
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
 * 特定のイベントの会議情報を取得します。
 * @param {string} calendarId カレンダーの ID。
 * @param {string} eventId イベントの ID。
 * @returns {ConferenceData} 会議情報。
 */
function getConferenceData(calendarId: string, eventId: string): ConferenceData {
  try {
    if (!Calendar.Events) {
      throw new Error('Calendar API が有効になっていません。');
    }
    const event = Calendar.Events.get(calendarId, eventId);
    return event.conferenceData || { entryPoints: [] }; // データがない場合はデフォルトの空オブジェクトを返す
  } catch (e: any) {
    console.error('Error in getConferenceData: ' + e.toString());
    // エラーが発生した場合も、フロントエンドが処理しやすいようにデフォルトオブジェクトを返す
    return { entryPoints: [] };
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
