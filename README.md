<!--
Copyright 2025 ita.kosu55

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
# Google Calendar 会議情報エディター

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)
![Production Deployment](https://github.com/iusok3386/gcal-conference-editor/actions/workflows/production.yml/badge.svg)
<!-- JULES-BADGE-START -->
![Jules's contribution](https://img.shields.io/badge/Jules's%20contribution-0%25-715cd7)
<!-- JULES-BADGE-END -->

このリポジトリは、Google Calendar の予定に含まれる会議情報 (`conferenceData`) を編集するための Web アプリケーションです。
Google Meet 以外の任意の会議情報（例: YouTube Live, Discord）をカレンダーの予定に簡単に追加、編集、削除することができます。

## ✨ 主な機能

- **カレンダー連携:** 編集権限のある Google Calendar の予定を検索・表示します。
- **会議情報の編集:** 対象の予定を選択し、会議情報を自由に追加・編集・削除できます。
- **フォーム & JSON 対応:** 使いやすいフォーム入力と、詳細な設定が可能な JSON エディターの両方で編集が可能です。
- **入力サポート:** URL のフォーマットチェックや、サポート外ドメインの警告など、入力支援機能があります。

## 🚀 使い方 (Web アプリ)

デプロイされた Web アプリにアクセスし、以下の手順で操作します。

1.  **Step 1: カレンダーを選択:** ドロップダウンから、編集したい予定が含まれるカレンダーを選択します。
2.  **Step 2: 予定を検索:**
    - **期間:** 予定を検索する期間を指定します。
    - **検索キーワード:** タイトルや説明文に含まれるキーワードで、さらに絞り込むことができます。
    - **検索ボタン:** クリックすると、条件に一致する予定が下に一覧表示されます。
3.  **Step 3: 会議情報を編集:**
    - 編集したい予定の右側にある **編集アイコン** をクリックします。
    - ダイアログが表示されるので、「フォーム」または「JSON」タブを使って会議情報を入力・編集します。
    - **保存ボタン** をクリックすると、カレンダーに反映されます。

## 🛠️ 開発とデプロイ

このリポジトリを自身の環境で開発・デプロイする手順を説明します。

### 1. 前提条件

- [Node.js](https://nodejs.org/) (v22 以上)
- [npm](https://www.npmjs.com/) (Node.js に付属)

### 2. インストール

リポジトリをクローンし、以下のコマンドで依存関係をインストールします。

```bash
npm install
```

### 3. Google アカウントへのログイン

Google Apps Script プロジェクトを操作するために、`clasp` CLI を使って Google アカウントにログインします。

```bash
npx clasp login
```

ブラウザが開き、ログインと権限の許可を求められますので、承認してください。

### 4. デプロイ先の設定

デプロイする Google Apps Script プロジェクトを指定するための設定ファイルを作成します。

1.  リポジトリのルートにある `.clasp.json.sample` ファイルをコピーし、`.clasp-dev.json` (開発用) または `.clasp-prod.json` (本番用) という名前で新しいファイルを作成します。
2.  作成したファイルを開き、`[TODO: ...]` の部分を実際の値に書き換えます。
    - `scriptId`: あなたの Google Apps Script プロジェクトのスクリプト ID を設定します。新しいプロジェクトの場合は、`npx clasp create --type webapp --title "Calendar Conference Editor"` を実行して作成できます。

### 5. デプロイ

以下のコマンドで、開発環境または本番環境にデプロイします。

**開発環境へのデプロイ:**

```bash
npm run deploy
```

**本番環境へのデプロイ:**

```bash
npm run deploy:prod
```

### 6. ローカルでの UI 開発

フロントエンド (Angular) の UI をローカルで確認しながら開発する場合は、以下のコマンドを実行します。

```bash
npm run serve-ui
```

`http://localhost:4200` で開発サーバーが起動します。
(注意: ローカルサーバーでは `google.script.run` が動作しないため、バックエンドとの連携はできません。)
