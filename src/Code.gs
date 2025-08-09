/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of authorization,
 * although the manifest file (`appsscript.json`) is the definitive source.
 */

/**
 * Serves the HTML for the web app.
 * @returns {HtmlOutput} The HTML output to be rendered.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index.html')
      .setTitle('gcal-conference-editor');
}

/**
 * Updates the conference data for a Google Calendar event.
 * This function is intended to be called from the client-side script.
 *
 * @param {string} calendarId The ID of the calendar.
 * @param {string} eventId The ID of the event.
 * @param {string} newUri The new URI for the video conference.
 * @returns {object} A result object with success status and a message.
 */
function updateConferenceData(calendarId, eventId, newUri) {
  // Validate inputs
  if (!calendarId || !eventId || !newUri) {
    return { success: false, message: 'カレンダーID、イベントID、新しいURIは必須です。' };
  }

  try {
    // 1. Get the event using the Calendar advanced service.
    // This requires the Calendar API to be enabled in both the Apps Script project
    // and the associated Google Cloud Platform project.
    const event = Calendar.Events.get(calendarId, eventId);

    // 2. Check if conferenceData and entryPoints exist.
    if (!event.conferenceData || !event.conferenceData.entryPoints || event.conferenceData.entryPoints.length === 0) {
      return { success: false, message: 'このイベントには編集可能なビデオ会議情報がありません。' };
    }

    // 3. Find the first 'video' entry point and update its URI.
    let updated = false;
    for (let i = 0; i < event.conferenceData.entryPoints.length; i++) {
      if (event.conferenceData.entryPoints[i].entryPointType === 'video') {
        event.conferenceData.entryPoints[i].uri = newUri;
        updated = true;
        break; // Stop after updating the first one.
      }
    }

    if (!updated) {
        return { success: false, message: '更新対象のビデオ会議情報 (entryPointType="video") が見つかりませんでした。' };
    }

    // 4. Create the resource for the patch request. It should only contain the fields to be updated.
    const resource = {
      conferenceData: event.conferenceData
    };

    // 5. Patch the event.
    // conferenceDataVersion: 1 is required to prevent Google Meet from auto-updating the conference.
    Calendar.Events.patch(resource, calendarId, eventId, {
      conferenceDataVersion: 1
    });

    return { success: true, message: '会議情報を正常に更新しました。' };

  } catch (e) {
    // Log the error for debugging and return a user-friendly message.
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
    // エラーをクライアントに伝達するために、オブジェクトとして返すこともできます。
    // ここでは単純化のため、空の配列を返します。
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
