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
