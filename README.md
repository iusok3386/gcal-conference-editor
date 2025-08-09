# gcal-conference-editor

A Google Apps Script (GAS) tool to edit the conference data URI of a Google Calendar event. This is useful for changing video conference links (like Zoom, Teams, etc.) that are otherwise not editable through the standard Google Calendar interface.

## Features

- Provides a simple web interface to specify the event and the new conference URI.
- Updates the event's conference data using the Google Calendar API.

## Setup and Deployment

This project uses `clasp`, the command-line tool for Google Apps Script, and Node.js for setup.

### 1. Initial Setup

You need to have [Node.js](https://nodejs.org/) and `npm` installed.

1.  **Clone this repository:**
    ```bash
    git clone https://github.com/your-username/gcal-conference-editor.git
    cd gcal-conference-editor
    ```

2.  **Install Dependencies:**
    This will install `clasp` and other necessary packages locally.
    ```bash
    npm install
    ```

3.  **Login to Google:**
    Authorize `clasp` to access your Google account.
    ```bash
    npx clasp login
    ```

4.  **Create and Link Apps Script Project:**
    First, create a new, empty standalone script project at [script.google.com](https://script.google.com/home/projects/create).
    After creating it, run the setup script below. It will ask for the **Script ID**, which you can find in the Project Settings (⚙️ icon) of your new Apps Script project.
    ```bash
    npm run setup
    ```

5.  **Push the files:**
    This command will upload the files from your `src` directory (`Code.gs`, `index.html`, `appsscript.json`) to your Apps Script project.
    ```bash
    npx clasp push
    ```

### 2. Deploy as a Web App

To use the web interface, you need to deploy the script.

1.  **Open the Apps Script Project:**
    Run the following command to open your project in the Apps Script online editor.
    ```bash
    npx clasp open-script
    ```

2.  **Create a Deployment:**
    In the Apps Script editor:
    - Click **Deploy** > **New deployment**.
    - Next to "Select type", click the gear icon (⚙️) and choose **Web app**.
    - In the configuration:
        - **Description:** (Optional) Add a description like "Conference URI Editor".
        - **Execute as:** Select **User accessing the web app**.
        - **Who has access:** Select who can use the app. For personal use, **Only myself** is safest.
    - Click **Deploy**.

3.  **Authorize Permissions:**
    The first time you deploy, you will be prompted to authorize the script's permissions. Click **Authorize access** and follow the on-screen instructions. You may see a "Google hasn't verified this app" screen; click "Advanced" and then "Go to [your project name] (unsafe)" to proceed.

4.  **Get the Web App URL:**
    After deployment, you will be given a **Web app URL**. This is the link to your finished application.

## How to Use

1.  **Open the Web App URL** you received after deployment.
2.  **Fill in the form:**
    - **Calendar ID:** This is usually `primary` for your main calendar.
    - **Event ID:** Finding the Event ID can be tricky. Currently, you need to get it programmatically via the API or from other developer tools. Improving this is a planned future enhancement.
    - **New Conference URI:** Enter the new link for your video meeting.
3.  **Click "Update Conference Info"**.
4.  A status message will appear indicating if the update was successful.