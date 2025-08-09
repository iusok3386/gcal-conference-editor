# gcal-conference-editor

A Google Apps Script (GAS) tool to edit the conference data URI of a Google Calendar event. This is useful for changing video conference links (like Zoom, Teams, etc.) that are otherwise not editable through the standard Google Calendar interface.

## Features

- Provides a simple web interface to specify the event and the new conference URI.
- Updates the event's conference data using the Google Calendar API.

## Setup and Deployment

This project uses `clasp`, the command-line tool for Google Apps Script, to manage files locally.

### 1. Initial Setup (Local Environment)

You need to have [Node.js](https://nodejs.org/) and `npm` installed.

1.  **Install `clasp`:**
    ```bash
    npm install -g @google/clasp
    ```

2.  **Login to Google:**
    Authorize `clasp` to access your Google account. This will open a browser window.
    ```bash
    clasp login
    ```

3.  **Clone this repository and create an Apps Script Project:**
    Get the code, navigate into the directory, and then use `clasp` to create a corresponding project on Google Drive.
    ```bash
    git clone https://github.com/your-username/gcal-conference-editor.git
    cd gcal-conference-editor
    clasp create --type standalone --title "gcal-conference-editor" --rootDir .
    ```

4.  **Push the files:**
    Upload the local `Code.gs`, `index.html`, and `appsscript.json` to your new Apps Script project.
    ```bash
    clasp push
    ```

### 2. Enable Google Calendar API

For the script to work, you **must** enable the Google Calendar API in the associated Google Cloud project.

1.  **Open the Apps Script Project:**
    Run `clasp open`. This will open your project in the Apps Script online editor.

2.  **Find the GCP Project Number:**
    In the Apps Script editor, go to **Project Settings** (⚙️ icon on the left). Under "Google Cloud Platform (GCP) Project", copy the **Project Number**.

3.  **Open Google Cloud Console:**
    Go to the [Google Cloud Console API Library](https://console.cloud.google.com/apis/library).

4.  **Select the Correct Project:**
    At the top of the page, click the project dropdown. A search box will appear. Paste the project number you copied to find and select the correct GCP project. It will likely be named `Apps Script...` or similar.

5.  **Enable the Calendar API:**
    In the API Library, search for "Google Calendar API", select it, and click the **Enable** button.

### 3. Deploy as a Web App

To use the web interface, you need to deploy the script.

1.  **Create a Deployment:**
    In the Apps Script editor (opened via `clasp open`):
    - Click **Deploy** > **New deployment**.
    - Next to "Select type", click the gear icon (⚙️) and choose **Web app**.
    - In the configuration:
        - **Description:** (Optional) Add a description like "Conference URI Editor".
        - **Execute as:** Select **User accessing the web app**.
        - **Who has access:** Select who can use the app. For personal use, **Only myself** is safest.
    - Click **Deploy**.

2.  **Authorize Permissions:**
    The first time you deploy, you will be prompted to authorize the script's permissions (e.g., access your calendar). Click **Authorize access** and follow the on-screen instructions. You may see a "Google hasn't verified this app" screen; click "Advanced" and then "Go to [your project name] (unsafe)" to proceed.

3.  **Get the Web App URL:**
    After deployment, you will be given a **Web app URL**. This is the link to your finished application. Copy and save it.

## How to Use

1.  **Open the Web App URL** you received after deployment.
2.  **Find the Event ID:**
    - Open Google Calendar.
    - Click on the event you want to edit.
    - In the "More options" (three dots) menu, click "Troubleshooting info".
    - Copy the `Event ID` from the information that appears. It will look something like `abc123def456@google.com`.
3.  **Fill in the form on your web app:**
    - **Calendar ID:** This is usually `primary` for your main calendar.
    - **Event ID:** Paste the ID you just copied.
    - **New Conference URI:** Enter the new link for your video meeting (e.g., a Zoom or Teams link).
4.  **Click "Update Conference Info"**.
5.  A status message will appear indicating if the update was successful.